#!/bin/bash

###############################################################################
# Tailtown Database Restore Script
# 
# This script restores databases from backup files
# Usage: ./restore-database.sh <backup-file>
###############################################################################

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
LOG_FILE="/var/log/tailtown/restore.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error_exit() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Check if backup file provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file>"
    echo ""
    echo "Example:"
    echo "  $0 /var/backups/tailtown/customer_20251102_020000.sql.gz"
    echo ""
    echo "Available backups:"
    ls -lh /var/backups/tailtown/*.sql.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    error_exit "Backup file not found: $BACKUP_FILE"
fi

# Determine database type from filename
if [[ "$BACKUP_FILE" == *"customer"* ]]; then
    DB_NAME="${CUSTOMER_DB:-tailtown_customer_production}"
    DB_TYPE="customer"
elif [[ "$BACKUP_FILE" == *"reservation"* ]]; then
    DB_NAME="${RESERVATION_DB:-tailtown_reservation_production}"
    DB_TYPE="reservation"
else
    error_exit "Cannot determine database type from filename"
fi

# Confirm restore
echo -e "${YELLOW}WARNING:${NC} This will restore the ${DB_TYPE} database from:"
echo "  File: $BACKUP_FILE"
echo "  Database: $DB_NAME"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

log "Starting database restore for ${DB_TYPE}..."

# Create temporary directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Decompress backup if gzipped
if [[ "$BACKUP_FILE" == *.gz ]]; then
    log "Decompressing backup file..."
    gunzip -c "$BACKUP_FILE" > "$TEMP_DIR/restore.sql"
    SQL_FILE="$TEMP_DIR/restore.sql"
else
    SQL_FILE="$BACKUP_FILE"
fi

# Stop application services
log "Stopping application services..."
pm2 stop all 2>/dev/null || true

# Drop existing connections
log "Terminating existing database connections..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME';" \
    2>> "$LOG_FILE" || true

# Drop and recreate database
log "Dropping and recreating database..."
dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>> "$LOG_FILE" || true
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" || error_exit "Failed to create database"

# Restore database
log "Restoring database from backup..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$SQL_FILE" 2>> "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "✓ Database restored successfully"
else
    error_exit "Database restore failed"
fi

# Restart application services
log "Restarting application services..."
pm2 restart all

log "Restore completed successfully!"
echo -e "${GREEN}✓${NC} Database restored from: $BACKUP_FILE"

exit 0
