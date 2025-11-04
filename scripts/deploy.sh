#!/bin/bash

###############################################################################
# Tailtown Production Deployment Script
# 
# This script automates the deployment process
# Usage: ./scripts/deploy.sh
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="/var/log/tailtown/deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Header
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         🚀 Tailtown Production Deployment 🚀              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    error "Do not run this script as root"
fi

# Verify we're in the project directory
cd "$PROJECT_ROOT" || error "Failed to change to project directory"

# Check for required files
log "Checking environment configuration..."
if [ ! -f ".env.production" ]; then
    error ".env.production not found. Copy from .env.production.example and configure."
fi

if [ ! -f "frontend/.env.production" ]; then
    error "frontend/.env.production not found"
fi

if [ ! -f "services/customer/.env.production" ]; then
    error "services/customer/.env.production not found"
fi

# Git status check
log "Checking git status..."
if [[ -n $(git status -s) ]]; then
    warning "You have uncommitted changes. Consider committing before deploying."
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        exit 0
    fi
fi

# Pull latest code
log "Pulling latest code from git..."
git pull origin sept25-stable || error "Git pull failed"

# Install dependencies
log "Installing dependencies..."

log "  → Customer service dependencies..."
cd services/customer
npm ci --production || error "Customer service npm install failed"

log "  → Reservation service dependencies..."
cd ../reservation-service
npm ci --production || error "Reservation service npm install failed"

log "  → Frontend dependencies..."
cd ../../frontend
npm ci --production || error "Frontend npm install failed"

cd "$PROJECT_ROOT"

# Run database migrations
log "Running database migrations..."

log "  → Customer database migrations..."
cd services/customer
npx prisma generate
npx prisma migrate deploy || error "Customer database migration failed"

log "  → Reservation database migrations..."
cd ../reservation-service
npx prisma generate
npx prisma migrate deploy || error "Reservation database migration failed"

cd "$PROJECT_ROOT"

# Build applications
log "Building applications..."

log "  → Building customer service..."
cd services/customer
npm run build || error "Customer service build failed"

log "  → Building reservation service..."
cd ../reservation-service
npm run build || error "Reservation service build failed"

log "  → Building frontend..."
cd ../../frontend
npm run build || error "Frontend build failed"

cd "$PROJECT_ROOT"

# Stop services
log "Stopping services..."
pm2 stop all || true

# Copy frontend build to web directory
log "Deploying frontend..."
sudo rm -rf /var/www/tailtown/frontend
sudo mkdir -p /var/www/tailtown/frontend
sudo cp -r frontend/build/* /var/www/tailtown/frontend/
sudo chown -R www-data:www-data /var/www/tailtown/frontend

# Start services with PM2
log "Starting services..."
pm2 start ecosystem.config.js --env production
pm2 save

# Reload Nginx
log "Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx || error "Nginx reload failed"

# Health checks
log "Running health checks..."
sleep 5

# Check customer service
if curl -f http://localhost:4004/health > /dev/null 2>&1; then
    log "  ✓ Customer service is healthy"
else
    error "Customer service health check failed"
fi

# Check reservation service
if curl -f http://localhost:4003/health > /dev/null 2>&1; then
    log "  ✓ Reservation service is healthy"
else
    error "Reservation service health check failed"
fi

# Check frontend
if curl -f http://localhost > /dev/null 2>&1; then
    log "  ✓ Frontend is accessible"
else
    warning "Frontend health check failed (may be normal if Nginx not configured)"
fi

# Display PM2 status
echo ""
log "Service status:"
pm2 status

# Success message
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         ✅ Deployment Completed Successfully! ✅          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
info "Deployment log: $LOG_FILE"
info "Monitor logs: pm2 logs"
info "View status: pm2 status"
echo ""

exit 0
