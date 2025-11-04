# Run This Now - Manual Setup

Copy and paste these commands directly into your terminal:

## Step 1: Make Scripts Executable

```bash
cd /Users/robweinstein/CascadeProjects/tailtown

chmod +x setup-automation.sh
chmod +x scripts/auto-cleanup-daemon.sh
chmod +x scripts/install-launchd.sh
chmod +x scripts/setup-git-hooks.sh
chmod +x scripts/setup-shell-integration.sh
chmod +x scripts/dev-servers.sh
chmod +x scripts/health-check.js
```

## Step 2: Run Full Setup

```bash
./setup-automation.sh
```

**OR** run each part separately:

### Option A: Just the Daemon (Quick Start)

```bash
# Start the background daemon
./scripts/auto-cleanup-daemon.sh start

# Check it's running
./scripts/auto-cleanup-daemon.sh status
```

### Option B: Full Automation (Recommended)

```bash
# Install LaunchAgent (starts on login)
./scripts/install-launchd.sh

# Install Git hooks
./scripts/setup-git-hooks.sh

# Install shell commands
./scripts/setup-shell-integration.sh

# Reload shell
source ~/.zshrc
```

## Step 3: Test It

```bash
# Check health
node scripts/health-check.js

# Or if shell integration installed
tt-check

# Check daemon status
./scripts/auto-cleanup-daemon.sh status
```

## Step 4: Start Using It

```bash
# Start servers (with automatic cleanup)
npm run dev:start

# Or with shell commands
tt-start
```

---

## Quick Commands Reference

```bash
# Daemon control
npm run daemon:start
npm run daemon:stop
npm run daemon:status

# Server control
npm run dev:start
npm run dev:stop
npm run dev:status
npm run dev:cleanup

# Health check
npm run health:check

# Shell commands (after setup)
tt-start
tt-stop
tt-check
tt-cleanup
```

---

## If You Just Want Manual Control

Skip automation and just use these:

```bash
# Start servers
npm run dev:start

# Stop servers
npm run dev:stop

# Check health
npm run health:check

# Manual cleanup
npm run dev:cleanup
```

---

## Troubleshooting

If commands hang, open a new terminal and run:

```bash
cd /Users/robweinstein/CascadeProjects/tailtown

# Kill zombies
pkill -9 -f "ts-node-dev"
pkill -9 -f "react-scripts"

# Then try again
npm run dev:start
```
