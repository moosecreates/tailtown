# Deployment Checklist

Use this checklist before deploying to production or staging environments.

## Pre-Deployment Checks

### Environment Configuration
- [ ] `NODE_ENV=production` is set for production builds
- [ ] `.env` file contains production URLs (no `localhost`)
- [ ] All required environment variables are defined:
  - `REACT_APP_API_URL`
  - `REACT_APP_CUSTOMER_SERVICE_URL`
  - `REACT_APP_RESERVATION_SERVICE_URL`
- [ ] Database connection strings point to correct environment
- [ ] JWT secrets are unique and secure

### Build Verification
- [ ] Run `npm run build` successfully completes
- [ ] Run `node scripts/check-build.js` passes
- [ ] Build size is reasonable (check for bloat)
- [ ] No console errors in production build

### Code Quality
- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] No TODO or FIXME comments for critical issues

### Security
- [ ] SSL certificates are valid and not expiring soon
- [ ] Authentication middleware is applied to protected routes
- [ ] Rate limiting is enabled on sensitive endpoints
- [ ] CORS is properly configured
- [ ] No sensitive data in environment variables or code
- [ ] API keys and secrets are not committed to git

### Backend Services
- [ ] Database migrations are up to date
- [ ] Backend services are running (check with `pm2 status`)
- [ ] Backend logs show no critical errors
- [ ] Health check endpoints return 200 OK

### Frontend
- [ ] Frontend build is deployed to correct directory
- [ ] Static assets are accessible
- [ ] Service worker (if any) is updated
- [ ] Browser cache is cleared or cache-busting is working

### Infrastructure
- [ ] Nginx configuration is correct
- [ ] Nginx test passes (`nginx -t`)
- [ ] Firewall rules allow necessary traffic
- [ ] Backup systems are working
- [ ] Monitoring and alerting are configured

## Deployment Commands

### Frontend Deployment
```bash
# Build with production environment
cd /Users/robweinstein/CascadeProjects/tailtown/frontend
NODE_ENV=production npm run build

# Verify build
node scripts/check-build.js

# Deploy to server
tar -czf build.tar.gz build/
scp -i ~/ttkey build.tar.gz root@129.212.178.244:/tmp/
ssh -i ~/ttkey root@129.212.178.244 "cd /opt/tailtown/frontend && rm -rf build && tar -xzf /tmp/build.tar.gz && rm /tmp/build.tar.gz && pm2 restart frontend"
```

### Backend Deployment
```bash
# Deploy customer service
cd /Users/robweinstein/CascadeProjects/tailtown/services/customer
tar -czf customer-service.tar.gz src/
scp -i ~/ttkey customer-service.tar.gz root@129.212.178.244:/tmp/
ssh -i ~/ttkey root@129.212.178.244 "cd /opt/tailtown/services/customer && tar -xzf /tmp/customer-service.tar.gz && rm /tmp/customer-service.tar.gz && pm2 restart customer-service"
```

### SSL Certificate Renewal
```bash
# Add new subdomain to certificate
ssh -i ~/ttkey root@129.212.178.244 "certbot certonly --nginx --cert-name canicloud.com -d canicloud.com -d www.canicloud.com -d tailtown.canicloud.com -d dev.canicloud.com --expand"

# Reload nginx
ssh -i ~/ttkey root@129.212.178.244 "nginx -t && systemctl reload nginx"
```

## Post-Deployment Verification

### Smoke Tests
- [ ] Homepage loads without errors
- [ ] Login works with test credentials
- [ ] API endpoints return expected responses
- [ ] Database queries execute successfully
- [ ] File uploads work (if applicable)

### Monitoring
- [ ] Check application logs for errors
- [ ] Verify metrics are being collected
- [ ] Test alerting system (if configured)
- [ ] Monitor resource usage (CPU, memory, disk)

### Rollback Plan
If deployment fails:
1. SSH to server: `ssh -i ~/ttkey root@129.212.178.244`
2. Check PM2 logs: `pm2 logs [service-name] --lines 50`
3. Rollback to previous version if needed
4. Restart services: `pm2 restart all`

## Common Issues

### Issue: Frontend shows localhost API calls
**Solution**: Rebuild with `NODE_ENV=production npm run build`

### Issue: SSL certificate mismatch
**Solution**: Add subdomain to certificate with certbot `--expand` flag

### Issue: 500 errors after deployment
**Solution**: Check backend logs with `pm2 logs customer-service`

### Issue: Authentication not working
**Solution**: Verify JWT secrets match between environments

## Notes
- Always test in staging before deploying to production
- Keep deployment logs for troubleshooting
- Document any manual steps or configuration changes
- Update this checklist as the deployment process evolves
