# Tailtown Deployment - Quick Reference

## 🚀 Quick Start

### First Time Setup
```bash
# 1. SSH to server
ssh root@your-droplet-ip

# 2. Run setup
curl -o setup.sh https://raw.githubusercontent.com/yourusername/tailtown/main/deployment/setup-digitalocean.sh
chmod +x setup.sh && ./setup.sh

# 3. Clone repo
su - tailtown
cd /opt && git clone https://github.com/yourusername/tailtown.git
cd tailtown

# 4. Configure
cp .env.example .env.production
nano .env.production

# 5. Deploy
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

---

## 📋 Common Commands

### Docker Compose

```bash
# Start
docker-compose -f docker-compose.prod.yml up -d

# Stop
docker-compose -f docker-compose.prod.yml down

# Restart
docker-compose -f docker-compose.prod.yml restart

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Status
docker-compose -f docker-compose.prod.yml ps

# Update
git pull && ./deployment/deploy.sh
```

### PM2

```bash
# Start
pm2 start ecosystem.config.js --env production

# Stop
pm2 stop all

# Restart
pm2 restart all

# Logs
pm2 logs

# Status
pm2 status

# Monitor
pm2 monit

# Update
git pull && npm run build && pm2 reload all
```

### systemd

```bash
# Start
sudo systemctl start tailtown-customer
sudo systemctl start tailtown-reservation

# Stop
sudo systemctl stop tailtown-customer
sudo systemctl stop tailtown-reservation

# Restart
sudo systemctl restart tailtown-customer
sudo systemctl restart tailtown-reservation

# Logs
sudo journalctl -u tailtown-customer -f

# Status
sudo systemctl status tailtown-customer
```

---

## 🔍 Health Checks

```bash
# Run health check
node scripts/health-check.js

# Check services
curl http://localhost:4004/health
curl http://localhost:4003/health

# Check Docker health
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 📊 Monitoring

```bash
# Docker stats
docker stats

# PM2 monitoring
pm2 monit

# System resources
htop
df -h
free -h

# Network connections
sudo netstat -tulpn | grep LISTEN
```

---

## 🗄️ Database

```bash
# Backup (Docker)
docker exec tailtown-postgres-prod pg_dump -U postgres tailtown > backup.sql

# Restore (Docker)
docker exec -i tailtown-postgres-prod psql -U postgres tailtown < backup.sql

# Connect to database
docker exec -it tailtown-postgres-prod psql -U postgres tailtown

# Run migrations
cd services/customer && npx prisma migrate deploy
cd services/reservation-service && npx prisma migrate deploy
```

---

## 🔧 Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs
pm2 logs
sudo journalctl -u tailtown-customer -f

# Check ports
sudo lsof -i :4003
sudo lsof -i :4004

# Check disk space
df -h

# Check memory
free -h
```

### High CPU/Memory
```bash
# Check usage
docker stats
pm2 monit
htop

# Restart services
docker-compose -f docker-compose.prod.yml restart
pm2 restart all
sudo systemctl restart tailtown-customer
```

### Database Issues
```bash
# Test connection
docker exec tailtown-postgres-prod psql -U postgres -c "SELECT 1"

# Check logs
docker logs tailtown-postgres-prod

# Restart database
docker-compose -f docker-compose.prod.yml restart postgres
```

---

## 🔐 SSL/HTTPS

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Renew (automatic)
sudo certbot renew --dry-run
```

---

## 📦 Updates

```bash
# Pull latest code
git pull origin main

# Docker
./deployment/deploy.sh

# PM2
npm run build && pm2 reload all

# systemd
npm run build && sudo systemctl restart tailtown-*
```

---

## 🚨 Emergency

### Complete Restart
```bash
# Docker
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# PM2
pm2 kill
pm2 start ecosystem.config.js --env production

# systemd
sudo systemctl restart tailtown-*
```

### Rollback
```bash
git log --oneline
git checkout <previous-commit>
./deployment/deploy.sh
```

---

## 📞 Support

- **Logs**: Always check logs first
- **Docs**: `/deployment/DEPLOYMENT-GUIDE.md`
- **Health**: `node scripts/health-check.js`
- **Status**: Check service status commands above

---

## 🔗 URLs

- **Frontend**: http://your-domain.com
- **Customer API**: http://your-domain.com:4004
- **Reservation API**: http://your-domain.com:4003
- **Health**: http://your-domain.com/health
