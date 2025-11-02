# Automated Zombie Process Prevention

This guide shows you how to set up automatic cleanup that runs without manual intervention.

## 🎯 Automation Options

Choose one or more automation methods based on your needs:

### 1. **Background Daemon** (Recommended)
Runs continuously in the background, checking every 5 minutes.

### 2. **macOS LaunchAgent** (Best for Mac)
Starts automatically when you log in, runs in background.

### 3. **Git Hooks** (Development Workflow)
Automatically cleans up during git operations.

### 4. **Shell Integration** (Terminal Commands)
Adds convenient aliases and optional auto-cleanup.

---

## 🚀 Quick Setup (All Automation)

Run this single command to set up everything:

```bash
cd /Users/robweinstein/CascadeProjects/tailtown

# Make scripts executable
chmod +x scripts/*.sh

# Install all automation
npm run setup:automation    # macOS LaunchAgent
npm run setup:git-hooks     # Git hooks
npm run setup:shell         # Shell aliases

# Restart terminal
source ~/.zshrc
```

---

## Option 1: Background Daemon

### What It Does
- Runs in background continuously
- Checks for zombies every 5 minutes
- Automatically cleans up when >5 processes detected
- Logs all activity

### Setup

```bash
# Start the daemon
npm run daemon:start

# Check status
npm run daemon:status

# Stop the daemon
npm run daemon:stop

# Restart
npm run daemon:restart
```

### Manual Control

```bash
# Start manually
./scripts/auto-cleanup-daemon.sh start

# Check logs
tail -f .logs/cleanup-daemon.log

# Stop
./scripts/auto-cleanup-daemon.sh stop
```

### Pros & Cons

✅ **Pros:**
- Runs continuously
- Catches zombies quickly
- Low resource usage
- Easy to control

❌ **Cons:**
- Needs manual start after reboot
- Runs even when not developing
- Uses small amount of memory

---

## Option 2: macOS LaunchAgent (Recommended for Mac)

### What It Does
- Starts automatically when you log in
- Runs the background daemon
- Restarts if it crashes
- Managed by macOS

### Setup

```bash
# Install LaunchAgent
npm run setup:automation

# This will:
# 1. Create LaunchAgent plist file
# 2. Make scripts executable
# 3. Load the service
# 4. Start automatically
```

### Verify Installation

```bash
# Check if running
launchctl list | grep com.tailtown.cleanup

# View logs
tail -f .logs/cleanup-daemon.log
tail -f .logs/launchd-stdout.log
```

### Control Commands

```bash
# Stop service
launchctl unload ~/Library/LaunchAgents/com.tailtown.cleanup.plist

# Start service
launchctl load ~/Library/LaunchAgents/com.tailtown.cleanup.plist

# Remove service
launchctl unload ~/Library/LaunchAgents/com.tailtown.cleanup.plist
rm ~/Library/LaunchAgents/com.tailtown.cleanup.plist
```

### Pros & Cons

✅ **Pros:**
- Fully automatic
- Starts on login
- Restarts on crash
- Native macOS integration

❌ **Cons:**
- macOS only
- Runs all the time
- Requires setup

---

## Option 3: Git Hooks

### What It Does
- Checks for zombies before commits
- Cleans up when switching branches
- Cleans up after merging
- Reminds you to restart servers

### Setup

```bash
# Install git hooks
npm run setup:git-hooks
```

### Hooks Installed

1. **pre-commit**: Cleans up before committing
2. **post-checkout**: Cleans up after branch switch
3. **post-merge**: Cleans up after merging

### Example Output

```bash
$ git commit -m "Update feature"
🔍 Checking for zombie processes...
⚠️  Warning: Found 12 zombie processes
   Running cleanup before commit...
✅ Cleanup complete. Remaining processes: 0
[main abc1234] Update feature
```

### Pros & Cons

✅ **Pros:**
- Automatic during git operations
- No background process
- Catches issues at key moments
- Zero overhead when not using git

❌ **Cons:**
- Only runs during git operations
- Won't catch zombies between commits
- Can slow down git commands slightly

---

## Option 4: Shell Integration

### What It Does
- Adds convenient `tt-*` commands
- Optional cleanup on terminal exit
- Optional auto-check when entering directory
- Quick status checks

### Setup

```bash
# Install shell integration
npm run setup:shell

# Restart terminal or reload
source ~/.zshrc
```

### Commands Added

```bash
tt-health      # Run health check
tt-start       # Start all servers
tt-stop        # Stop all servers
tt-restart     # Restart servers
tt-status      # Check status
tt-cleanup     # Clean up zombies
tt-logs        # View logs
tt-check       # Quick status check
tt-zombies     # Count zombie processes
```

### Example Usage

```bash
$ tt-check
🔍 Tailtown Status Check

Zombie processes: 4
✅ Normal (3-6 expected when running)

Ports in use:
node    12345 user   28u  IPv4 0x123  TCP *:3000 (LISTEN)
node    12346 user   28u  IPv4 0x456  TCP *:4003 (LISTEN)
node    12347 user   28u  IPv4 0x789  TCP *:4004 (LISTEN)
```

### Optional Features

Edit `~/.zshrc` to enable:

```bash
# Cleanup on terminal exit
trap tailtown_cleanup_on_exit EXIT

# Auto-check when entering tailtown directory
chpwd_functions+=(tailtown_auto_check)
```

