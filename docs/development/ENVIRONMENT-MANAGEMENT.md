# Environment Management Guide

**Last Updated**: November 3, 2025

This guide covers how to safely switch between development and production environments using the Tailtown environment management system.

## Table of Contents
- [Quick Start](#quick-start)
- [Available Commands](#available-commands)
- [Environment Configurations](#environment-configurations)
- [Safety Features](#safety-features)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Check Current Environment

```bash
npm run env:status
```

This shows:
- Current environment (development/production)
- All configuration files and their settings
- Running services

### Switch to Development

```bash
npm run env:dev
```

Configures all services to use localhost.

### Switch to Production

```bash
npm run env:prod
```

Configures all services to use Digital Ocean production server.
**⚠️ Requires confirmation prompt**

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run env:status` | Show current environment configuration |
| `npm run env:dev` | Switch to development environment |
| `npm run env:prod` | Switch to production environment |
| `npm run env:backups` | List all environment backups |

---

## Environment Configurations

### Development Environment

**Purpose**: Local development on your machine

**Configuration**:
```bash
# Frontend
REACT_APP_API_URL=http://localhost:4004
REACT_APP_RESERVATION_API_URL=http://localhost:4003

# Backend Services
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/customer
PORT=4004 (customer) / 4003 (reservation)
NODE_ENV=development
```

**Use When**:
- Developing new features
- Testing changes locally
- Debugging issues
- Running tests

### Production Environment

**Purpose**: Connect to live production server

**Configuration**:
```bash
# Frontend
REACT_APP_API_URL=http://129.212.178.244:4004
REACT_APP_RESERVATION_API_URL=http://129.212.178.244:4003

# Backend Services
DATABASE_URL=postgresql://postgres:TailtownSecure2025ProductionDB@localhost:5432/customer
PORT=4004 (customer) / 4003 (reservation)
NODE_ENV=production
```

**Use When**:
- Testing against production data
- Debugging production issues
- Verifying deployments
- **⚠️ Use with extreme caution**

---

## Safety Features

### 1. Automatic Backups

Every time you switch environments, the system automatically backs up your current `.env` files:

```bash
.env-backups/
├── frontend.env.20251103_130000
├── customer.env.20251103_130000
└── reservation.env.20251103_130000
```

View backups:
```bash
npm run env:backups
```

### 2. Production Warning

Switching to production requires explicit confirmation:

```bash
$ npm run env:prod

⚠️  WARNING: Switching to PRODUCTION configuration
This will point your local environment to the production server.

Production server: 129.212.178.244

Are you sure you want to continue? (yes/no):
```

### 3. Service Restart Reminder

After switching environments, you'll see:

```bash
⚠ Services are currently running
  You should restart them to apply the new configuration:

  npm run dev:restart
```

### 4. Environment Detection

The `dev:check` command validates your environment:

```bash
npm run dev:check
```

It will warn if:
- Frontend points to production IP in development
- Configuration files are missing
- Settings are inconsistent

---

## Common Workflows

### Daily Development Workflow

```bash
# Morning - verify you're in development
npm run env:status

# If not in development, switch
npm run env:dev

# Start services
npm run dev:start

# ... do your work ...

# End of day
npm run dev:stop
```

### Testing Against Production

```bash
# Check current environment
npm run env:status

# Switch to production (with confirmation)
npm run env:prod

# Restart services to apply changes
npm run dev:restart

# ... test against production ...

# IMPORTANT: Switch back to development
npm run env:dev
npm run dev:restart
```

### After Pulling Changes

```bash
# Check if environment is still correct
npm run env:status

# If configuration changed, switch back to development
npm run env:dev

# Restart services
npm run dev:restart
```

### Recovering from Mistakes

```bash
# List available backups
npm run env:backups

# Switch to development (safest option)
npm run env:dev

# Or manually restore from backup
cp .env-backups/frontend.env.20251103_130000 frontend/.env
cp .env-backups/customer.env.20251103_130000 services/customer/.env
cp .env-backups/reservation.env.20251103_130000 services/reservation-service/.env

# Restart services
npm run dev:restart
```

---

## Troubleshooting

### Issue: "Already in [environment] environment"

**Cause**: You're already in the target environment

**Solution**: No action needed, or check status:
```bash
npm run env:status
```

### Issue: Services not picking up new configuration

**Cause**: Services need to be restarted

**Solution**:
```bash
npm run dev:restart
```

### Issue: Frontend shows connection errors

**Cause**: Wrong environment configuration

**Solution**:
```bash
# Check current environment
npm run env:status

# Switch to development
npm run env:dev

# Restart
npm run dev:restart
```

### Issue: Can't connect to production

**Cause**: Production server may be down or network issues

**Solution**:
1. Check production server status
2. Verify network connectivity
3. Switch back to development:
   ```bash
   npm run env:dev
   npm run dev:restart
   ```

### Issue: Lost my configuration

**Cause**: Accidentally overwrote .env files

**Solution**:
```bash
# List backups
npm run env:backups

# Switch to development (creates new config)
npm run env:dev

# Or restore from backup manually
```

---

## Best Practices

### ✅ Do This

1. **Always check environment before starting work**
   ```bash
   npm run env:status
   ```

2. **Use development environment by default**
   ```bash
   npm run env:dev
   ```

3. **Restart services after switching**
   ```bash
   npm run dev:restart
   ```

4. **Check status after pulling changes**
   ```bash
   git pull
   npm run env:status
   ```

5. **Switch back to development after production testing**
   ```bash
   npm run env:dev
   ```

### ❌ Don't Do This

1. **Don't manually edit .env files** - Use the environment manager
2. **Don't stay in production mode** - Switch back to development
3. **Don't skip the restart** - Services won't pick up changes
4. **Don't ignore warnings** - They're there for your safety
5. **Don't commit .env files** - They're gitignored for a reason

---

## Integration with Workflow System

The environment manager integrates with the development workflow:

```bash
# Full workflow
npm run env:status      # Check environment
npm run dev:check       # Validate configuration
npm run dev:start       # Start services
npm run dev:status      # Verify services running

# If environment is wrong
npm run dev:stop        # Stop services
npm run env:dev         # Switch to development
npm run dev:start       # Start with new config
```

---

## Environment Variables Reference

### Frontend (.env)

| Variable | Development | Production |
|----------|-------------|------------|
| `REACT_APP_TENANT_ID` | `dev` | `dev` |
| `REACT_APP_API_URL` | `http://localhost:4004` | `http://129.212.178.244:4004` |
| `REACT_APP_RESERVATION_API_URL` | `http://localhost:4003` | `http://129.212.178.244:4003` |

### Backend Services (.env)

| Variable | Development | Production |
|----------|-------------|------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/customer` | `postgresql://postgres:TailtownSecure2025ProductionDB@localhost:5432/customer` |
| `PORT` | `4004` / `4003` | `4004` / `4003` |
| `NODE_ENV` | `development` | `production` |
| `CUSTOMER_SERVICE_URL` | `http://localhost:4004/health` | `http://localhost:4004/health` |

---

## Advanced Usage

### Custom Environment

If you need a custom environment (e.g., staging), you can:

1. Manually create .env files
2. Use the environment manager as a template
3. Or extend the env-manager.sh script

### Backup Management

Backups are stored in `.env-backups/` with timestamps:

```bash
# List backups
npm run env:backups

# Manual cleanup (optional)
rm -rf .env-backups/*

# Backups are gitignored and safe to delete
```

### Script Location

The environment manager script is located at:
```
scripts/env-manager.sh
```

You can run it directly:
```bash
./scripts/env-manager.sh status
./scripts/env-manager.sh dev
./scripts/env-manager.sh prod
```

---

## Quick Reference

### One-Line Commands

```bash
# Check and switch if needed
npm run env:status && npm run env:dev && npm run dev:restart

# Safe production test
npm run env:prod && npm run dev:restart

# Return to development
npm run env:dev && npm run dev:restart

# Full status check
npm run env:status && npm run dev:status
```

### Emergency Recovery

```bash
# Nuclear option - reset to development
npm run dev:stop
npm run env:dev
npm run dev:start
```

---

## Related Documentation

- [WORKFLOW.md](./WORKFLOW.md) - Development workflow guide
- [DEVELOPMENT-STATUS.md](../../DEVELOPMENT-STATUS.md) - Current environment status
- [README.md](../../README.md) - Project overview

---

**Remember**: When in doubt, run `npm run env:status` to see where you are!
