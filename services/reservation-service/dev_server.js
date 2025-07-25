/**
 * Development Server for Reservation Service
 * 
 * This script starts a special development server for the reservation service
 * that automatically adds a tenant ID header to all requests.
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create a simple Express app that will proxy requests to the reservation service
const app = express();
const port = 4003; // Use the same port as the reservation service

console.log('Starting development proxy server for reservation service...');
console.log('This server will automatically add tenant headers to all requests');

// Kill any existing process on port 4003
try {
  const { execSync } = require('child_process');
  execSync('lsof -i :4003 | grep LISTEN | awk \'{print $2}\' | xargs kill -9 2>/dev/null || echo "No processes found on port 4003"');
  console.log('Killed any existing processes on port 4003');
} catch (error) {
  console.log('No existing processes to kill or error occurred:', error.message);
}

// Start the actual reservation service on a different port
const { spawn } = require('child_process');
console.log('Starting reservation service on port 4005...');

// Set up environment for the child process
const env = { 
  ...process.env,
  PORT: '4005', 
  NODE_ENV: 'development'
};

// Start the reservation service
const serviceProcess = spawn('node', ['dist/index.js'], { 
  cwd: process.cwd(),
  env,
  stdio: 'inherit'
});

// Set up proxy middleware with tenant header injection
const proxyOptions = {
  target: 'http://localhost:4005',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Add tenant header to all requests
    proxyReq.setHeader('x-tenant-id', 'default-dev-tenant');
    console.log(`Proxying ${req.method} ${req.url} with tenant header`);
  }
};

const apiProxy = createProxyMiddleware(proxyOptions);

// Apply proxy middleware to all routes
app.use('/', apiProxy);

// Start the proxy server
app.listen(port, () => {
  console.log(`Development proxy running on port ${port}`);
  console.log(`All requests will be forwarded to port 4005 with a tenant header`);
  console.log(`To test: curl http://localhost:4003/api/reservations`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down development server...');
  serviceProcess.kill();
  process.exit();
});
