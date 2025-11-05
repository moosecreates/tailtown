# 🤖 Automated Zombie Process Prevention - Quick Start

## The Problem
Development servers create zombie processes that consume CPU and cause crashes.

## The Solution
Automated cleanup that runs without manual intervention.

---

## ⚡ One-Command Setup

```bash
cd /Users/robweinstein/CascadeProjects/tailtown
chmod +x setup-automation.sh
./setup-automation.sh
```

This installs:
- ✅ Background daemon (checks every 5 minutes)
- ✅ macOS LaunchAgent (starts automatically on login)
- ✅ Git hooks (cleanup during git operations)
- ✅ Shell commands (convenient tt-* aliases)

---

## 🎯 What You Get

### 1. Automatic Background Cleanup
- Runs continuously in the background
- Checks for zombies every 5 minutes
- Cleans up when >5 processes detected
- Starts automatically when you log in

### 2. Git Integration
- Cleans up before commits
- Cleans up when switching branches
- Cleans up after merging
- Prevents committing with zombies

### 3. Convenient Commands
```bash
tt-start       # Start all servers
tt-stop        # Stop all servers
tt-status      # Check status
tt-cleanup     # Clean up zombies
tt-check       # Quick health check
tt-health      # Full health report
```

---

## 📋 Daily Usage

### Morning
```bash
tt-check       # Check health
tt-start       # Start servers
```

### During Work
```bash
tt-status      # Check anytime
tt-restart     # Restart if needed
```

### End of Day
```bash
tt-stop        # Stop servers
```

**That's it!** The automation handles the rest.

---

## 🔍 Monitoring

### Check Status
```bash
# Quick check
tt-check

# Detailed check
npm run health:check

# Daemon status
npm run daemon:status
```

### View Logs
```bash
# Cleanup activity
tail -f .logs/cleanup-daemon.log

# Server logs
npm run dev:logs all
```

---

## ⚙️ Manual Control

### Daemon Control
```bash
npm run daemon:start     # Start daemon
npm run daemon:stop      # Stop daemon
npm run daemon:restart   # Restart daemon
npm run daemon:status    # Check status
```

### Server Control
```bash
npm run dev:start        # Start servers
npm run dev:stop         # Stop servers
npm run dev:restart      # Restart servers
npm run dev:status       # Check status
npm run dev:cleanup      # Manual cleanup
```

---

## 🧪 Testing

### Test the Daemon
```bash
# Check if running
npm run daemon:status

# View activity
tail -f .logs/cleanup-daemon.log
```

### Test Git Hooks
```bash
# Create some zombies (start/stop servers manually)
# Then try to commit
git commit -m "test"
# Should see cleanup message
```

### Test Shell Commands
```bash
tt-check
tt-zombies
tt-health
```

---

## 🚨 If Something Goes Wrong

### Emergency Cleanup
```bash
# Quick cleanup
tt-cleanup

# Or manual
pkill -9 -f "ts-node-dev"
pkill -9 -f "react-scripts"
```

### Restart Everything
```bash
# Stop all
tt-stop

# Clean up
tt-cleanup

# Start fresh
tt-start
```

### Check Logs
```bash
# Daemon logs
cat .logs/cleanup-daemon.log

# LaunchAgent logs
cat .logs/launchd-stdout.log
cat .logs/launchd-stderr.log
```

---

## 📚 Documentation

- **This File** - Quick start
- **`docs/AUTOMATION-SETUP.md`** - Complete automation guide
- **`README-ZOMBIE-PREVENTION.md`** - Prevention overview
- **`docs/ZOMBIE-PROCESS-PREVENTION.md`** - Detailed prevention guide
- **`KILL-ZOMBIES.md`** - Emergency procedures

---

## 🎉 Benefits

✅ **No more manual cleanup** - Runs automatically
✅ **No more crashes** - Catches zombies early
✅ **No more hangs** - Prevents accumulation
✅ **Peace of mind** - Always monitoring
✅ **Easy to use** - Simple commands
✅ **Well tested** - Automated tests included

---

## 💡 Tips

1. **Always use `tt-start` and `tt-stop`** instead of manual server starts
2. **Run `tt-check` regularly** to verify health
3. **Check logs occasionally** to see cleanup activity
4. **Restart terminal** after setup to load shell commands

---

## ❓ FAQ

**Q: Will this slow down my computer?**
A: No, the daemon uses minimal resources and only runs cleanup when needed.

**Q: What if I don't want automatic cleanup?**
A: You can stop the daemon with `npm run daemon:stop` and just use manual commands.

**Q: Can I adjust the check interval?**
A: Yes, edit `scripts/auto-cleanup-daemon.sh` and change `CHECK_INTERVAL`.

**Q: Does this work on Windows/Linux?**
A: The daemon and git hooks work everywhere. LaunchAgent is macOS only.

**Q: How do I uninstall?**
A: See `docs/AUTOMATION-SETUP.md` for uninstall instructions.

---

## 🚀 Get Started Now

```bash
# 1. Run setup
./setup-automation.sh

# 2. Restart terminal
source ~/.zshrc

# 3. Test it
tt-check

# 4. Start working
tt-start
```

**That's it! You're protected from zombie processes.**
