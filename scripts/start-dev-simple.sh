#!/bin/bash

# Simple Tailtown Server Starter
# Reliable script to start all development servers

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 Starting Tailtown Development Servers..."
echo ""

# Clean up any zombies first
echo "🧹 Cleaning up zombie processes..."
pkill -9 -f "ts-node-dev" 2>/dev/null || true
pkill -9 -f "react-scripts" 2>/dev/null || true
sleep 2

# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "✓ Cleanup complete"
echo ""

# Start customer service
echo "Starting Customer Service (port 4004)..."
cd "$PROJECT_ROOT/services/customer"
PORT=4004 npm run dev > "$PROJECT_ROOT/.logs/customer-service.log" 2>&1 &
CUSTOMER_PID=$!
echo "  PID: $CUSTOMER_PID"
sleep 2

# Start reservation service
echo "Starting Reservation Service (port 4003)..."
cd "$PROJECT_ROOT/services/reservation-service"
PORT=4003 npm run dev > "$PROJECT_ROOT/.logs/reservation-service.log" 2>&1 &
RESERVATION_PID=$!
echo "  PID: $RESERVATION_PID"
sleep 2

# Start frontend
echo "Starting Frontend (port 3000)..."
cd "$PROJECT_ROOT/frontend"
npm start > "$PROJECT_ROOT/.logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "  PID: $FRONTEND_PID"

echo ""
echo "✅ All servers started!"
echo ""
echo "Services:"
echo "  Customer Service:    http://localhost:4004 (PID: $CUSTOMER_PID)"
echo "  Reservation Service: http://localhost:4003 (PID: $RESERVATION_PID)"
echo "  Frontend:            http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Logs:"
echo "  tail -f $PROJECT_ROOT/.logs/customer-service.log"
echo "  tail -f $PROJECT_ROOT/.logs/reservation-service.log"
echo "  tail -f $PROJECT_ROOT/.logs/frontend.log"
echo ""
echo "To stop: npm run dev:stop"
