#!/bin/bash

# Tailtown Auto-Cleanup Daemon
# Runs in background and automatically cleans up zombie processes

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DAEMON_PID_FILE="$PROJECT_ROOT/.pids/cleanup-daemon.pid"
DAEMON_LOG="$PROJECT_ROOT/.logs/cleanup-daemon.log"
CHECK_INTERVAL=300  # 5 minutes
ZOMBIE_THRESHOLD=5

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

mkdir -p "$PROJECT_ROOT/.pids" "$PROJECT_ROOT/.logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$DAEMON_LOG"
}

count_zombies() {
    ps aux | grep -E "(ts-node-dev|react-scripts)" | grep -v grep | wc -l | tr -d ' '
}

cleanup_zombies() {
    local count=$(count_zombies)
    
    if [ "$count" -gt "$ZOMBIE_THRESHOLD" ]; then
        log "⚠️  Found $count zombie processes (threshold: $ZOMBIE_THRESHOLD) - cleaning up..."
        
        pkill -9 -f "ts-node-dev" 2>/dev/null || true
        pkill -9 -f "react-scripts" 2>/dev/null || true
        
        sleep 2
        
        local new_count=$(count_zombies)
        log "✅ Cleanup complete. Remaining processes: $new_count"
        
        return 0
    fi
    
    return 1
}

start_daemon() {
    if [ -f "$DAEMON_PID_FILE" ]; then
        local pid=$(cat "$DAEMON_PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}Daemon already running (PID: $pid)${NC}"
            exit 0
        fi
    fi
    
    log "🚀 Starting auto-cleanup daemon (check interval: ${CHECK_INTERVAL}s)"
    
    # Run in background
    (
        while true; do
            if cleanup_zombies; then
                log "🔔 Automatic cleanup triggered"
            fi
            sleep "$CHECK_INTERVAL"
        done
    ) &
    
    echo $! > "$DAEMON_PID_FILE"
    echo -e "${GREEN}✅ Daemon started (PID: $(cat $DAEMON_PID_FILE))${NC}"
    echo -e "   Log: $DAEMON_LOG"
    echo -e "   Check interval: ${CHECK_INTERVAL}s"
    echo -e "   Zombie threshold: $ZOMBIE_THRESHOLD"
}

stop_daemon() {
    if [ ! -f "$DAEMON_PID_FILE" ]; then
        echo -e "${YELLOW}Daemon not running${NC}"
        exit 0
    fi
    
    local pid=$(cat "$DAEMON_PID_FILE")
    
    if ps -p "$pid" > /dev/null 2>&1; then
        log "🛑 Stopping daemon (PID: $pid)"
        kill "$pid" 2>/dev/null || true
        rm -f "$DAEMON_PID_FILE"
        echo -e "${GREEN}✅ Daemon stopped${NC}"
    else
        echo -e "${YELLOW}Daemon not running (stale PID file)${NC}"
        rm -f "$DAEMON_PID_FILE"
    fi
}

status_daemon() {
    if [ ! -f "$DAEMON_PID_FILE" ]; then
        echo -e "${RED}✗ Daemon not running${NC}"
        exit 1
    fi
    
    local pid=$(cat "$DAEMON_PID_FILE")
    
    if ps -p "$pid" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Daemon running (PID: $pid)${NC}"
        echo -e "  Log: $DAEMON_LOG"
        echo -e "  Current zombie count: $(count_zombies)"
        echo -e "  Threshold: $ZOMBIE_THRESHOLD"
        exit 0
    else
        echo -e "${RED}✗ Daemon not running (stale PID file)${NC}"
        rm -f "$DAEMON_PID_FILE"
        exit 1
    fi
}

case "${1:-}" in
    start)
        start_daemon
        ;;
    stop)
        stop_daemon
        ;;
    restart)
        stop_daemon
        sleep 1
        start_daemon
        ;;
    status)
        status_daemon
        ;;
    *)
        echo "Tailtown Auto-Cleanup Daemon"
        echo ""
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Automatically monitors and cleans up zombie processes"
        echo "Check interval: ${CHECK_INTERVAL}s"
        echo "Zombie threshold: $ZOMBIE_THRESHOLD processes"
        exit 1
        ;;
esac
