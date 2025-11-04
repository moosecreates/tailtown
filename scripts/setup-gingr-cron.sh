#!/bin/bash

# Setup Gingr Sync Cron Job
# Runs every 8 hours to sync data from Gingr for enabled tenants

set -e

echo "🔧 Setting up Gingr sync cron job..."

# Get the project directory
PROJECT_DIR="/opt/tailtown"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Cron job command
CRON_CMD="0 */8 * * * cd $PROJECT_DIR && /usr/bin/node scripts/run-gingr-sync.js >> logs/gingr-sync.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "run-gingr-sync.js"; then
    echo "⚠️  Gingr sync cron job already exists"
    echo ""
    echo "Current cron jobs:"
    crontab -l | grep "run-gingr-sync.js"
    echo ""
    read -p "Do you want to replace it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 0
    fi
    
    # Remove old cron job
    crontab -l | grep -v "run-gingr-sync.js" | crontab -
    echo "✓ Removed old cron job"
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

echo "✅ Gingr sync cron job installed!"
echo ""
echo "📋 Schedule: Every 8 hours (at 00:00, 08:00, 16:00)"
echo "📁 Logs: $PROJECT_DIR/logs/gingr-sync.log"
echo ""
echo "To view logs:"
echo "  tail -f $PROJECT_DIR/logs/gingr-sync.log"
echo ""
echo "To manually trigger sync:"
echo "  cd $PROJECT_DIR && node scripts/run-gingr-sync.js"
echo ""
echo "Current cron jobs:"
crontab -l
