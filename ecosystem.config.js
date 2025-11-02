/**
 * PM2 Ecosystem Configuration
 * Production process management for Tailtown services
 */

module.exports = {
  apps: [
    {
      name: 'customer-service',
      cwd: './services/customer',
      script: 'dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4004
      },
      error_file: '/var/log/tailtown/customer-error.log',
      out_file: '/var/log/tailtown/customer-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    },
    {
      name: 'reservation-service',
      cwd: './services/reservation-service',
      script: 'dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4003
      },
      error_file: '/var/log/tailtown/reservation-error.log',
      out_file: '/var/log/tailtown/reservation-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    }
  ]
};
