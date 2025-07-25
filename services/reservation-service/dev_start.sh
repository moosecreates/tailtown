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

# Set environment variables
export PORT=4003
export NODE_ENV=development
export DISABLE_TENANT_MIDDLEWARE=true

echo "Rebuilding Prisma client with updated schema..."
npx prisma generate

echo "Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
  echo "Build successful! Starting reservation service without tenant middleware..."
  node dist/index.js
else
  echo "Build failed. Check the errors above."
  exit 1
fi
