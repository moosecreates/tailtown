# Zombie Process Prevention - Quick Start

## The Problem
Development servers accumulate zombie processes that consume 98-100% CPU, causing:
- IDE/Cascade hangs and crashes
- Inability to start new servers
- System slowdowns

## Quick Fix (Right Now)

Open a terminal and run:

```bash
cd /Users/robweinstein/CascadeProjects/tailtown

# Kill all zombies
pkill -9 -f "ts-node-dev"
pkill -9 -f "react-scripts"

# Kill by port
lsof -ti :4004 | xargs kill -9 2>/dev/null
lsof -ti :4003 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
```

## Prevention Tools Created

### 1. Health Check Script ✅
**Purpose:** Monitor server health and detect zombies early

```bash
# Run health check
npm run health:check

# Or directly
node scripts/health-check.js
```

**What it checks:**
- ✓ Services running on correct ports
- ✓ Services responding to requests
- ✓ Zombie process count
- ✓ High CPU usage processes

### 2. Server Management Script ✅
**Purpose:** Properly start/stop servers with automatic cleanup

```bash
# Start all servers (with cleanup)
npm run dev:start

# Stop all servers (with cleanup)
npm run dev:stop

# Restart servers
npm run dev:restart

# Check status
npm run dev:status

# Manual cleanup
npm run dev:cleanup

# View logs
npm run dev:logs
```

### 3. Automated Tests ✅
**Purpose:** Verify health monitoring works

```bash
# Run health check tests
npm test -- scripts/__tests__/health-check.test.js
```

**Tests include:**
- Zombie process detection
- Port availability checking
- CPU usage monitoring
- Service health verification

## Daily Workflow

### Morning Routine
```bash
# 1. Check health
npm run health:check

# 2. Clean up if needed
npm run dev:cleanup

# 3. Start servers
npm run dev:start
```

### During Development
```bash
# Check status anytime
npm run dev:status

# Restart if needed
npm run dev:restart

# View logs
npm run dev:logs all
```

### End of Day
```bash
# Stop servers properly
npm run dev:stop

# Verify cleanup
npm run health:check
```

## Files Created

1. **`scripts/dev-servers.sh`** - Main server management script
   - Automatic zombie cleanup
   - PID file management
   - Graceful shutdown
   - Log file management

2. **`scripts/health-check.js`** - Health monitoring script
   - Service health checks
   - Zombie detection
   - CPU usage monitoring
   - Detailed reporting

3. **`scripts/__tests__/health-check.test.js`** - Automated tests
   - Process detection tests
   - Port availability tests
   - CPU monitoring tests

4. **`docs/ZOMBIE-PROCESS-PREVENTION.md`** - Complete guide
   - Detailed prevention strategies
   - Troubleshooting procedures
   - Best practices
   - Monitoring setup

5. **`KILL-ZOMBIES.md`** - Quick reference
   - Emergency cleanup commands
   - Manual restart procedures

## Key Features

### Automatic Cleanup
- Kills zombies before starting servers
- Graceful shutdown with fallback to force kill
- Cleans up stale PID files

### Process Tracking
- Stores PIDs in `.pids/` directory
- Logs output to `.logs/` directory
- Easy to identify running processes

### Health Monitoring
- HTTP health checks
- Port availability checks
- CPU usage monitoring
- Zombie process detection

### Safe Operations
- Waits for graceful shutdown (10 seconds)
- Force kills only if necessary
- Verifies services started successfully

## npm Scripts Added

```json
{
  "health:check": "node scripts/health-check.js",
  "dev:start": "./scripts/dev-servers.sh start",
  "dev:stop": "./scripts/dev-servers.sh stop",
  "dev:restart": "./scripts/dev-servers.sh restart",
  "dev:status": "./scripts/dev-servers.sh status",
  "dev:cleanup": "./scripts/dev-servers.sh cleanup",
  "dev:logs": "./scripts/dev-servers.sh logs"
}
```

## Monitoring Thresholds

- **Healthy:** 3-6 processes total
- **Warning:** 7-10 processes
- **Critical:** >10 processes (cleanup needed)
- **CPU Alert:** Any process >50% CPU
- **Zombie Threshold:** >5 zombie processes

## When to Run Health Check

✅ **Always:**
- Before starting work
- After any errors
- Before committing code
- End of day

⚠️ **Warning Signs:**
- IDE becomes slow
- Fans running loud
- Servers won't start
- Port already in use errors

## Emergency Procedures

### IDE/Cascade Hanging
1. Open new terminal
2. Run: `npm run dev:cleanup`
3. Wait 10 seconds
4. Try IDE again

### Servers Won't Start
1. Run: `npm run health:check`
2. Run: `npm run dev:cleanup`
3. Wait 5 seconds
4. Run: `npm run dev:start`

### High CPU Usage
1. Run: `npm run health:check`
2. Identify zombie processes
3. Run: `npm run dev:cleanup`
4. Restart: `npm run dev:restart`

## Testing the Solution

```bash
# 1. Test health check
npm run health:check

# 2. Test cleanup
npm run dev:cleanup

# 3. Test server management
npm run dev:start
npm run dev:status
npm run dev:stop

# 4. Run automated tests
npm test -- scripts/__tests__/health-check.test.js
```

## Next Steps

1. **Make scripts executable:**
   ```bash
   chmod +x scripts/dev-servers.sh
   chmod +x scripts/health-check.js
   ```

2. **Test the workflow:**
   - Run health check
   - Start servers with new script
   - Verify status
   - Stop servers
   - Verify cleanup

3. **Add to daily routine:**
   - Use `npm run dev:start` instead of manual starts
   - Run `npm run health:check` regularly
   - Always use `npm run dev:stop` to stop servers

4. **Set up monitoring (optional):**
   - Add cron job for periodic health checks
   - Set up alerts for high process counts
   - Monitor logs in `.logs/` directory

## Benefits

✅ **Prevents zombie accumulation** - Automatic cleanup before starting
✅ **Early detection** - Health checks catch issues before they become critical
✅ **Easy recovery** - Simple commands to fix problems
✅ **Better visibility** - Know exactly what's running
✅ **Automated testing** - Verify monitoring works
✅ **Documentation** - Clear procedures for all scenarios

## Documentation

- **Full Guide:** `docs/ZOMBIE-PROCESS-PREVENTION.md`
- **Quick Reference:** `KILL-ZOMBIES.md`
- **This File:** Overview and quick start

## Support

If you encounter issues:
1. Check `docs/ZOMBIE-PROCESS-PREVENTION.md` for detailed troubleshooting
2. Run `npm run health:check` to diagnose
3. Check logs in `.logs/` directory
4. Review process list with `npm run dev:status`

---

**Remember:** Always use the management scripts instead of manual server starts/stops!
