#!/bin/bash

# Kill any existing processes on port 4003
echo "Checking for processes on port 4003..."
PID=$(lsof -i :4003 -t 2>/dev/null)
if [ ! -z "$PID" ]; then
  echo "Killing process $PID running on port 4003"
  kill -9 $PID
else
  echo "No process found on port 4003"
fi

# Load NVM
source ~/.nvm/nvm.sh

# Set environment variables for development mode
export PORT=4003
export NODE_ENV=development
export DISABLE_TENANT_MIDDLEWARE=true

echo "Starting reservation service in development mode with tenant middleware disabled..."
cd "$(dirname "$0")" || exit

# Start the service with explicit environment variables
npm run build && node dist/index.js
