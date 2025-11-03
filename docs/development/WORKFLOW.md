# Development Workflow Guide

**Last Updated**: November 3, 2025

This guide covers the complete development workflow for Tailtown, from starting services to debugging issues.

## Table of Contents
- [Quick Start](#quick-start)
- [Daily Workflow](#daily-workflow)
- [Service Management](#service-management)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Quick Start

### First Time Setup

1. **Install Dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ../services/customer && npm install
   cd ../reservation-service && npm install
   ```

2. **Start Databases**
   ```bash
   docker-compose up -d
   ```

3. **Verify Environment Files**
   ```bash
   npm run dev:check
   ```

4. **Start All Services**
   ```bash
   npm run dev:start
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Customer API: http://localhost:4004
   - Reservation API: http://localhost:4003

---

## Daily Workflow

### Morning Routine

```bash
# 1. Check service status
npm run dev:status

# 2. Run pre-flight checks
npm run dev:check

# 3. Start services (if not running)
npm run dev:start

# 4. Verify health
npm run health:check
```

### During Development

```bash
# Check what's running
npm run dev:status

# View live logs
npm run dev:logs

# Restart a specific service (manual)
cd services/customer && npm run dev

# Restart all services
npm run dev:restart
```

### End of Day

```bash
# Stop all services
npm run dev:stop

# Or let them run overnight (they'll auto-cleanup zombies)
```

---

## Service Management

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev:start` | Start all development services with pre-flight checks |
| `npm run dev:stop` | Stop all services gracefully |
| `npm run dev:restart` | Restart all services |
| `npm run dev:status` | Show detailed status of all services |
| `npm run dev:check` | Run pre-flight checks without starting |
| `npm run dev:cleanup` | Clean up zombie processes |
| `npm run dev:logs` | View live logs from all services |
| `npm run health:check` | Check health endpoints |

### Service Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend                       │
│            http://localhost:3000                │
│              (React + TypeScript)               │
└────────────┬────────────────────┬───────────────┘
             │                    │
             ▼                    ▼
┌────────────────────┐  ┌────────────────────────┐
│  Customer Service  │  │  Reservation Service   │
│  localhost:4004    │  │    localhost:4003      │
│  (customers, pets, │  │  (reservations,        │
│   staff, services) │  │   resources, avail.)   │
└─────────┬──────────┘  └──────────┬─────────────┘
          │                        │
          └────────┬───────────────┘
                   ▼
          ┌────────────────┐
          │   PostgreSQL   │
          │  localhost:5433│
          │  (customer DB) │
          └────────────────┘
```

### Port Assignments

- **3000**: Frontend (React)
- **4003**: Reservation Service API
- **4004**: Customer Service API
- **5433**: PostgreSQL (main database)
- **5435**: PostgreSQL (secondary database)

---

## Environment Configuration

### Development vs Production

**Development** (localhost):
```bash
# frontend/.env
REACT_APP_TENANT_ID=dev
REACT_APP_API_URL=http://localhost:4004
REACT_APP_RESERVATION_API_URL=http://localhost:4003
```

**Production** (Digital Ocean):
```bash
# frontend/.env
REACT_APP_TENANT_ID=dev
REACT_APP_API_URL=http://129.212.178.244:4004
REACT_APP_RESERVATION_API_URL=http://129.212.178.244:4003
```

### Backend Services

Both services use the same database configuration:

```bash
# services/customer/.env
# services/reservation-service/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/customer"
PORT=4004  # or 4003 for reservation service
NODE_ENV=development
```

### Switching Environments

**⚠️ CRITICAL**: Always verify your `.env` files before starting development:

```bash
# Check frontend configuration
grep "REACT_APP_API_URL" frontend/.env

# Should show: http://localhost:4004 (NOT production IP)
```

The `npm run dev:check` command automatically validates this.

---

## Troubleshooting

### Common Issues

#### 1. Services Won't Start

**Symptom**: Port already in use errors

**Solution**:
```bash
# Clean up zombie processes
npm run dev:cleanup

# Check what's using the ports
lsof -i :3000 -i :4003 -i :4004

# Force restart
npm run dev:restart
```

#### 2. Database Connection Errors

**Symptom**: `ECONNREFUSED` or `connection refused`

**Solution**:
```bash
# Check if databases are running
docker ps --filter "name=tailtown"

# Start databases
docker-compose up -d

# Verify connection
npm run dev:check
```

#### 3. Frontend Shows Production IP Error

**Symptom**: `ERR_CONNECTION_REFUSED` to `129.212.178.244`

**Solution**:
```bash
# Fix frontend .env
echo "REACT_APP_API_URL=http://localhost:4004" > frontend/.env
echo "REACT_APP_RESERVATION_API_URL=http://localhost:4003" >> frontend/.env

# Restart frontend
npm run dev:restart
```

#### 4. Zombie Processes Consuming CPU

**Symptom**: High CPU usage, multiple `ts-node-dev` processes

**Solution**:
```bash
# Automatic cleanup (recommended)
npm run dev:cleanup

# Manual cleanup
pkill -9 -f "ts-node-dev"
pkill -9 -f "react-scripts"

# Enable automatic daemon (optional)
npm run daemon:start
```

#### 5. Service Health Check Fails

**Symptom**: Health endpoint returns errors

**Solution**:
```bash
# Check service logs
npm run dev:logs

# Or check individual service
tail -f .logs/customer-service.log
tail -f .logs/reservation-service.log
tail -f .logs/frontend.log

# Restart specific service
cd services/customer && npm run dev
```

### Debug Mode

For detailed debugging:

```bash
# Start services with verbose logging
cd services/customer
DEBUG=* npm run dev

# Or check the log files
tail -f .logs/*.log
```

---

## Best Practices

### 1. Always Use npm Scripts

✅ **Do this**:
```bash
npm run dev:start
npm run dev:stop
```

❌ **Not this**:
```bash
cd services/customer && npm run dev &
cd services/reservation-service && npm run dev &
cd frontend && npm start &
```

**Why**: npm scripts include proper cleanup, health checks, and logging.

### 2. Check Status Before Starting

```bash
# Always check first
npm run dev:status

# Then start if needed
npm run dev:start
```

### 3. Use Pre-flight Checks

```bash
# Before starting work
npm run dev:check
```

This validates:
- Node.js and npm versions
- Database containers running
- Environment files exist and are correct
- No zombie processes
- Ports are available

### 4. Monitor Logs During Development

```bash
# Keep a terminal open with logs
npm run dev:logs

# Or use health checks
npm run health:check
```

### 5. Clean Shutdown

```bash
# Always stop services properly
npm run dev:stop

# Not Ctrl+C on individual terminals (creates zombies)
```

### 6. Regular Cleanup

```bash
# Run cleanup if you notice performance issues
npm run dev:cleanup

# Check for zombies
ps aux | grep -E '(ts-node-dev|react-scripts)' | grep -v grep
```

### 7. Keep Environment Files Updated

- Never commit `.env` files (they're gitignored)
- Use `.env.example` as template
- Verify configuration with `npm run dev:check`
- Keep `DEVELOPMENT-STATUS.md` updated

### 8. Branch Workflow

```bash
# Always work on development branch
git checkout development

# Create feature branches from development
git checkout -b feature/my-feature

# Merge back to development
git checkout development
git merge feature/my-feature

# Push to GitHub
git push origin development
```

### 9. Database Migrations

```bash
# Generate migration
cd services/customer
npx prisma migrate dev --name description

# Apply to reservation service too
cd ../reservation-service
npx prisma migrate dev --name description

# Regenerate clients
npx prisma generate
```

### 10. Testing Before Commits

```bash
# Run pre-flight checks
npm run dev:check

# Check service health
npm run health:check

# Run tests (if available)
npm test
```

---

## Advanced Workflows

### Working with Multiple Features

```bash
# Terminal 1: Services
npm run dev:start

# Terminal 2: Logs
npm run dev:logs

# Terminal 3: Development work
git checkout -b feature/new-feature
# ... make changes ...

# Terminal 4: Testing
npm run health:check
```

### Hot Reload Behavior

- **Frontend**: Auto-reloads on file changes
- **Backend Services**: Auto-restart on file changes (ts-node-dev)
- **Database Schema**: Requires manual Prisma regeneration

### Performance Monitoring

```bash
# Check for zombie processes
npm run dev:status

# Monitor resource usage
npm run health:check

# View detailed logs
npm run dev:logs
```

---

## Quick Reference

### One-Line Commands

```bash
# Full restart
npm run dev:restart

# Status check
npm run dev:status && npm run health:check

# Clean start
npm run dev:cleanup && npm run dev:start

# View logs
npm run dev:logs

# Pre-flight
npm run dev:check
```

### Emergency Recovery

```bash
# Nuclear option - clean everything and restart
npm run dev:stop
npm run dev:cleanup
docker-compose restart
sleep 5
npm run dev:check
npm run dev:start
```

---

## Getting Help

### Check These First

1. Run `npm run dev:check` - validates environment
2. Run `npm run dev:status` - shows what's running
3. Check `DEVELOPMENT-STATUS.md` - current configuration
4. View logs: `npm run dev:logs`

### Common Commands Cheat Sheet

```bash
# Start/Stop
npm run dev:start      # Start all services
npm run dev:stop       # Stop all services
npm run dev:restart    # Restart everything

# Status
npm run dev:status     # Detailed status
npm run health:check   # Health endpoints
npm run dev:check      # Pre-flight checks

# Debugging
npm run dev:logs       # Live logs
npm run dev:cleanup    # Clean zombies

# Database
docker ps              # Check containers
docker-compose up -d   # Start databases
docker-compose restart # Restart databases
```

---

## Related Documentation

- [DEVELOPMENT-STATUS.md](../../DEVELOPMENT-STATUS.md) - Current environment status
- [README.md](../../README.md) - Project overview
- [SETUP.md](../operations/SETUP.md) - Initial setup guide
- [FormGuidelines.md](./FormGuidelines.md) - Frontend development patterns

---

**Remember**: When in doubt, run `npm run dev:check` first!
