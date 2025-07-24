#!/bin/bash

# Function to check if a port is in use
is_port_in_use() {
  lsof -i:$1 >/dev/null 2>&1
  return $?
}

# Kill all existing Node.js processes
echo "Stopping all Node.js processes..."
pkill -f "node" || true
sleep 2

# Check if ports are still in use
if is_port_in_use 4003 || is_port_in_use 4004 || is_port_in_use 3000; then
  echo "Some ports are still in use. Trying to force kill processes..."
  lsof -ti:4003,4004,3000 | xargs kill -9 2>/dev/null || true
  sleep 2
fi

# Start customer service
echo "Starting customer service on port 4004..."
cd /Users/robweinstein/CascadeProjects/tailtown/services/customer
source ~/.nvm/nvm.sh
PORT=4004 npm start &
sleep 5

# Start reservation service
echo "Starting reservation service on port 4003..."
cd /Users/robweinstein/CascadeProjects/tailtown/services/reservation-service
source ~/.nvm/nvm.sh
PORT=4003 npm start &
sleep 5

# Start frontend
echo "Starting frontend on port 3000..."
cd /Users/robweinstein/CascadeProjects/tailtown/frontend
source ~/.nvm/nvm.sh
npm start &

echo "All services started!"
echo "Customer service: http://localhost:4004"
echo "Reservation service: http://localhost:4003"
echo "Frontend: http://localhost:3000"
