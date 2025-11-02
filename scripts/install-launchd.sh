#!/bin/bash

# Install LaunchAgent for automatic cleanup on macOS
# This makes the cleanup run automatically when you log in

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLIST_NAME="com.tailtown.cleanup"
PLIST_FILE="$HOME/Library/LaunchAgents/${PLIST_NAME}.plist"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Installing Tailtown Auto-Cleanup Service${NC}"
echo ""

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$HOME/Library/LaunchAgents"

# Create the plist file
cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${PLIST_NAME}</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>${PROJECT_ROOT}/scripts/auto-cleanup-daemon.sh</string>
        <string>start</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    
    <key>StandardOutPath</key>
    <string>${PROJECT_ROOT}/.logs/launchd-stdout.log</string>
    
    <key>StandardErrorPath</key>
    <string>${PROJECT_ROOT}/.logs/launchd-stderr.log</string>
    
    <key>WorkingDirectory</key>
    <string>${PROJECT_ROOT}</string>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
    
    <key>ThrottleInterval</key>
    <integer>300</integer>
</dict>
</plist>
EOF

echo -e "${GREEN}✓ Created LaunchAgent plist${NC}"
echo -e "  Location: $PLIST_FILE"
echo ""

# Make scripts executable
chmod +x "$PROJECT_ROOT/scripts/auto-cleanup-daemon.sh"
chmod +x "$PROJECT_ROOT/scripts/dev-servers.sh"
chmod +x "$PROJECT_ROOT/scripts/health-check.js"

echo -e "${GREEN}✓ Made scripts executable${NC}"
echo ""

# Load the LaunchAgent
launchctl unload "$PLIST_FILE" 2>/dev/null || true
launchctl load "$PLIST_FILE"

echo -e "${GREEN}✓ Loaded LaunchAgent${NC}"
echo ""

# Check status
if launchctl list | grep -q "$PLIST_NAME"; then
    echo -e "${GREEN}✅ Auto-cleanup service installed and running!${NC}"
    echo ""
    echo "The service will:"
    echo "  • Start automatically when you log in"
    echo "  • Check for zombie processes every 5 minutes"
    echo "  • Clean up when >5 zombie processes detected"
    echo "  • Restart automatically if it crashes"
    echo ""
    echo "Commands:"
    echo "  Stop:    launchctl unload $PLIST_FILE"
    echo "  Start:   launchctl load $PLIST_FILE"
    echo "  Status:  launchctl list | grep $PLIST_NAME"
    echo "  Logs:    tail -f ${PROJECT_ROOT}/.logs/cleanup-daemon.log"
else
    echo -e "${YELLOW}⚠️  Service installed but not running${NC}"
    echo "Try: launchctl load $PLIST_FILE"
fi
