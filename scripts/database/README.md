# Database Backup & Restore Scripts

Quick reference for Tailtown database backup and restore operations.

---

## 🚀 Quick Start

### 1. Setup Environment Variables
```bash
# Required
export BACKUP_ENCRYPTION_KEY="your-strong-encryption-key-here"
export DB_PASSWORD="your-database-password"

# Optional (for S3 backups)
export S3_BUCKET="tailtown-backups"
export S3_REGION="us-east-1"
```

### 2. Run Manual Backup
```bash
./scripts/database/backup-database.sh
```

### 3. Restore from Backup
```bash
./scripts/database/restore-database.sh /path/to/backup.sql.enc
```

---

## 📋 Available Scripts

### `backup-database.sh`
Creates encrypted backup of PostgreSQL database.

**Features:**
- Compresses database (gzip level 9)
- Encrypts with AES-256
- Uploads to S3 (optional)
- Creates weekly/monthly backups automatically
- Cleans up old backups

**Usage:**
```bash
./backup-database.sh
```

### `restore-database.sh`
Restores database from encrypted backup.

**Features:**
- Downloads from S3 if needed
- Decrypts backup
- Verifies integrity
- Drops and recreates database
- Verifies restore

**Usage:**
```bash
# From local file
./restore-database.sh /var/backups/tailtown/database/daily/backup.sql.enc

# From S3
./restore-database.sh s3://tailtown-backups/database/daily/backup.sql.enc
```

---

## 🔄 Automated Backups

### Setup Cron Job
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/tailtown && ./scripts/database/backup-database.sh >> /var/log/tailtown-backup.log 2>&1
```

### Check Backup Logs
```bash
tail -f /var/log/tailtown-backup.log
```

---

## 📊 Backup Locations

### Local Backups
```
/var/backups/tailtown/database/
├── daily/     # Last 7 days
├── weekly/    # Last 4 weeks
└── monthly/   # Last 12 months
```

### S3 Backups (if configured)
```
s3://tailtown-backups/
├── database/
│   ├── daily/     # Last 7 days
│   ├── weekly/    # Last 4 weeks
│   └── monthly/   # Last 12 months (Glacier)
```

---

## 🔐 Security

### Encryption
- All backups encrypted with AES-256-CBC
- Encryption key stored in environment variable
- Never commit encryption keys to git!

### Access Control
- S3 bucket should have restricted IAM policies
- Enable MFA for bucket deletion
- Use separate AWS account for backups

---

## 🧪 Testing

### Test Backup
```bash
# Create backup
./scripts/database/backup-database.sh

# Verify backup exists
ls -lh /var/backups/tailtown/database/daily/
```

### Test Restore (to test database)
```bash
# Set test database name
export DB_NAME="tailtown_test"

# Restore
./scripts/database/restore-database.sh /path/to/backup.sql.enc

# Verify
psql -d tailtown_test -c "SELECT COUNT(*) FROM \"Customer\""

# Cleanup
dropdb tailtown_test
```

---

## 🆘 Troubleshooting

### "BACKUP_ENCRYPTION_KEY not set"
```bash
export BACKUP_ENCRYPTION_KEY="your-key-here"
```

### "pg_dump: command not found"
Install PostgreSQL client tools:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql
```

### "AWS CLI not found"
Install AWS CLI:
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### "Decryption failed"
- Check encryption key is correct
- Verify backup file is not corrupted
- Try downloading backup again if from S3

---

## 📈 Monitoring

### Check Latest Backup
```bash
ls -lht /var/backups/tailtown/database/daily/ | head -5
```

### Check Backup Size
```bash
du -sh /var/backups/tailtown/database/
```

### Check S3 Backups
```bash
aws s3 ls s3://tailtown-backups/database/daily/ --human-readable
```

---

## ⚡ Quick Commands

```bash
# Backup now
./scripts/database/backup-database.sh

# List backups
ls -lh /var/backups/tailtown/database/daily/

# Restore latest backup
LATEST=$(ls -t /var/backups/tailtown/database/daily/*.enc | head -1)
./scripts/database/restore-database.sh "$LATEST"

# Check backup age
stat -c %y /var/backups/tailtown/database/daily/*.enc | tail -1
```

---

## 📚 More Information

See [AUTOMATED-BACKUP-STRATEGY.md](/docs/operations/AUTOMATED-BACKUP-STRATEGY.md) for complete documentation.
