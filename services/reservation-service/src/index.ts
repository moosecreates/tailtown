import { createService } from './utils/service';
import { reservationTenantMiddleware } from './middleware/enhancedTenantMiddleware';
import reservationRoutes from './routes/reservation.routes';
import resourceRoutes from './routes/resourceRoutes';
import { PrismaClient } from '@prisma/client';
import * as http from 'http';
import { logger } from './utils/logger';
import { 
  performRobustStartup, 
  setupGracefulShutdown 
} from './utils/startupUtils';

// Initialize Prisma client
const prisma = new PrismaClient();

// Create and configure the reservation service
const app = createService({
  name: 'reservation-service',
  version: 'v1'
});

// Import the development tenant utility middleware
import { devTenantMiddleware } from './utils/devTenantUtil';

// Always apply the development tenant middleware first
// This will add the tenant ID in development mode
app.use(devTenantMiddleware);

// Skip the original tenant middleware in development mode
if (process.env.NODE_ENV !== 'development') {
  app.use(reservationTenantMiddleware);
  logger.info('Tenant middleware enabled - tenant isolation enforced');
} else {
  logger.warn('⚠️ DEVELOPMENT MODE: Running without tenant isolation');
}

// Register routes with standardized API paths
app.use('/api/reservations', reservationRoutes);
app.use('/api/resources', resourceRoutes);

// Note: v1 routes removed for consistency
// All frontend calls now use '/api/reservations' without v1 prefix

// Register error handlers (must be last)
app.registerErrorHandlers();

// Define the port for the service
const PORT = parseInt(process.env.PORT || '4003', 10); // Use environment variable or default to 4003

// Create HTTP server
const server = http.createServer(app);

// Setup graceful shutdown handlers
setupGracefulShutdown(server, prisma);

// Start the service with robust startup process
(async () => {
  try {
    // Define dependency services to check
    const dependencies = [
      {
        name: 'Customer Service',
        url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:4004/health',
        required: false,
        timeout: 3000
      }
    ];

    // Perform robust startup with all checks
    const startupResult = await performRobustStartup(prisma, {
      requiredEnvVars: ['DATABASE_URL'],
      port: PORT,
      autoMigrate: process.env.AUTO_MIGRATE === 'true',
      dependencies,
      exitOnFailure: process.env.EXIT_ON_STARTUP_FAILURE === 'true'
    });

    // Start the server if startup was successful or we're continuing despite issues
    server.listen(PORT, () => {
      logger.info(`Reservation service running on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
      
      if (!startupResult.success) {
        logger.warn('Service started with issues - some functionality may be limited');
        
        if (startupResult.recommendations.length > 0) {
          logger.info('Recommendations to resolve startup issues:');
          startupResult.recommendations.forEach((rec, i) => {
            logger.info(`  ${i + 1}. ${rec}`);
          });
        }
      }
    });
  } catch (error) {
    logger.error(`Fatal error during startup: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
})();

export default app;
