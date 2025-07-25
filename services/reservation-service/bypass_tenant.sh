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

echo "Starting reservation service with tenant middleware disabled..."
node -e "
const express = require('express');
const http = require('http');

// Create a simple Express app
const app = express();

// Add JSON parsing middleware
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} \${req.method} \${req.url}\`);
  next();
});

// Forward all /api/reservations requests to the actual reservation service
app.use('/api/reservations', (req, res) => {
  // Add the tenant ID header
  req.headers['x-tenant-id'] = 'default-dev-tenant';
  
  // Forward to the real service
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: 4003,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      'x-tenant-id': 'default-dev-tenant'
    }
  };

  const proxy = http.request(options, (proxyRes) => {
    res.statusCode = proxyRes.statusCode;
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    let data = '';
    proxyRes.on('data', (chunk) => {
      data += chunk;
    });
    
    proxyRes.on('end', () => {
      res.end(data);
    });
  });

  req.on('data', (chunk) => {
    proxy.write(chunk);
  });

  req.on('end', () => {
    proxy.end();
  });

  proxy.on('error', (err) => {
    console.error('Proxy error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  });
});

// Start server
const server = http.createServer(app);
server.listen(4003, () => {
  console.log('Proxy server listening on port 4003');
});
"
