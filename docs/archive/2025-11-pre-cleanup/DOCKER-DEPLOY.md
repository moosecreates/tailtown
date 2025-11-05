# 🐳 Tailtown Docker Deployment Guide

Complete guide for deploying Tailtown to Digital Ocean using Docker Compose.

---

## 🚀 Quick Deploy (5 Steps)

### Step 1: Create Digital Ocean Droplet

1. Go to [Digital Ocean](https://cloud.digitalocean.com)
2. Create Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic (Recommended: $24/mo - 4GB RAM, 2 vCPUs)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: tailtown-prod

### Step 2: Initial Server Setup

SSH into your droplet:
```bash
ssh root@your-droplet-ip
```

Run the automated setup script:
```bash
# Download and run setup
curl -o setup.sh https://raw.githubusercontent.com/yourusername/tailtown/main/deployment/setup-digitalocean.sh
chmod +x setup.sh
./setup.sh

# This installs:
# - Docker & Docker Compose
# - Node.js & npm
# - Nginx
# - PostgreSQL client
# - Configures firewall
```

**⚠️ Important**: Log out and back in after setup completes (for Docker group changes).

### Step 3: Clone Repository

```bash
# Switch to tailtown user
su - tailtown

# Clone your repository
cd /opt
git clone https://github.com/yourusername/tailtown.git
cd tailtown
```

### Step 4: Configure Environment

Create production environment file:
```bash
nano .env.production
```

Add your configuration:
```env
# Node Environment
NODE_ENV=production

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE_MIN_32_CHARS
DATABASE_URL=postgresql://postgres:YOUR_SECURE_PASSWORD_HERE@postgres:5432/tailtown

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=YOUR_JWT_SECRET_HERE_MIN_32_CHARS

# API URLs (replace with your domain or IP)
REACT_APP_CUSTOMER_API_URL=http://your-domain.com/api
REACT_APP_RESERVATION_API_URL=http://your-domain.com/api

# Optional: Email configuration
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

**Security Tips**:
- Use strong passwords (minimum 32 characters)
- Generate JWT secret: `openssl rand -base64 32`
- Never commit `.env.production` to git

### Step 5: Deploy!

```bash
# Make deploy script executable
chmod +x deployment/deploy.sh

# Deploy
./deployment/deploy.sh
```

The script will:
1. ✅ Pull latest code
2. ✅ Build Docker images
3. ✅ Stop old containers
4. ✅ Start new containers
5. ✅ Run health checks

**Done!** Your application is now running! 🎉

---

## 🌐 Access Your Application

- **Frontend**: http://your-droplet-ip
- **Customer API**: http://your-droplet-ip:4004
- **Reservation API**: http://your-droplet-ip:4003
- **Health Check**: http://your-droplet-ip/health

---

## 📋 Daily Operations

### View Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f customer-service
docker-compose -f docker-compose.prod.yml logs -f reservation-service
docker-compose -f docker-compose.prod.yml logs -f frontend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart customer-service
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Start Services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔄 Updates & Deployments

### Deploy Updates
```bash
cd /opt/tailtown
git pull origin main
./deployment/deploy.sh
```

The deploy script handles everything automatically!

### Manual Update (if needed)
```bash
# Pull code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🗄️ Database Management

### Backup Database
```bash
# Create backup
docker exec tailtown-postgres-prod pg_dump -U postgres tailtown > backup_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip backup_*.sql
```

### Restore Database
```bash
# Restore from backup
docker exec -i tailtown-postgres-prod psql -U postgres tailtown < backup.sql
```

### Connect to Database
```bash
# Interactive psql session
docker exec -it tailtown-postgres-prod psql -U postgres tailtown

# Run single query
docker exec tailtown-postgres-prod psql -U postgres tailtown -c "SELECT COUNT(*) FROM customers;"
```

### Run Migrations
```bash
# Customer service migrations
docker exec tailtown-customer-prod npx prisma migrate deploy

# Reservation service migrations
docker exec tailtown-reservation-prod npx prisma migrate deploy
```

---

## 🔍 Monitoring & Health Checks

### Manual Health Check
```bash
# Run health check script
docker exec tailtown-health-monitor node scripts/health-check.js

# Check individual services
curl http://localhost:4004/health
curl http://localhost:4003/health
curl http://localhost/health
```

### View Resource Usage
```bash
# Real-time stats
docker stats

# Specific container
docker stats tailtown-customer-prod
```

### Check Container Health
```bash
# View health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Detailed inspect
docker inspect tailtown-customer-prod | grep -A 10 Health
```

---

## 🔐 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

1. **Install Certbot**:
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. **Get Certificate**:
```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Start nginx
sudo systemctl start nginx
```

3. **Update Docker Compose**:

Edit `docker-compose.prod.yml`:
```yaml
frontend:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
  ports:
    - "443:443"
```

4. **Update Nginx Config**:

Uncomment HTTPS section in `deployment/nginx/nginx.conf` and update paths.

5. **Restart**:
```bash
docker-compose -f docker-compose.prod.yml restart frontend
```

6. **Auto-Renewal**:
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot will auto-renew via cron
```

---

## 🚨 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check if ports are in use
sudo lsof -i :4003
sudo lsof -i :4004
sudo lsof -i :80

# Check disk space
df -h

# Check memory
free -h
```

### Database Connection Issues

```bash
# Test database connection
docker exec tailtown-postgres-prod psql -U postgres -c "SELECT 1"

# Check database logs
docker logs tailtown-postgres-prod

# Verify DATABASE_URL in .env.production
cat .env.production | grep DATABASE_URL
```

### Container Keeps Restarting

```bash
# Check logs for errors
docker logs tailtown-customer-prod --tail=100

# Check health status
docker inspect tailtown-customer-prod | grep -A 10 Health

# Try manual start to see errors
docker-compose -f docker-compose.prod.yml up customer-service
```

### High Memory Usage

```bash
# Check memory usage
docker stats

# Restart specific service
docker-compose -f docker-compose.prod.yml restart customer-service

# Clear unused images/containers
docker system prune -a
```

### Can't Access Application

```bash
# Check firewall
sudo ufw status

# Ensure ports are open
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check nginx
docker logs tailtown-frontend-prod

# Test locally
curl http://localhost
```

---

## 🔄 Automated Backups

### Setup Daily Backups

Create backup script:
```bash
sudo nano /opt/tailtown/deployment/backup-daily.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/opt/tailtown/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec tailtown-postgres-prod pg_dump -U postgres tailtown | gzip > $BACKUP_DIR/tailtown_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "tailtown_*.sql.gz" -mtime +7 -delete

echo "Backup completed: tailtown_$DATE.sql.gz"
```

Make executable:
```bash
chmod +x /opt/tailtown/deployment/backup-daily.sh
```

Setup cron job:
```bash
crontab -e
```

Add:
```
# Daily backup at 2 AM
0 2 * * * /opt/tailtown/deployment/backup-daily.sh >> /var/log/tailtown/backup.log 2>&1
```

---

## 🎯 Performance Optimization

### Scale Services

Edit `docker-compose.prod.yml`:
```yaml
customer-service:
  deploy:
    replicas: 3  # Run 3 instances
```

Restart:
```bash
docker-compose -f docker-compose.prod.yml up -d --scale customer-service=3
```

### Increase Resources

Edit `docker-compose.prod.yml`:
```yaml
customer-service:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 2G
      reservations:
        cpus: '1.0'
        memory: 1G
```

### Enable Caching

Add Redis container to `docker-compose.prod.yml`:
```yaml
redis:
  image: redis:alpine
  restart: always
  ports:
    - "6379:6379"
```

---

## 📊 Monitoring Dashboard

### Setup Portainer (Optional)

```bash
# Install Portainer
docker volume create portainer_data
docker run -d -p 9000:9000 --name portainer --restart always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce

# Access at: http://your-ip:9000
```

### Setup Grafana + Prometheus (Advanced)

See `deployment/monitoring/` directory for configuration files.

---

## 🔒 Security Checklist

- [ ] Strong passwords (32+ characters)
- [ ] JWT secret generated securely
- [ ] Firewall configured (only 22, 80, 443 open)
- [ ] SSL/HTTPS enabled
- [ ] Regular backups scheduled
- [ ] `.env.production` not in git
- [ ] Database not exposed to internet
- [ ] Services running as non-root
- [ ] Regular security updates
- [ ] Monitoring enabled

---

## 📞 Emergency Procedures

### Complete Restart
```bash
cd /opt/tailtown
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Rollback to Previous Version
```bash
cd /opt/tailtown
git log --oneline  # Find previous commit
git checkout <commit-hash>
./deployment/deploy.sh
```

### Restore from Backup
```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database
docker-compose -f docker-compose.prod.yml up -d postgres
sleep 10
gunzip < backup.sql.gz | docker exec -i tailtown-postgres-prod psql -U postgres tailtown

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📈 Next Steps

1. ✅ **Deploy** - Follow the 5-step quick deploy
2. ⚙️ **Configure** - Set up SSL/HTTPS
3. 💾 **Backup** - Setup automated backups
4. 📊 **Monitor** - Setup monitoring dashboard
5. 🔒 **Secure** - Complete security checklist
6. 📝 **Document** - Document your specific configuration
7. 🧪 **Test** - Thoroughly test all features

---

## 🆘 Support

- **Logs**: Always check logs first
- **Health**: Run health checks
- **Docs**: See `deployment/DEPLOYMENT-GUIDE.md` for more details
- **Quick Ref**: See `deployment/QUICK-REFERENCE.md` for commands

---

## ✨ Summary

You now have:
- ✅ Production-ready Docker setup
- ✅ Automated deployment script
- ✅ Health monitoring
- ✅ Log management
- ✅ Backup procedures
- ✅ Security hardening
- ✅ Complete documentation

**Your Tailtown application is ready for production!** 🚀
