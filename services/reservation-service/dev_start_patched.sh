#!/bin/bash

# Robust Development Start Script for Reservation Service
# This script patches the compiled code to bypass tenant checks in development mode

echo "=== Tailtown Reservation Service - Development Mode ==="
echo "Starting development environment with patched tenant checks..."

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

# Rebuild the TypeScript code
echo "Building TypeScript..."
npm run build

# Patch the compiled controller files to bypass tenant checks in development mode
echo "Patching compiled controllers for development mode..."

# Find all controller files that might have tenant checks
CONTROLLERS=$(find dist/controllers -name "*.js" -type f)

# Function to patch tenant check in a file
patch_tenant_check() {
  local file=$1
  echo "Patching $file..."
  
  # Create a backup of the original file
  cp "$file" "${file}.bak"
  
  # Replace the tenant check with a conditional check that provides a default tenant ID in development
  sed -i '' 's/const tenantId = req.tenantId;/let tenantId = req.tenantId || "default-dev-tenant";/g' "$file"
  sed -i '' 's/if (!tenantId) {/if (!tenantId \&\& process.env.NODE_ENV !== "development") {/g' "$file"
}

# Patch each controller file
for controller in $CONTROLLERS; do
  if grep -q "tenantId = req.tenantId" "$controller"; then
    patch_tenant_check "$controller"
  fi
done

echo "Starting patched reservation service..."
NODE_ENV=development PORT=4003 node dist/index.js
