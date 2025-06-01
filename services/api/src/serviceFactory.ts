import express, { Express, RequestHandler } from 'express';
import { errorHandlerMiddleware } from './middleware/errorHandlerMiddleware';

export interface ServiceOptions {
  // Name of the service for logging and identification
  name: string;
  
  // Version of the service API (will be used in routes)
  version?: string;
  
  // Whether to enable CORS
  enableCors?: boolean;
  
  // Whether to add JSON body parser middleware
  enableJsonBody?: boolean;
  
  // Whether to add URL-encoded body parser middleware
  enableUrlEncodedBody?: boolean;
  
  // Global middleware to apply to all routes
  globalMiddleware?: RequestHandler[];
  
  // Optional configuration for development mode
  development?: {
    // Whether to enable detailed error logging
    verboseErrors?: boolean;
  }
}

/**
 * Default service options
 */
const defaultOptions: Partial<ServiceOptions> = {
  version: 'v1',
  enableCors: true,
  enableJsonBody: true,
  enableUrlEncodedBody: true,
  globalMiddleware: [],
  development: {
    verboseErrors: process.env.NODE_ENV !== 'production'
  }
};

/**
 * Creates a new API service with standardized configuration and middleware
 * 
 * @param options - Configuration options for the service
 * @returns Configured Express application
 */
export function createService(options: ServiceOptions): Express {
  const mergedOptions: ServiceOptions = {
    ...defaultOptions,
    ...options,
    development: {
      ...defaultOptions.development,
      ...options.development
    }
  };
  
  const app = express();
  
  // Standard middleware
  if (mergedOptions.enableCors) {
    app.use(require('cors')());
  }
  
  if (mergedOptions.enableJsonBody) {
    app.use(express.json({ limit: '1mb' }));
  }
  
  if (mergedOptions.enableUrlEncodedBody) {
    app.use(express.urlencoded({ extended: true }));
  }
  
  // Add request ID middleware for tracking requests
  app.use((req, res, next) => {
    req.id = crypto.randomUUID();
    next();
  });
  
  // Add basic request logging
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `[${mergedOptions.name}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
      );
    });
    
    next();
  });
  
  // Apply any global middleware
  if (mergedOptions.globalMiddleware?.length) {
    app.use(...mergedOptions.globalMiddleware);
  }
  
  // Service information endpoint
  app.get('/health', (req, res) => {
    res.json({
      service: mergedOptions.name,
      version: mergedOptions.version,
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });
  
  // Apply global error handler as the last middleware in the chain
  // This should be registered after all routes are defined
  const registerErrorHandlers = () => {
    app.use(errorHandlerMiddleware());
    
    // 404 handler for undefined routes
    app.use((req, res) => {
      res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: `Cannot ${req.method} ${req.path}`
        }
      });
    });
  };
  
  return Object.assign(app, {
    registerErrorHandlers
  });
}
