# Deployment Guide

## Quick Deploy Scripts

### Option 1: Fully Automated (Recommended)
```bash
./QUICK-DEPLOY-AUTO.sh
```
- ✅ No confirmations required
- ✅ Runs all steps automatically
- ✅ Best for regular deployments

### Option 2: With Confirmations
```bash
./QUICK-DEPLOY-NOV-6.sh
```
- ⚠️ Asks for confirmation after backup
- ⚠️ Asks for confirmation before restart
- ✅ Good for first-time deployments

---

## Important: Branch Management

### Current Situation
The server is on branch: `fix/checklist-localhost`  
Your changes are on branch: `fix/invoice-tenant-id`

### Before Deploying

**Option A: Merge to Main (Recommended for Production)**
```bash
# Locally
git checkout main
git merge fix/invoice-tenant-id
git push origin main

# Then deploy
./QUICK-DEPLOY-AUTO.sh
```

**Option B: Deploy Specific Branch**
```bash
# Edit the deployment script to pull from your branch
# Or manually switch on server:
ssh -i ~/ttkey root@129.212.178.244
cd /opt/tailtown
git fetch origin
git checkout fix/invoice-tenant-id
git pull origin fix/invoice-tenant-id
exit

# Then run deployment
./QUICK-DEPLOY-AUTO.sh
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally (`npm test`)
- [ ] Code committed and pushed to repository
- [ ] Branch merged to main (or deployment branch set)
- [ ] Database backup exists locally
- [ ] Team notified of deployment

### During Deployment
- [ ] Backup created on remote server
- [ ] Code pulled successfully
- [ ] Dependencies installed
- [ ] Migration ran without errors
- [ ] Build completed successfully
- [ ] Services restarted

### Post-Deployment
- [ ] Health check passes
- [ ] Dashboard loads correctly
- [ ] Customer count accurate (~1,157)
- [ ] Revenue numbers correct
- [ ] No errors in logs
- [ ] Test key features

---

## Rollback Procedure

If something goes wrong:

### Quick Rollback
```bash
ssh -i ~/ttkey root@129.212.178.244 'cd /opt/tailtown && git checkout HEAD~1 && cd services/customer && npm run build && pm2 restart customer-service'
```

### Database Rollback
```bash
# Find backup
ssh -i ~/ttkey root@129.212.178.244 'ls -lh ~/customer_backup_*.sql | tail -5'

# Restore (replace YYYYMMDD_HHMMSS with actual timestamp)
ssh -i ~/ttkey root@129.212.178.244 'docker exec -i tailtown-postgres psql -U postgres -d customer < ~/customer_backup_YYYYMMDD_HHMMSS.sql'

# Restart service
ssh -i ~/ttkey root@129.212.178.244 'pm2 restart customer-service'
```

---

## Monitoring

### Check Service Status
```bash
ssh -i ~/ttkey root@129.212.178.244 'pm2 status'
```

### View Logs
```bash
ssh -i ~/ttkey root@129.212.178.244 'pm2 logs customer-service --lines 100'
```

### Health Check
```bash
curl https://dev.canicloud.com/api/health
```

---

## Common Issues

### Issue: Migration File Not Found
**Cause**: Wrong branch checked out on server  
**Fix**: Checkout correct branch before deploying

### Issue: Build Fails
**Cause**: Dependencies out of sync  
**Fix**: 
```bash
ssh -i ~/ttkey root@129.212.178.244
cd /opt/tailtown/services/customer
rm -rf node_modules dist
npm install
npm run build
pm2 restart customer-service
```

### Issue: PM2 Won't Restart
**Cause**: Process stuck or crashed  
**Fix**:
```bash
ssh -i ~/ttkey root@129.212.178.244
pm2 stop customer-service
pm2 start customer-service
# Or
pm2 reload customer-service
```

---

## Configuration

### SSH Settings
- **Host**: 129.212.178.244
- **User**: root
- **Key**: ~/ttkey
- **Path**: /opt/tailtown

### Services
- **Customer Service**: Port 4004
- **Database**: PostgreSQL (Docker container `tailtown-postgres`)
- **Process Manager**: PM2

---

## For Future Deployments

### 1. Regular Updates
```bash
# Simple workflow
git checkout main
git pull
./QUICK-DEPLOY-AUTO.sh
```

### 2. Feature Branches
```bash
# Merge feature to main first
git checkout main
git merge feature/your-feature
git push origin main

# Then deploy
./QUICK-DEPLOY-AUTO.sh
```

### 3. Hotfixes
```bash
# Create hotfix branch
git checkout -b hotfix/critical-fix main
# Make changes, commit
git push origin hotfix/critical-fix

# Deploy hotfix
# (Edit QUICK-DEPLOY-AUTO.sh to pull from hotfix branch)
./QUICK-DEPLOY-AUTO.sh

# Merge back to main
git checkout main
git merge hotfix/critical-fix
git push origin main
```

---

## Success Criteria

After deployment, verify:

✅ Dashboard shows ~1,157 customers (not 23,628)  
✅ Revenue is accurate for dev tenant  
✅ No cross-tenant data visible  
✅ All date ranges work correctly  
✅ No errors in PM2 logs  
✅ Health endpoint responds  

---

## Support

**Documentation**:
- `DEPLOYMENT-CHECKLIST-NOV-6-2025.md` - Detailed checklist
- `MANUAL-DEPLOY-STEPS.md` - Step-by-step manual process
- `SESSION-SUMMARY-NOV-6-2025.md` - Complete session summary

**Scripts**:
- `QUICK-DEPLOY-AUTO.sh` - Fully automated deployment
- `QUICK-DEPLOY-NOV-6.sh` - Deployment with confirmations

**Backups**:
- Local: `~/tailtown_customer_backup_20251106_195115.sql`
- Remote: `~/customer_backup_*.sql`

---

**Last Updated**: November 6, 2025  
**Version**: 1.0
