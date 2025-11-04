#!/bin/bash

###############################################################################
# Tailtown Health Check Script
# 
# Monitors all services and sends alerts if any are down
# Run via cron every 5 minutes: */5 * * * * /path/to/health-check.sh
###############################################################################

# Configuration
CUSTOMER_SERVICE_URL="http://localhost:4004/health"
RESERVATION_SERVICE_URL="http://localhost:4003/health"
FRONTEND_URL="http://localhost"
ALERT_EMAIL="${ALERT_EMAIL:-admin@yourdomain.com}"
LOG_FILE="/var/log/tailtown/health-check.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

send_alert() {
    local service=$1
    local message=$2
    
    log "ALERT: $service - $message"
    
    # Send email alert (requires mailutils or sendmail)
    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "Tailtown Alert: $service Down" "$ALERT_EMAIL"
    fi
    
    # Could also integrate with Slack, PagerDuty, etc.
}

check_service() {
    local name=$1
    local url=$2
    local timeout=${3:-5}
    
    if curl -f -s --max-time "$timeout" "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name is healthy"
        log "✓ $name is healthy"
        return 0
    else
        echo -e "${RED}✗${NC} $name is DOWN"
        send_alert "$name" "$name health check failed at $url"
        return 1
    fi
}

check_pm2_process() {
    local process_name=$1
    
    if pm2 describe "$process_name" 2>/dev/null | grep -q "online"; then
        echo -e "${GREEN}✓${NC} PM2 process '$process_name' is running"
        log "✓ PM2 process '$process_name' is running"
        return 0
    else
        echo -e "${RED}✗${NC} PM2 process '$process_name' is NOT running"
        send_alert "PM2 Process" "Process '$process_name' is not running"
        
        # Attempt to restart
        log "Attempting to restart $process_name..."
        pm2 restart "$process_name"
        return 1
    fi
}

check_disk_space() {
    local threshold=90
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt "$threshold" ]; then
        echo -e "${GREEN}✓${NC} Disk space: ${usage}% used"
        log "✓ Disk space: ${usage}% used"
        return 0
    else
        echo -e "${RED}✗${NC} Disk space: ${usage}% used (threshold: ${threshold}%)"
        send_alert "Disk Space" "Disk usage is at ${usage}%"
        return 1
    fi
}

check_database() {
    local db_name=$1
    
    if psql -U postgres -d "$db_name" -c "SELECT 1" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Database '$db_name' is accessible"
        log "✓ Database '$db_name' is accessible"
        return 0
    else
        echo -e "${RED}✗${NC} Database '$db_name' is NOT accessible"
        send_alert "Database" "Database '$db_name' is not accessible"
        return 1
    fi
}

# Main health check
echo ""
echo "=== Tailtown Health Check ==="
echo "$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

FAILED=0

# Check services
echo "Checking services..."
check_service "Customer Service" "$CUSTOMER_SERVICE_URL" || ((FAILED++))
check_service "Reservation Service" "$RESERVATION_SERVICE_URL" || ((FAILED++))
check_service "Frontend" "$FRONTEND_URL" || ((FAILED++))

echo ""
echo "Checking PM2 processes..."
check_pm2_process "customer-service" || ((FAILED++))
check_pm2_process "reservation-service" || ((FAILED++))

echo ""
echo "Checking databases..."
check_database "tailtown_customer_production" || ((FAILED++))
check_database "tailtown_reservation_production" || ((FAILED++))

echo ""
echo "Checking system resources..."
check_disk_space || ((FAILED++))

# Memory check
MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ "$MEMORY_USAGE" -lt 90 ]; then
    echo -e "${GREEN}✓${NC} Memory usage: ${MEMORY_USAGE}%"
    log "✓ Memory usage: ${MEMORY_USAGE}%"
else
    echo -e "${YELLOW}⚠${NC} Memory usage: ${MEMORY_USAGE}%"
    log "⚠ Memory usage: ${MEMORY_USAGE}%"
fi

# Summary
echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All systems operational${NC}"
    log "✓ All systems operational"
    exit 0
else
    echo -e "${RED}✗ $FAILED check(s) failed${NC}"
    log "✗ $FAILED check(s) failed"
    exit 1
fi
