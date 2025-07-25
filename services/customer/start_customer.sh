#!/bin/bash
# Script to properly start the customer service

# Load NVM
source ~/.nvm/nvm.sh

# Change to the customer service directory
cd "$(dirname "$0")"

# Kill any existing processes on port 4004
lsof -i :4004 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || echo "No processes found on port 4004"

# Start the customer service with proper environment variables
echo "Starting customer service..."
NODE_ENV=development npm run start
