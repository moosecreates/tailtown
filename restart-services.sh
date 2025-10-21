#!/bin/bash

echo "🔄 Restarting Tailtown Services..."
echo ""

# Kill any existing services
echo "Stopping existing services..."
lsof -ti :4004 | xargs kill -9 2>/dev/null
lsof -ti :4003 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
sleep 2

# Start Customer Service (Terminal 1)
echo "Starting Customer Service on port 4004..."
osascript -e 'tell app "Terminal" to do script "cd /Users/robweinstein/CascadeProjects/tailtown/services/customer && echo \"Starting Customer Service...\" && npm run dev"'
sleep 3

# Start Reservation Service (Terminal 2)
echo "Starting Reservation Service on port 4003..."
osascript -e 'tell app "Terminal" to do script "cd /Users/robweinstein/CascadeProjects/tailtown/services/reservation-service && echo \"Starting Reservation Service...\" && npm run dev"'
sleep 3

# Start Frontend (Terminal 3)
echo "Starting Frontend on port 3000..."
osascript -e 'tell app "Terminal" to do script "cd /Users/robweinstein/CascadeProjects/tailtown/frontend && echo \"Starting Frontend...\" && npm start"'

echo ""
echo "✅ All services starting in separate terminal windows!"
echo ""
echo "📍 Service URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - Customer Service: http://localhost:4004"
echo "   - Reservation Service: http://localhost:4003"
echo ""
echo "⏳ Please wait 10-15 seconds for services to fully start..."