### Pros & Cons

✅ **Pros:**
- Convenient commands
- No background process
- Customizable
- Works in any terminal

❌ **Cons:**
- Requires manual commands
- Optional features need enabling
- Shell-specific (zsh)

---

## 🎨 Recommended Setup

### For Active Development

```bash
# 1. Install LaunchAgent (automatic background)
npm run setup:automation

# 2. Install Git hooks (safety net)
npm run setup:git-hooks

# 3. Install shell commands (convenience)
npm run setup:shell

# 4. Restart terminal
source ~/.zshrc
```

### For Occasional Development

```bash
# Just use manual commands
npm run dev:start    # Start with cleanup
npm run dev:stop     # Stop with cleanup
npm run health:check # Check anytime
```

### For Team Members

Add to project README:

```bash
# First time setup
npm run setup:git-hooks

# Daily use
npm run dev:start
npm run dev:stop
```

---

## 📊 Monitoring

### Check Daemon Status

```bash
# Quick check
npm run daemon:status

# Detailed check
npm run health:check

# View logs
tail -f .logs/cleanup-daemon.log
```

### View Activity

```bash
# Daemon logs
tail -f .logs/cleanup-daemon.log

# LaunchAgent logs
tail -f .logs/launchd-stdout.log
tail -f .logs/launchd-stderr.log

# Server logs
npm run dev:logs all
```

### Statistics

```bash
# Count current zombies
ps aux | grep -E "(ts-node-dev|react-scripts)" | grep -v grep | wc -l

# Show zombie details
ps aux | grep -E "(ts-node-dev|react-scripts)" | grep -v grep

# Check cleanup history
grep "cleanup" .logs/cleanup-daemon.log
```

---

## 🔧 Configuration

### Adjust Check Interval

Edit `scripts/auto-cleanup-daemon.sh`:

```bash
CHECK_INTERVAL=300  # Change to desired seconds (default: 5 minutes)
```

### Adjust Zombie Threshold

Edit `scripts/auto-cleanup-daemon.sh`:

```bash
ZOMBIE_THRESHOLD=5  # Change to desired count (default: 5)
```

### Customize Git Hooks

Edit files in `.git/hooks/`:
- `pre-commit`
- `post-checkout`
- `post-merge`

### Customize Shell Commands

Edit `~/.zshrc` in the Tailtown section.

---

## 🧪 Testing

### Test Daemon

```bash
# Start daemon
npm run daemon:start

# Create some zombie processes (for testing)
# ... start and stop servers manually a few times ...

# Check if daemon detects them
tail -f .logs/cleanup-daemon.log

# Should see cleanup messages when threshold exceeded
```

### Test Git Hooks

```bash
# Create zombies
# ... start servers ...

# Try to commit
git commit -m "test"

# Should see cleanup message
```

### Test Shell Commands

```bash
# After setup
tt-check
tt-zombies
tt-health
```

---

## 🚨 Troubleshooting

### Daemon Won't Start

```bash
# Check if already running
npm run daemon:status

# Check logs
cat .logs/cleanup-daemon.log

# Try manual start
./scripts/auto-cleanup-daemon.sh start
```

### LaunchAgent Not Working

```bash
# Check if loaded
launchctl list | grep tailtown

# Check logs
cat .logs/launchd-stderr.log

# Reload
launchctl unload ~/Library/LaunchAgents/com.tailtown.cleanup.plist
launchctl load ~/Library/LaunchAgents/com.tailtown.cleanup.plist
```

### Shell Commands Not Found

```bash
# Reload shell config
source ~/.zshrc

# Check if integration added
grep "Tailtown" ~/.zshrc

# Re-run setup
npm run setup:shell
```

### Cleanup Not Working

```bash
# Test manual cleanup
npm run dev:cleanup

# Check for permission issues
ls -la scripts/*.sh

# Make executable
chmod +x scripts/*.sh
```

---

## 📝 Uninstall

### Remove LaunchAgent

```bash
launchctl unload ~/Library/LaunchAgents/com.tailtown.cleanup.plist
rm ~/Library/LaunchAgents/com.tailtown.cleanup.plist
```

### Remove Git Hooks

```bash
rm .git/hooks/pre-commit
rm .git/hooks/post-checkout
rm .git/hooks/post-merge
```

### Remove Shell Integration

Edit `~/.zshrc` and remove the Tailtown section.

### Stop Daemon

```bash
npm run daemon:stop
```

---

## 🎯 Summary

| Method | Automatic | Setup | Best For |
|--------|-----------|-------|----------|
| **Daemon** | ✅ Yes | Easy | Active development |
| **LaunchAgent** | ✅ Yes | Medium | Mac users, always-on |
| **Git Hooks** | ⚠️ Partial | Easy | Safety net |
| **Shell** | ❌ No | Easy | Convenience |

**Recommendation:** Use LaunchAgent + Git Hooks + Shell for complete coverage.

---

## 📚 Related Documentation

- `README-ZOMBIE-PREVENTION.md` - Quick start guide
- `docs/ZOMBIE-PROCESS-PREVENTION.md` - Detailed prevention guide
- `KILL-ZOMBIES.md` - Emergency procedures
- `scripts/health-check.js` - Health monitoring
- `scripts/dev-servers.sh` - Server management
