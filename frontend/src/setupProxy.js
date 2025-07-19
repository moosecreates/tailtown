const { createProxyMiddleware } = require('http-proxy-middleware');

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
      onError: (err, req, res) => {
        console.error('Customer Service Proxy Error:', err);
        res.status(500).json({ error: 'Proxy Error', details: err.message });
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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
      onError: (err, req, res) => {
        console.error('Reservation Service Proxy Error:', err);
        res.status(500).json({ error: 'Proxy Error', details: err.message });
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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
      onError: (err, req, res) => {
        console.error('Default Proxy Error:', err);
        res.status(500).json({ error: 'Proxy Error', details: err.message });
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  );
};
