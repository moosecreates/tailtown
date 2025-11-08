#!/bin/bash

# Database Restore Script for Tailtown
# Restores PostgreSQL database from encrypted backup
# Usage: ./restore-database.sh <backup-file>

set -e

# Check if backup file provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file.enc>"
    echo ""
    echo "Examples:"
    echo "  $0 /var/backups/tailtown/database/daily/tailtown_backup_20251107_020000.sql.enc"
    echo "  $0 s3://tailtown-backups/database/daily/tailtown_backup_20251107_020000.sql.enc"
    exit 1
fi

BACKUP_FILE="$1"

# Database credentials
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-tailtown}"
DB_USER="${DB_USER:-postgres}"

# Encryption key
if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
    echo "❌ ERROR: BACKUP_ENCRYPTION_KEY not set!"
    exit 1
fi

echo "🔄 Starting database restore"
echo "Backup file: $BACKUP_FILE"
echo "Target database: $DB_NAME on $DB_HOST:$DB_PORT"
echo ""

# Warning
echo "⚠️  WARNING: This will OVERWRITE the current database!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# 1. Download from S3 if needed
if [[ $BACKUP_FILE == s3://* ]]; then
    echo "Downloading from S3..."
    LOCAL_FILE="/tmp/$(basename $BACKUP_FILE)"
    aws s3 cp "$BACKUP_FILE" "$LOCAL_FILE"
    BACKUP_FILE="$LOCAL_FILE"
    echo "✅ Downloaded to $LOCAL_FILE"
fi

# 2. Decrypt backup
echo "Decrypting backup..."
DECRYPTED_FILE="${BACKUP_FILE%.enc}"
openssl enc -aes-256-cbc -d -pbkdf2 \
  -in "$BACKUP_FILE" \
  -out "$DECRYPTED_FILE" \
  -pass pass:"${BACKUP_ENCRYPTION_KEY}"

if [ $? -eq 0 ]; then
    echo "✅ Backup decrypted"
else
    echo "❌ Decryption failed!"
    exit 1
fi

# 3. Verify backup
echo "Verifying backup..."
pg_restore --list "$DECRYPTED_FILE" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backup verified"
else
    echo "❌ Backup verification failed!"
    rm "$DECRYPTED_FILE"
    exit 1
fi

# 4. Drop existing database (with confirmation)
echo "Dropping existing database..."
PGPASSWORD="$DB_PASSWORD" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" --if-exists
echo "✅ Database dropped"

# 5. Create new database
echo "Creating new database..."
PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
echo "✅ Database created"

# 6. Restore backup
echo "Restoring backup..."
PGPASSWORD="$DB_PASSWORD" pg_restore \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --verbose \
  "$DECRYPTED_FILE" 2>&1 | grep -v "^pg_restore:"

if [ $? -eq 0 ]; then
    echo "✅ Backup restored successfully"
else
    echo "❌ Restore failed!"
    rm "$DECRYPTED_FILE"
    exit 1
fi

# 7. Verify restore
echo "Verifying restore..."
CUSTOMER_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"Customer\"" 2>/dev/null | tr -d ' ')
echo "Customers in database: $CUSTOMER_COUNT"

if [ "$CUSTOMER_COUNT" -gt 0 ]; then
    echo "✅ Restore verification passed"
else
    echo "⚠️  Warning: No customers found in database"
fi

# 8. Cleanup
rm "$DECRYPTED_FILE"
if [[ $BACKUP_FILE == /tmp/* ]]; then
    rm "$BACKUP_FILE"
fi

echo ""
echo "🎉 Database restore completed successfully!"
echo "Database: $DB_NAME"
echo "Customers: $CUSTOMER_COUNT"
