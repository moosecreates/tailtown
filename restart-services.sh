#!/bin/bash

echo "🔄 Restarting Tailtown Services..."
echo ""

# Kill any existing services
echo "Stopping existing services..."
lsof -ti :4004 | xargs kill -9 2>/dev/null
lsof -ti :4003 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
lsof -ti :3001 | xargs kill -9 2>/dev/null
sleep 2

# Start Customer Service (Terminal 1)
echo "Starting Customer Service on port 4004..."
osascript -e 'tell app "Terminal" to do script "cd /Users/robweinstein/CascadeProjects/tailtown/services/customer && source ~/.nvm/nvm.sh && echo \"Starting Customer Service...\" && npm run dev"'
sleep 3

# Start Reservation Service (Terminal 2)
echo "Starting Reservation Service on port 4003..."
osascript -e 'tell app "Terminal" to do script "cd /Users/robweinstein/CascadeProjects/tailtown/services/reservation-service && source ~/.nvm/nvm.sh && echo \"Starting Reservation Service...\" && npm run dev"'
sleep 3

# Start Frontend (Terminal 3)
echo "Starting Frontend on port 3000..."
osascript -e 'tell app "Terminal" to do script "cd /Users/robweinstein/CascadeProjects/tailtown/frontend && source ~/.nvm/nvm.sh && echo \"Starting Frontend...\" && npm start"'
sleep 3

# Start Admin Portal (Terminal 4)
echo "Starting Admin Portal on port 3001..."
osascript -e 'tell app "Terminal" to do script "cd /Users/robweinstein/CascadeProjects/tailtown/admin-portal && source ~/.nvm/nvm.sh && echo \"Starting Admin Portal...\" && npm start"'

echo ""
echo "✅ All services starting in separate terminal windows!"
echo ""
echo "📍 Service URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - Admin Portal: http://localhost:3001"
echo "   - Reservation Service: http://localhost:4003"
echo "   - Customer Service: http://localhost:4004"
echo ""
echo "📡 MCP RAG Server:"
echo "   - Configured in Windsurf (restart Windsurf to activate)"
echo ""
echo "⏳ Please wait 15-20 seconds for all services to fully start..."
