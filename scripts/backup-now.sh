#!/bin/bash

###############################################################################
# Tailtown Immediate Database Backup Script
# 
# Creates a comprehensive backup of all databases RIGHT NOW
# Perfect for pre-production backups before deployment
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
DATE=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║   Tailtown Database Backup                 ║"
echo "║   Comprehensive Pre-Production Backup      ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✓${NC} Created backup directory: $BACKUP_DIR"
echo ""

# Function to backup a Docker database
backup_docker_db() {
    local container_name=$1
    local db_name=$2
    local output_file=$3
    
    echo -e "${BLUE}[Backing up]${NC} $db_name from $container_name..."
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        docker exec "$container_name" pg_dump -U postgres "$db_name" > "$output_file" 2>/dev/null
        
        if [ $? -eq 0 ] && [ -s "$output_file" ]; then
            # Compress the backup
            gzip "$output_file"
            local size=$(du -h "${output_file}.gz" | cut -f1)
            local lines=$(gunzip -c "${output_file}.gz" | wc -l | tr -d ' ')
            echo -e "${GREEN}✓${NC} Backed up $db_name: $size ($lines lines)"
            return 0
        else
            echo -e "${RED}✗${NC} Failed to backup $db_name"
            rm -f "$output_file"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠${NC}  Container $container_name not running - skipping"
        return 1
    fi
}

# Backup all databases
echo -e "${BLUE}[1/4]${NC} Backing up Customer Database..."
backup_docker_db "tailtown-customer-db-1" "customer" "$BACKUP_DIR/customer_${DATE}.sql"
CUSTOMER_STATUS=$?
echo ""

echo -e "${BLUE}[2/4]${NC} Backing up Reservation Database..."
# Try both possible container names
backup_docker_db "postgres-reservation" "reservation" "$BACKUP_DIR/reservation_${DATE}.sql"
RESERVATION_STATUS=$?
if [ $RESERVATION_STATUS -ne 0 ]; then
    backup_docker_db "tailtown-reservation-db-1" "reservation" "$BACKUP_DIR/reservation_${DATE}.sql"
    RESERVATION_STATUS=$?
fi
echo ""

echo -e "${BLUE}[3/4]${NC} Backing up Payment Database (if exists)..."
backup_docker_db "tailtown-payment-db-1" "payment" "$BACKUP_DIR/payment_${DATE}.sql"
PAYMENT_STATUS=$?
if [ $PAYMENT_STATUS -ne 0 ]; then
    backup_docker_db "tailtown-postgres" "payment" "$BACKUP_DIR/payment_${DATE}.sql"
    PAYMENT_STATUS=$?
fi
echo ""

# Create a manifest file
echo -e "${BLUE}[4/4]${NC} Creating backup manifest..."
cat > "$BACKUP_DIR/MANIFEST.txt" << EOF
Tailtown Database Backup
========================

Backup Date: $(date '+%Y-%m-%d %H:%M:%S')
Backup Location: $BACKUP_DIR

Databases Backed Up:
EOF

if [ $CUSTOMER_STATUS -eq 0 ]; then
    echo "✓ Customer Database: $(ls -lh $BACKUP_DIR/customer_*.sql.gz 2>/dev/null | awk '{print $5}')" >> "$BACKUP_DIR/MANIFEST.txt"
else
    echo "✗ Customer Database: FAILED" >> "$BACKUP_DIR/MANIFEST.txt"
fi

if [ $RESERVATION_STATUS -eq 0 ]; then
    echo "✓ Reservation Database: $(ls -lh $BACKUP_DIR/reservation_*.sql.gz 2>/dev/null | awk '{print $5}')" >> "$BACKUP_DIR/MANIFEST.txt"
else
    echo "✗ Reservation Database: FAILED" >> "$BACKUP_DIR/MANIFEST.txt"
fi

if [ $PAYMENT_STATUS -eq 0 ]; then
    echo "✓ Payment Database: $(ls -lh $BACKUP_DIR/payment_*.sql.gz 2>/dev/null | awk '{print $5}')" >> "$BACKUP_DIR/MANIFEST.txt"
else
    echo "✗ Payment Database: Not found or failed" >> "$BACKUP_DIR/MANIFEST.txt"
fi

cat >> "$BACKUP_DIR/MANIFEST.txt" << EOF

Total Backup Size: $(du -sh $BACKUP_DIR | cut -f1)

Files:
$(ls -lh $BACKUP_DIR/*.sql.gz 2>/dev/null | awk '{print $9, "(" $5 ")"}')

To restore a database:
  gunzip < customer_${DATE}.sql.gz | docker exec -i tailtown-customer-db-1 psql -U postgres customer
  gunzip < reservation_${DATE}.sql.gz | docker exec -i tailtown-reservation-db-1 psql -U postgres reservation

EOF

echo -e "${GREEN}✓${NC} Manifest created"
echo ""

# Display summary
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║   ✅ Backup Complete!                      ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Backup Location: $BACKUP_DIR"
echo ""
echo "Summary:"
[ $CUSTOMER_STATUS -eq 0 ] && echo -e "  ${GREEN}✓${NC} Customer Database" || echo -e "  ${RED}✗${NC} Customer Database"
[ $RESERVATION_STATUS -eq 0 ] && echo -e "  ${GREEN}✓${NC} Reservation Database" || echo -e "  ${RED}✗${NC} Reservation Database"
[ $PAYMENT_STATUS -eq 0 ] && echo -e "  ${GREEN}✓${NC} Payment Database" || echo -e "  ${YELLOW}⚠${NC}  Payment Database (optional)"
echo ""
echo "Total Size: $(du -sh $BACKUP_DIR | cut -f1)"
echo ""
echo "View manifest: cat $BACKUP_DIR/MANIFEST.txt"
echo ""

# Create a "latest" symlink
LATEST_LINK="$PROJECT_ROOT/backups/latest"
rm -f "$LATEST_LINK"
ln -s "$BACKUP_DIR" "$LATEST_LINK"
echo -e "${BLUE}ℹ${NC}  Latest backup symlink: $LATEST_LINK"
echo ""

# Count total backups
TOTAL_BACKUPS=$(find "$PROJECT_ROOT/backups" -maxdepth 1 -type d -name "202*" | wc -l | tr -d ' ')
echo -e "${BLUE}ℹ${NC}  Total backups: $TOTAL_BACKUPS"
echo ""

# Warn if backup is large
BACKUP_SIZE_KB=$(du -sk "$BACKUP_DIR" | cut -f1)
if [ $BACKUP_SIZE_KB -gt 1000000 ]; then  # > 1GB
    echo -e "${YELLOW}⚠${NC}  Large backup size detected. Consider:"
    echo "  - Archiving old backups"
    echo "  - Using external storage (S3, etc.)"
    echo ""
fi

# Success message
if [ $CUSTOMER_STATUS -eq 0 ] && [ $RESERVATION_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓ All critical databases backed up successfully!${NC}"
    echo ""
    echo "You're ready for production deployment! 🚀"
    exit 0
else
    echo -e "${YELLOW}⚠ Some databases failed to backup${NC}"
    echo "Check the errors above and try again"
    exit 1
fi
