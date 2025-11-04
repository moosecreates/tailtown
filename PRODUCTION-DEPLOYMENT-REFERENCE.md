# Production Deployment Reference

**Last Updated:** November 3, 2025  
**Production Server:** 129.212.178.244 (Digital Ocean)

---

## 🐳 We Use Docker for Production!

**Setup Date:** November 2, 2025  
**Method:** Docker Compose  
**Configuration:** `docker-compose.prod.yml`

### Why Docker?

✅ **Automated health checks** - Services auto-restart on failure  
✅ **Nginx reverse proxy** - Ready for SSL/HTTPS  
✅ **PostgreSQL containerized** - Persistent volumes for data  
✅ **Resource limits** - Prevents memory/CPU issues  
✅ **Security hardening** - Isolated containers  
✅ **One-command deployment** - Simple and reliable  

---

## 🚀 Quick Deployment

### Standard Deployment

```bash
# 1. SSH into production server
ssh -i ~/ttkey root@129.212.178.244

# 2. Navigate to project
cd /opt/tailtown

# 3. Pull latest code
git pull origin main

# 4. Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d --build
```

### Check Status

```bash
# View running containers
docker ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check specific service
docker-compose -f docker-compose.prod.yml logs customer-service
docker-compose -f docker-compose.prod.yml logs reservation-service
docker-compose -f docker-compose.prod.yml logs frontend
```

### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart customer-service
```

### Stop Services

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop but keep data
docker-compose -f docker-compose.prod.yml stop
```

---

## 📋 Production Server Details

### Server Information
- **IP Address:** 129.212.178.244
- **Provider:** Digital Ocean
- **OS:** Ubuntu 22.04 LTS
- **SSH Key:** `~/ttkey` (private key)
- **SSH Command:** `ssh -i ~/ttkey root@129.212.178.244`

### Service Ports
- **Frontend:** 3000
- **Customer Service:** 4004
- **Reservation Service:** 4003
- **PostgreSQL:** 5432 (internal to Docker network)
- **Nginx:** 80 (HTTP), 443 (HTTPS when SSL configured)

### URLs
- **Frontend:** http://129.212.178.244:3000
- **Customer API:** http://129.212.178.244:4004
- **Reservation API:** http://129.212.178.244:4003

---

## 🗂️ File Locations on Server

### Project Directory
```
/opt/tailtown/
├── services/
│   ├── customer/
│   └── reservation-service/
├── frontend/
├── docker-compose.prod.yml
├── .env.production
└── deploy.sh
```

### Docker Volumes
```
/var/lib/docker/volumes/
└── tailtown_postgres_data/
```

### Logs
```
# Docker logs
docker-compose -f docker-compose.prod.yml logs

# System logs (if using manual deployment)
/tmp/customer-service.log
/tmp/reservation-service.log
/tmp/frontend.log
```

---

## 🔧 Troubleshooting

### Services Won't Start

```bash
# Check Docker status
docker ps -a

# View error logs
docker-compose -f docker-compose.prod.yml logs --tail=50

# Rebuild from scratch
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### Database Issues

```bash
# Check PostgreSQL container
docker ps | grep postgres

# Access PostgreSQL
docker exec -it tailtown-postgres psql -U postgres -d customer

# View database logs
docker logs tailtown-postgres
```

### Port Conflicts

```bash
# Check what's using a port
lsof -i :3000
lsof -i :4003
lsof -i :4004

# Kill process on port
kill -9 $(lsof -t -i:3000)
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

---

## 📚 Related Documentation

### Complete Guides
- **[DOCKER-DEPLOY.md](DOCKER-DEPLOY.md)** - Full Docker deployment guide (5 steps)
- **[DOCKER-COMMANDS.md](DOCKER-COMMANDS.md)** - Complete Docker command reference
- **[deployment/DEPLOYMENT-GUIDE.md](deployment/DEPLOYMENT-GUIDE.md)** - 50+ page comprehensive guide
- **[DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)** - Pre/post deployment checklist

### Alternative Methods (Not Currently Used)
- PM2 process manager
- Systemd services
- Manual node processes

**Note:** We chose Docker over these alternatives for better reliability and easier management.

---

## 🔐 Security Notes

### SSH Access
- Private key: `~/ttkey`
- Public key: `~/ttkey.pub`
- Only authorized keys can access server
- Root access required for Docker commands

### Environment Variables
- Stored in `.env.production` on server
- **Never commit to git**
- Contains database passwords, JWT secrets, API keys

### Database
- PostgreSQL password: Stored in `.env.production`
- Database: `customer` (shared by both services)
- Port 5432 only accessible within Docker network

---

## 📊 Deployment History

### November 3, 2025
- ✅ Merged feature/test-workflows to main (101 commits)
- ✅ Pushed to GitHub
- ✅ Pulled latest code on production server
- ⚠️ Docker build had TypeScript errors (test files)
- 📝 Need to exclude test files from production build

### November 2, 2025
- ✅ Initial Docker production setup complete
- ✅ PostgreSQL container running
- ✅ Nginx reverse proxy configured
- ✅ Health checks implemented
- ✅ Documentation created (7 guides)

---

## ✅ Quick Reference

### Most Common Commands

```bash
# Deploy latest code
ssh -i ~/ttkey root@129.212.178.244 "cd /opt/tailtown && git pull origin main && docker-compose -f docker-compose.prod.yml up -d --build"

# Check status
ssh -i ~/ttkey root@129.212.178.244 "docker ps"

# View logs
ssh -i ~/ttkey root@129.212.178.244 "cd /opt/tailtown && docker-compose -f docker-compose.prod.yml logs -f"

# Restart services
ssh -i ~/ttkey root@129.212.178.244 "cd /opt/tailtown && docker-compose -f docker-compose.prod.yml restart"
```

---

## 🆘 Emergency Contacts

**Developer:** Rob Weinstein  
**Server Provider:** Digital Ocean  
**Deployment Method:** Docker Compose  
**Last Successful Deploy:** November 2, 2025

---

**Remember:** Always test locally before deploying to production!
