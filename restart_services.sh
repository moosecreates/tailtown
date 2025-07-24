#!/bin/bash

# Stop any running services
echo "Stopping any running services..."
pkill -f "node dist/index.js" || true
pkill -f "react-scripts start" || true

# Wait a moment for processes to terminate
sleep 2

# Start customer service with correct database connection
echo "Starting customer service..."
cd /Users/robweinstein/CascadeProjects/tailtown/services/customer
source ~/.nvm/nvm.sh
PORT=4004 node dist/index.js > customer.log 2>&1 &
echo "Customer service started on port 4004"

# Wait a moment for customer service to initialize
sleep 2

# Start reservation service
echo "Starting reservation service..."
cd /Users/robweinstein/CascadeProjects/tailtown/services/reservation-service
source ~/.nvm/nvm.sh
node dist/index.js > reservation.log 2>&1 &
echo "Reservation service started on port 4003"

# Wait a moment for reservation service to initialize
sleep 2

# Start frontend
echo "Starting frontend..."
cd /Users/robweinstein/CascadeProjects/tailtown/frontend
source ~/.nvm/nvm.sh
npm start > frontend.log 2>&1 &
echo "Frontend started on port 3000"

echo "All services started. Check individual log files for details."
