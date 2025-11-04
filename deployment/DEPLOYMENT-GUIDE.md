# Tailtown Production Deployment Guide

Complete guide for deploying Tailtown to Digital Ocean with multiple deployment options.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Server Setup](#initial-server-setup)
3. [Deployment Options](#deployment-options)
   - [Option 1: Docker Compose (Recommended)](#option-1-docker-compose-recommended)
   - [Option 2: PM2 Process Manager](#option-2-pm2-process-manager)
   - [Option 3: systemd Services](#option-3-systemd-services)
4. [Environment Configuration](#environment-configuration)
5. [SSL/HTTPS Setup](#sslhttps-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Digital Ocean Droplet
- **Minimum**: 2 GB RAM, 1 vCPU, 50 GB SSD
- **Recommended**: 4 GB RAM, 2 vCPUs, 80 GB SSD
- **OS**: Ubuntu 22.04 LTS

### Local Requirements
- Git
- SSH access to your droplet
- Domain name (optional, for SSL)

---

## Initial Server Setup

### 1. Connect to Your Droplet

```bash
ssh root@your-droplet-ip
```

### 2. Run Initial Setup Script

```bash
# Download and run setup script
curl -o setup.sh https://raw.githubusercontent.com/yourusername/tailtown/main/deployment/setup-digitalocean.sh
chmod +x setup.sh
./setup.sh
```

This script will:
- Update the system
- Install Docker & Docker Compose
- Install Node.js & PM2
- Create tailtown user
- Setup directories
- Install Nginx
- Configure firewall

### 3. Clone Repository

```bash
# Switch to tailtown user
su - tailtown

# Clone repository
cd /opt
git clone https://github.com/yourusername/tailtown.git
cd tailtown
```

---

## Deployment Options

### Option 1: Docker Compose (Recommended)

**Best for**: Production environments, easy scaling, isolated services

#### Setup

1. **Create environment file:**

```bash
cp .env.example .env.production
nano .env.production
```

Add:
```env
NODE_ENV=production
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
DATABASE_URL=postgresql://postgres:your-secure-password@postgres:5432/tailtown
JWT_SECRET=your-jwt-secret
```

2. **Deploy:**

```bash
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

#### Management Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart

# View status
docker-compose -f docker-compose.prod.yml ps

# Update deployment
git pull origin main
./deployment/deploy.sh
```

#### Auto-start on Boot

```bash
# Create systemd service for Docker Compose
sudo nano /etc/systemd/system/tailtown-docker.service
```

Add:
```ini
[Unit]
Description=Tailtown Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/tailtown
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=tailtown

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable tailtown-docker
sudo systemctl start tailtown-docker
```

---

### Option 2: PM2 Process Manager

**Best for**: Simple deployment, easy process management, good monitoring

#### Setup

1. **Build services:**

```bash
# Build customer service
cd services/customer
npm install
npm run build

# Build reservation service
cd ../reservation-service
npm install
npm run build

# Build frontend
cd ../../frontend
npm install
npm run build
```

2. **Start with PM2:**

```bash
cd /opt/tailtown
pm2 start ecosystem.config.js --env production
```

3. **Setup auto-start:**

```bash
pm2 startup
pm2 save
```

#### Management Commands

```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart all
pm2 restart all

# Restart specific service
pm2 restart customer-service

# Stop all
pm2 stop all

# Monitor
pm2 monit

# Update deployment
git pull origin main
npm run build
pm2 reload all
```

---

### Option 3: systemd Services

**Best for**: Traditional Linux deployment, fine-grained control

#### Setup

1. **Copy service files:**

```bash
sudo cp deployment/systemd/*.service /etc/systemd/system/
sudo cp deployment/systemd/*.timer /etc/systemd/system/
```

2. **Edit service files with your configuration:**

```bash
sudo nano /etc/systemd/system/tailtown-customer.service
# Update DATABASE_URL and other environment variables
```

3. **Enable and start services:**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable services
sudo systemctl enable tailtown-customer
sudo systemctl enable tailtown-reservation
sudo systemctl enable tailtown-health-check.timer

# Start services
sudo systemctl start tailtown-customer
sudo systemctl start tailtown-reservation
sudo systemctl start tailtown-health-check.timer
```

#### Management Commands

```bash
# View status
sudo systemctl status tailtown-customer
sudo systemctl status tailtown-reservation

# View logs
sudo journalctl -u tailtown-customer -f
sudo journalctl -u tailtown-reservation -f

# Restart services
sudo systemctl restart tailtown-customer
sudo systemctl restart tailtown-reservation

# Stop services
sudo systemctl stop tailtown-customer
sudo systemctl stop tailtown-reservation
```

---

## Environment Configuration

### Required Environment Variables

Create `.env.production` with:

```env
# Node Environment
NODE_ENV=production

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
DATABASE_URL=postgresql://postgres:your-secure-password@localhost:5432/tailtown

# JWT
JWT_SECRET=your-jwt-secret-min-32-chars

# API URLs
REACT_APP_CUSTOMER_API_URL=http://your-domain.com/api
REACT_APP_RESERVATION_API_URL=http://your-domain.com/api

# Ports (if not using Docker)
CUSTOMER_SERVICE_PORT=4004
RESERVATION_SERVICE_PORT=4003
```

### Security Best Practices

1. **Use strong passwords** (minimum 32 characters)
2. **Never commit** `.env.production` to git
3. **Rotate secrets** regularly
4. **Use environment-specific** configurations
5. **Enable firewall** rules

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

1. **Install Certbot:**

```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. **Obtain certificate:**

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

3. **Auto-renewal:**

```bash
sudo certbot renew --dry-run
```

Certbot will automatically renew certificates.

### Manual SSL Configuration

1. Place certificates in `/etc/nginx/ssl/`
2. Update nginx configuration
3. Reload nginx: `sudo systemctl reload nginx`

---

## Monitoring & Maintenance

### Health Checks

#### Automated Health Monitoring

All deployment options include automated health checks:

- **Docker**: Built-in healthchecks in containers
- **PM2**: Health monitor process runs every 5 minutes
- **systemd**: Timer-based health checks every 5 minutes

#### Manual Health Check

```bash
# Run health check script
node scripts/health-check.js

# Check service endpoints
curl http://localhost:4004/health
curl http://localhost:4003/health
```

### Log Management

#### Docker Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f customer-service

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

#### PM2 Logs

```bash
# View all logs
pm2 logs

# View specific service
pm2 logs customer-service

# Clear logs
pm2 flush
```

#### systemd Logs

```bash
# View logs
sudo journalctl -u tailtown-customer -f

# Last 100 lines
sudo journalctl -u tailtown-customer -n 100

# Since boot
sudo journalctl -u tailtown-customer -b
```

### Database Backups

#### Automated Backups

Create backup script:

```bash
#!/bin/bash
# /opt/tailtown/deployment/backup-db.sh

BACKUP_DIR="/opt/tailtown/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec tailtown-postgres-prod pg_dump -U postgres tailtown > $BACKUP_DIR/tailtown_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "tailtown_*.sql" -mtime +7 -delete

echo "Backup completed: tailtown_$DATE.sql"
```

Setup cron job:

```bash
crontab -e
# Add: 0 2 * * * /opt/tailtown/deployment/backup-db.sh
```

#### Manual Backup

```bash
# Docker
docker exec tailtown-postgres-prod pg_dump -U postgres tailtown > backup.sql

# Restore
docker exec -i tailtown-postgres-prod psql -U postgres tailtown < backup.sql
```

### Performance Monitoring

#### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Web dashboard
pm2 install pm2-server-monit
```

#### Docker Stats

```bash
# Real-time stats
docker stats

# Specific container
docker stats tailtown-customer-prod
```

---

## Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check if ports are in use
sudo lsof -i :4003
sudo lsof -i :4004

# Check disk space
df -h

# Check memory
free -h
```

#### Database Connection Issues

```bash
# Test database connection
docker exec tailtown-postgres-prod psql -U postgres -c "SELECT 1"

# Check database logs
docker logs tailtown-postgres-prod

# Verify DATABASE_URL
echo $DATABASE_URL
```

#### High Memory Usage

```bash
# Check memory usage
docker stats
pm2 monit

# Restart services
docker-compose -f docker-compose.prod.yml restart
pm2 restart all
```

#### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

### Emergency Procedures

#### Complete Restart

**Docker:**
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

**PM2:**
```bash
pm2 kill
pm2 start ecosystem.config.js --env production
```

**systemd:**
```bash
sudo systemctl restart tailtown-customer
sudo systemctl restart tailtown-reservation
```

#### Rollback Deployment

```bash
# Revert to previous commit
git log --oneline
git checkout <previous-commit-hash>

# Redeploy
./deployment/deploy.sh
```

---

## Comparison of Deployment Options

| Feature | Docker | PM2 | systemd |
|---------|--------|-----|---------|
| **Ease of Setup** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Isolation** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Resource Usage** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Monitoring** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Scaling** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Auto-restart** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Log Management** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**Recommendation**: Use **Docker Compose** for production. It provides the best isolation, scaling, and management capabilities.

---

## Support

For issues or questions:
- Check logs first
- Review this documentation
- Check GitHub issues
- Contact support team

---

## Updates

To update this deployment guide, edit:
`/deployment/DEPLOYMENT-GUIDE.md`
