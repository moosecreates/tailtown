#!/bin/bash

###############################################################################
# Tailtown Database Backup Script
# 
# This script backs up both customer and reservation databases
# Run daily via cron: 0 2 * * * /path/to/backup-database.sh
###############################################################################

# Configuration
BACKUP_DIR="/var/backups/tailtown"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/tailtown/backup.log"

# Database credentials (set these or use environment variables)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
CUSTOMER_DB="${CUSTOMER_DB:-tailtown_customer_production}"
RESERVATION_DB="${RESERVATION_DB:-tailtown_reservation_production}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR" || error_exit "Failed to create backup directory"
mkdir -p "$(dirname "$LOG_FILE")" || error_exit "Failed to create log directory"

log "Starting database backup..."

# Backup customer database
log "Backing up customer database..."
CUSTOMER_BACKUP="$BACKUP_DIR/customer_${DATE}.sql"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$CUSTOMER_DB" > "$CUSTOMER_BACKUP" 2>> "$LOG_FILE"

if [ $? -eq 0 ]; then
    # Compress the backup
    gzip "$CUSTOMER_BACKUP"
    CUSTOMER_SIZE=$(du -h "${CUSTOMER_BACKUP}.gz" | cut -f1)
    log "✓ Customer database backup completed: ${CUSTOMER_SIZE}"
else
    error_exit "Customer database backup failed"
fi

# Backup reservation database
log "Backing up reservation database..."
RESERVATION_BACKUP="$BACKUP_DIR/reservation_${DATE}.sql"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$RESERVATION_DB" > "$RESERVATION_BACKUP" 2>> "$LOG_FILE"

if [ $? -eq 0 ]; then
    # Compress the backup
    gzip "$RESERVATION_BACKUP"
    RESERVATION_SIZE=$(du -h "${RESERVATION_BACKUP}.gz" | cut -f1)
    log "✓ Reservation database backup completed: ${RESERVATION_SIZE}"
else
    error_exit "Reservation database backup failed"
fi

# Remove old backups
log "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
REMAINING=$(find "$BACKUP_DIR" -name "*.sql.gz" -type f | wc -l)
log "✓ Cleanup completed. ${REMAINING} backup files remaining."

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Total backup size: ${TOTAL_SIZE}"

log "Backup completed successfully!"

# Optional: Upload to S3 or other cloud storage
# Uncomment and configure if needed
# aws s3 sync "$BACKUP_DIR" s3://your-bucket/tailtown-backups/

exit 0
