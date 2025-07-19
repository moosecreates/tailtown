const { createProxyMiddleware } = require('http-proxy-middleware');

// Default tenant ID for development - must be longer than 5 characters for API validation
const DEFAULT_TENANT_ID = 'organization-123456';

// Helper function to add tenant ID to requests
const addTenantIdToRequest = (proxyReq, req, res) => {
  // Add tenant ID header to all proxied requests
  proxyReq.setHeader('X-Tenant-ID', DEFAULT_TENANT_ID);
};

module.exports = function(app) {
  // Proxy customer service requests
  app.use(
    '/api/customers',
    createProxyMiddleware({
      target: 'http://localhost:3003',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // remove /api prefix when forwarding to target
      },
      logLevel: 'debug',
      onProxyReq: addTenantIdToRequest,
      onError: (err, req, res) => {
        console.error('Customer Service Proxy Error:', err);
        res.status(500).json({ error: 'Proxy Error', details: err.message });
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID'
      }
    })
  );
  
  // Proxy reservation service requests
  app.use(
    '/api/reservations',
    createProxyMiddleware({
      target: 'http://localhost:4003',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // remove /api prefix when forwarding to target
      },
      logLevel: 'debug',
      onProxyReq: addTenantIdToRequest,
      onError: (err, req, res) => {
        console.error('Reservation Service Proxy Error:', err);
        res.status(500).json({ error: 'Proxy Error', details: err.message });
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID'
      }
    })
  );
  
  // Default proxy for other API requests
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3003', // Default to customer service
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // remove /api prefix when forwarding to target
      },
      logLevel: 'debug',
      onProxyReq: addTenantIdToRequest,
      onError: (err, req, res) => {
        console.error('Default Proxy Error:', err);
        res.status(500).json({ error: 'Proxy Error', details: err.message });
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID'
      }
    })
  );
};
