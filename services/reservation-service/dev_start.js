/**
 * Tailtown Reservation Service Development Server
 * 
 * This script starts the reservation service with tenant ID injection
 * to make development easier without having to provide tenant headers.
 */

// This is a simple wrapper around the main index.js file
// It sets environment variables for development and provides additional logging
const { spawn } = require('child_process');
const { execSync } = require('child_process');

console.log('=== Tailtown Reservation Service - Development Mode ===');

// Kill any existing processes on port 4003
try {
  console.log('Checking for processes on port 4003...');
  execSync('lsof -i :4003 | grep LISTEN | awk \'{print $2}\' | xargs kill -9 2>/dev/null || echo "No processes found on port 4003"');
  console.log('Port 4003 is clear');
} catch (error) {
  console.log('No existing processes on port 4003');
}

// Set environment variables
const env = {
  ...process.env,
  NODE_ENV: 'development',
  PORT: '4003',
  DEBUG: 'true', // Enable additional debug logging
  LOG_LEVEL: 'debug', // Set log level to debug for more verbose output
};

console.log('Starting reservation service with development environment...');
console.log(`PORT: ${env.PORT}`);
console.log(`NODE_ENV: ${env.NODE_ENV}`);

// Start the service
const serviceProcess = spawn('node', ['dist/index.js'], {
  env,
  stdio: 'inherit', // Forward all output to console
  cwd: process.cwd(),
});

// Handle process exit
serviceProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Reservation service exited with code ${code} and signal ${signal}`);
    process.exit(code || 1);
  } else {
    console.log('Reservation service exited successfully');
    process.exit(0);
  }
});

// Handle process errors
serviceProcess.on('error', (err) => {
  console.error('Failed to start reservation service:', err);
  process.exit(1);
});

// Handle SIGINT to gracefully shut down the service
process.on('SIGINT', () => {
  console.log('Shutting down reservation service...');
  serviceProcess.kill('SIGINT');
});
