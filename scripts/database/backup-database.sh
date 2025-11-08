#!/bin/bash

# Database Backup Script for Tailtown
# Backs up PostgreSQL database with encryption and S3 upload
# Usage: ./backup-database.sh

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/tailtown/database}"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Database credentials
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-tailtown}"
DB_USER="${DB_USER:-postgres}"

# S3 Configuration (optional)
S3_BUCKET="${S3_BUCKET:-}"
S3_REGION="${S3_REGION:-us-east-1}"

# Encryption key (REQUIRED - set in environment)
if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
    echo "❌ ERROR: BACKUP_ENCRYPTION_KEY not set!"
    echo "Set it with: export BACKUP_ENCRYPTION_KEY='your-secure-key'"
    exit 1
fi

# Create backup directories
mkdir -p "$BACKUP_DIR/daily"
mkdir -p "$BACKUP_DIR/weekly"
mkdir -p "$BACKUP_DIR/monthly"

echo "🔄 Starting database backup: $DATE"
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"

# 1. Create backup
BACKUP_FILE="$BACKUP_DIR/daily/tailtown_backup_$DATE.sql"
echo "Creating backup..."

PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --compress=9 \
  --verbose \
  --file="$BACKUP_FILE" 2>&1 | grep -v "^pg_dump:"

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $(basename $BACKUP_FILE)"
else
    echo "❌ Backup failed!"
    exit 1
fi

# 2. Verify backup integrity
echo "Verifying backup..."
pg_restore --list "$BACKUP_FILE" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backup verified successfully"
else
    echo "❌ Backup verification failed!"
    exit 1
fi

# 3. Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup size: $BACKUP_SIZE"

# 4. Encrypt backup
echo "Encrypting backup..."
openssl enc -aes-256-cbc -salt -pbkdf2 \
  -in "$BACKUP_FILE" \
  -out "$BACKUP_FILE.enc" \
  -pass pass:"${BACKUP_ENCRYPTION_KEY}" 2>/dev/null

if [ $? -eq 0 ]; then
    rm "$BACKUP_FILE"  # Remove unencrypted version
    echo "✅ Backup encrypted"
else
    echo "❌ Encryption failed!"
    exit 1
fi

# 5. Upload to S3 (if configured)
if [ ! -z "$S3_BUCKET" ]; then
    echo "Uploading to S3..."
    if command -v aws &> /dev/null; then
        aws s3 cp "$BACKUP_FILE.enc" \
          "s3://$S3_BUCKET/database/daily/$(basename $BACKUP_FILE.enc)" \
          --region "$S3_REGION" \
          --storage-class STANDARD_IA 2>&1 | grep -v "Completed"
        
        if [ $? -eq 0 ]; then
            echo "✅ Backup uploaded to S3"
        else
            echo "⚠️  S3 upload failed (backup still saved locally)"
        fi
    else
        echo "⚠️  AWS CLI not installed, skipping S3 upload"
    fi
fi

# 6. Create weekly backup (every Sunday)
if [ $(date +%u) -eq 7 ]; then
    cp "$BACKUP_FILE.enc" "$BACKUP_DIR/weekly/tailtown_backup_$DATE.sql.enc"
    echo "✅ Weekly backup created"
    
    if [ ! -z "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        aws s3 cp "$BACKUP_FILE.enc" \
          "s3://$S3_BUCKET/database/weekly/$(basename $BACKUP_FILE.enc)" \
          --region "$S3_REGION" \
          --storage-class STANDARD_IA 2>&1 | grep -v "Completed"
    fi
fi

# 7. Create monthly backup (first day of month)
if [ $(date +%d) -eq 01 ]; then
    cp "$BACKUP_FILE.enc" "$BACKUP_DIR/monthly/tailtown_backup_$DATE.sql.enc"
    echo "✅ Monthly backup created"
    
    if [ ! -z "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        aws s3 cp "$BACKUP_FILE.enc" \
          "s3://$S3_BUCKET/database/monthly/$(basename $BACKUP_FILE.enc)" \
          --region "$S3_REGION" \
          --storage-class GLACIER 2>&1 | grep -v "Completed"
    fi
fi

# 8. Cleanup old backups (retention policy)
echo "Cleaning up old backups..."
find "$BACKUP_DIR/daily" -name "*.enc" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR/weekly" -name "*.enc" -mtime +28 -delete
find "$BACKUP_DIR/monthly" -name "*.enc" -mtime +365 -delete
echo "✅ Old backups cleaned up"

# 9. Log completion
echo "$(date): Backup completed successfully - $BACKUP_FILE.enc" >> "$BACKUP_DIR/backup.log"

echo ""
echo "🎉 Backup process completed successfully!"
echo "Backup location: $BACKUP_FILE.enc"
echo "Backup size: $BACKUP_SIZE (compressed & encrypted)"
