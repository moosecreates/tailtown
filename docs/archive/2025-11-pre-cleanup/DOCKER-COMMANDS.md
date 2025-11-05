# 🐳 Docker Commands - Quick Reference

Essential Docker commands for managing Tailtown in production.

---

## 🚀 Deployment

```bash
# Initial deployment
./deployment/deploy.sh

# Manual deployment
docker-compose -f docker-compose.prod.yml up -d --build

# Deploy specific service
docker-compose -f docker-compose.prod.yml up -d --build customer-service
```

---

## 📊 Status & Monitoring

```bash
# View all containers
docker-compose -f docker-compose.prod.yml ps

# View container status with health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Real-time resource usage
docker stats

# Specific container stats
docker stats tailtown-customer-prod
```

---

## 📝 Logs

```bash
# All logs (follow)
docker-compose -f docker-compose.prod.yml logs -f

# Specific service logs
docker-compose -f docker-compose.prod.yml logs -f customer-service
docker-compose -f docker-compose.prod.yml logs -f reservation-service
docker-compose -f docker-compose.prod.yml logs -f frontend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100

# Logs since timestamp
docker-compose -f docker-compose.prod.yml logs --since 2024-01-01T00:00:00

# Save logs to file
docker-compose -f docker-compose.prod.yml logs > logs.txt
```

---

## 🔄 Start/Stop/Restart

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop without removing containers
docker-compose -f docker-compose.prod.yml stop

# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart customer-service

# Start specific service
docker-compose -f docker-compose.prod.yml up -d customer-service

# Stop specific service
docker-compose -f docker-compose.prod.yml stop customer-service
```

---

## 🔍 Inspect & Debug

```bash
# Execute command in container
docker exec -it tailtown-customer-prod sh

# View container details
docker inspect tailtown-customer-prod

# View health check status
docker inspect tailtown-customer-prod | grep -A 10 Health

# View environment variables
docker exec tailtown-customer-prod env

# Test network connectivity
docker exec tailtown-customer-prod ping postgres
```

---

## 🗄️ Database

```bash
# Connect to database
docker exec -it tailtown-postgres-prod psql -U postgres tailtown

# Run SQL query
docker exec tailtown-postgres-prod psql -U postgres tailtown -c "SELECT COUNT(*) FROM customers;"

# Backup database
docker exec tailtown-postgres-prod pg_dump -U postgres tailtown > backup.sql

# Backup and compress
docker exec tailtown-postgres-prod pg_dump -U postgres tailtown | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore database
docker exec -i tailtown-postgres-prod psql -U postgres tailtown < backup.sql

# Restore from compressed
gunzip < backup.sql.gz | docker exec -i tailtown-postgres-prod psql -U postgres tailtown

# Run migrations
docker exec tailtown-customer-prod npx prisma migrate deploy
docker exec tailtown-reservation-prod npx prisma migrate deploy
```

---

## 🔧 Maintenance

```bash
# Rebuild images
docker-compose -f docker-compose.prod.yml build --no-cache

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Remove stopped containers
docker-compose -f docker-compose.prod.yml rm

# View disk usage
docker system df

# Clean up unused resources
docker system prune

# Clean up everything (CAREFUL!)
docker system prune -a --volumes

# Remove specific image
docker rmi tailtown-customer-service

# Remove all stopped containers
docker container prune
```

---

## 📦 Updates

```bash
# Update application
cd /opt/tailtown
git pull origin main
./deployment/deploy.sh

# Manual update
git pull origin main
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔍 Health Checks

```bash
# Run health check script
docker exec tailtown-health-monitor node scripts/health-check.js

# Check service health endpoints
curl http://localhost:4004/health
curl http://localhost:4003/health
curl http://localhost/health

# Check from inside container
docker exec tailtown-customer-prod wget -qO- http://localhost:4004/health
```

---

## 📈 Scaling

```bash
# Scale service to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale customer-service=3

# View scaled instances
docker-compose -f docker-compose.prod.yml ps customer-service
```

---

## 🌐 Network

```bash
# List networks
docker network ls

# Inspect network
docker network inspect tailtown-network

# View container IPs
docker inspect -f '{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -aq)

# Test connectivity between containers
docker exec tailtown-customer-prod ping tailtown-postgres-prod
```

---

## 💾 Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect tailtown_postgres_data

# Backup volume
docker run --rm -v tailtown_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data

# Restore volume
docker run --rm -v tailtown_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

---

## 🚨 Emergency

```bash
# Stop everything immediately
docker-compose -f docker-compose.prod.yml down

# Force stop
docker-compose -f docker-compose.prod.yml kill

# Remove everything and start fresh
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d

# View what's using port
sudo lsof -i :4004
sudo lsof -i :4003
sudo lsof -i :80

# Kill process on port
sudo kill -9 $(sudo lsof -t -i:4004)
```

---

## 📊 Monitoring Commands

```bash
# Container CPU usage
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Container memory usage
docker stats --no-stream --format "table {{.Name}}\t{{.MemPerc}}\t{{.MemUsage}}"

# Continuous monitoring
watch -n 2 'docker stats --no-stream'

# Export stats to file
docker stats --no-stream > stats_$(date +%Y%m%d_%H%M%S).txt
```

---

## 🔐 Security

```bash
# Scan image for vulnerabilities (if Docker Scout installed)
docker scout cves tailtown-customer-service

# View container processes
docker top tailtown-customer-prod

# View container resource limits
docker inspect tailtown-customer-prod | grep -A 20 Resources
```

---

## 📝 Useful Aliases

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Docker Compose shorthand
alias dcp='docker-compose -f docker-compose.prod.yml'

# Common operations
alias dcp-up='docker-compose -f docker-compose.prod.yml up -d'
alias dcp-down='docker-compose -f docker-compose.prod.yml down'
alias dcp-restart='docker-compose -f docker-compose.prod.yml restart'
alias dcp-logs='docker-compose -f docker-compose.prod.yml logs -f'
alias dcp-ps='docker-compose -f docker-compose.prod.yml ps'

# Then use:
# dcp-up
# dcp-logs
# dcp-restart
```

---

## 🎯 Common Workflows

### Deploy Update
```bash
cd /opt/tailtown
git pull origin main
./deployment/deploy.sh
```

### Check if Everything is Running
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs --tail=50
curl http://localhost/health
```

### Investigate Issue
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs -f customer-service

# Check container status
docker ps -a

# Check resource usage
docker stats --no-stream

# Get inside container
docker exec -it tailtown-customer-prod sh
```

### Backup Everything
```bash
# Backup database
docker exec tailtown-postgres-prod pg_dump -U postgres tailtown | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup volumes
docker run --rm -v tailtown_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/volumes_$(date +%Y%m%d).tar.gz /data

# Backup .env
cp .env.production .env.production.backup
```

### Complete Restart
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 💡 Pro Tips

1. **Always use `-f docker-compose.prod.yml`** to specify the production file
2. **Use `-d` flag** to run containers in detached mode
3. **Check logs first** when troubleshooting
4. **Use `--tail=N`** to limit log output
5. **Use `docker stats`** to monitor resource usage
6. **Backup before major changes**
7. **Test commands on dev first**
8. **Keep this reference handy!**

---

## 📞 Need Help?

- **Logs**: `docker-compose -f docker-compose.prod.yml logs -f`
- **Status**: `docker-compose -f docker-compose.prod.yml ps`
- **Health**: `curl http://localhost/health`
- **Docs**: See `DOCKER-DEPLOY.md` for full guide

---

**Bookmark this page for quick reference!** 🔖
