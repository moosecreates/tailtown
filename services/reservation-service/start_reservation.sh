#!/bin/bash
echo "Starting reservation service..."

# Kill any existing processes on port 4003
lsof -i :4003 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || echo "No processes found on port 4003"

# Load NVM 
source ~/.nvm/nvm.sh

# Start the reservation service with explicit PORT setting
cd /Users/robweinstein/CascadeProjects/tailtown/services/reservation-service
PORT=4003 npm start
