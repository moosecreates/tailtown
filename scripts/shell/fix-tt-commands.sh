#!/bin/bash

# Fix tt-* commands to use simpler scripts

echo "🔧 Fixing tt-* commands..."
echo ""

# Make the simple scripts executable
chmod +x /Users/robweinstein/CascadeProjects/tailtown/scripts/start-dev-simple.sh
chmod +x /Users/robweinstein/CascadeProjects/tailtown/scripts/stop-dev-simple.sh

# Create a temporary file with the updated aliases
cat > /tmp/tailtown-aliases-fix.sh << 'EOF'

# Update Tailtown aliases to use simple scripts
alias tt-start='/Users/robweinstein/CascadeProjects/tailtown/scripts/start-dev-simple.sh'
alias tt-stop='/Users/robweinstein/CascadeProjects/tailtown/scripts/stop-dev-simple.sh'
alias tt-restart='tt-stop && sleep 2 && tt-start'
alias tt-cleanup='pkill -9 -f "ts-node-dev" 2>/dev/null; pkill -9 -f "react-scripts" 2>/dev/null; echo "✅ Cleanup complete"'

EOF

echo "✅ Simple start/stop scripts created"
echo ""
echo "To apply the fix, run these commands:"
echo ""
echo "  source /tmp/tailtown-aliases-fix.sh"
echo ""
echo "Or add them permanently to your ~/.zshrc:"
echo ""
echo "  cat /tmp/tailtown-aliases-fix.sh >> ~/.zshrc"
echo "  source ~/.zshrc"
echo ""
echo "Then test with:"
echo "  tt-start"
