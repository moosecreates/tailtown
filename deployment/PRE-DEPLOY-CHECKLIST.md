# 📋 Pre-Deployment Checklist

Complete this checklist before deploying Tailtown to production.

---

## 🔧 Code Preparation

### Environment Configuration
- [ ] Created `.env.production` file
- [ ] Set strong `POSTGRES_PASSWORD` (32+ characters)
- [ ] Generated secure `JWT_SECRET` (use: `openssl rand -base64 32`)
- [ ] Updated `REACT_APP_CUSTOMER_API_URL` with production domain
- [ ] Updated `REACT_APP_RESERVATION_API_URL` with production domain
- [ ] Verified all required environment variables are set
- [ ] Confirmed `.env.production` is in `.gitignore`

### Database
- [ ] Database migrations are up to date
- [ ] Seed data prepared (if needed)
- [ ] Backup strategy planned
- [ ] Database credentials secured

### Code Quality
- [ ] All tests passing locally
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] API endpoints secured with authentication
- [ ] CORS configured correctly
- [ ] Rate limiting configured

---

## 🖥️ Server Setup

### Digital Ocean Droplet
- [ ] Droplet created (Ubuntu 22.04 LTS)
- [ ] Minimum 4GB RAM, 2 vCPUs selected
- [ ] SSH key added
- [ ] Firewall rules configured (ports 22, 80, 443)
- [ ] Domain name pointed to droplet IP (if using domain)

### Initial Server Configuration
- [ ] Ran `setup-digitalocean.sh` script
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] Tailtown user created
- [ ] Directories created (`/opt/tailtown`, `/var/log/tailtown`)
- [ ] Logged out and back in (for Docker group)

---

## 📦 Deployment Files

### Docker Configuration
- [ ] Reviewed `docker-compose.prod.yml`
- [ ] Updated service configurations if needed
- [ ] Verified Dockerfile.prod files exist for all services
- [ ] Checked Nginx configuration in `deployment/nginx/nginx.conf`
- [ ] Updated domain names in Nginx config (if using domain)

### Scripts
- [ ] `deployment/deploy.sh` is executable
- [ ] `deployment/setup-digitalocean.sh` is executable
- [ ] Backup scripts created
- [ ] Health check scripts tested

---

## 🔐 Security

### Credentials
- [ ] Strong passwords generated (32+ characters)
- [ ] JWT secret generated securely
- [ ] Database credentials secured
- [ ] No sensitive data in git repository
- [ ] `.env.production` not committed to git

### Server Security
- [ ] UFW firewall enabled
- [ ] Only necessary ports open (22, 80, 443)
- [ ] SSH key authentication enabled
- [ ] Root login disabled (optional but recommended)
- [ ] Fail2ban installed (optional but recommended)

### Application Security
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection protection (using Prisma)
- [ ] XSS protection headers set
- [ ] HTTPS/SSL planned (Let's Encrypt)

---

## 🧪 Testing

### Local Testing
- [ ] All services start successfully locally
- [ ] Frontend connects to backend APIs
- [ ] Database connections work
- [ ] Authentication works
- [ ] All main features tested
- [ ] Error handling tested

### Pre-Production Testing
- [ ] Health check script runs successfully
- [ ] Docker containers build without errors
- [ ] Docker Compose starts all services
- [ ] Services can communicate with each other
- [ ] Database migrations run successfully

---

## 📊 Monitoring & Logging

### Monitoring Setup
- [ ] Health check container configured
- [ ] Log directories created
- [ ] Log rotation configured
- [ ] Monitoring dashboard planned (optional)

### Alerting
- [ ] Email alerts configured (optional)
- [ ] Slack/Discord webhooks set up (optional)
- [ ] Uptime monitoring service configured (optional)

---

## 💾 Backup & Recovery

### Backup Strategy
- [ ] Automated backup script created
- [ ] Backup schedule planned (daily recommended)
- [ ] Backup retention policy defined (7 days minimum)
- [ ] Backup storage location secured
- [ ] Backup restoration tested

### Disaster Recovery
- [ ] Recovery procedure documented
- [ ] Rollback procedure tested
- [ ] Database restore procedure tested
- [ ] Emergency contact list created

---

## 📝 Documentation

### Internal Documentation
- [ ] Deployment procedure documented
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Database schema documented
- [ ] Troubleshooting guide created

### Team Knowledge
- [ ] Team trained on deployment process
- [ ] Access credentials shared securely
- [ ] On-call rotation defined (if applicable)
- [ ] Escalation procedures defined

---

## 🚀 Deployment Day

### Pre-Deployment
- [ ] All checklist items above completed
- [ ] Team notified of deployment
- [ ] Maintenance window scheduled (if needed)
- [ ] Backup of current production taken (if updating)

### Deployment Steps
- [ ] SSH into server
- [ ] Clone repository to `/opt/tailtown`
- [ ] Copy `.env.production` to server
- [ ] Run `./deployment/deploy.sh`
- [ ] Verify all containers started
- [ ] Check health endpoints
- [ ] Test main functionality

### Post-Deployment
- [ ] All services running
- [ ] Health checks passing
- [ ] Frontend accessible
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Logs being generated
- [ ] SSL/HTTPS working (if configured)

---

## 🎯 Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Monitor logs for errors
- [ ] Test all critical features
- [ ] Verify backups are running
- [ ] Check resource usage (CPU, memory, disk)
- [ ] Test health monitoring

### Short-term (Week 1)
- [ ] Setup SSL/HTTPS with Let's Encrypt
- [ ] Configure automated backups
- [ ] Setup monitoring dashboard
- [ ] Optimize performance if needed
- [ ] Document any issues encountered

### Long-term (Month 1)
- [ ] Review security settings
- [ ] Optimize resource allocation
- [ ] Setup advanced monitoring
- [ ] Plan scaling strategy
- [ ] Review and update documentation

---

## ✅ Final Verification

Before marking deployment as complete:

- [ ] Application is accessible at production URL
- [ ] All main features working
- [ ] No critical errors in logs
- [ ] Health checks passing
- [ ] Backups configured and tested
- [ ] Monitoring in place
- [ ] Team has access and knowledge
- [ ] Documentation updated
- [ ] Rollback procedure tested
- [ ] Success criteria met

---

## 🆘 Emergency Contacts

Document your emergency contacts:

```
Primary Contact: ___________________
Phone: ___________________
Email: ___________________

Secondary Contact: ___________________
Phone: ___________________
Email: ___________________

Digital Ocean Support: support.digitalocean.com
Emergency Rollback: git checkout <previous-commit>
```

---

## 📞 Support Resources

- **Deployment Guide**: `deployment/DEPLOYMENT-GUIDE.md`
- **Docker Guide**: `DOCKER-DEPLOY.md`
- **Quick Reference**: `deployment/QUICK-REFERENCE.md`
- **Troubleshooting**: See deployment guides

---

## 🎉 Ready to Deploy?

If all items are checked:
1. Review this checklist one more time
2. Take a deep breath
3. Follow the deployment guide
4. Monitor closely for first 24 hours

**Good luck with your deployment!** 🚀

---

## 📝 Deployment Notes

Use this space to document your specific deployment:

```
Deployment Date: ___________________
Droplet IP: ___________________
Domain: ___________________
Database Password: (stored securely in password manager)
JWT Secret: (stored securely in password manager)

Notes:
_______________________________________
_______________________________________
_______________________________________
```
