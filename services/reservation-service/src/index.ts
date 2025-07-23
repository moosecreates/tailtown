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

// Apply enhanced tenant middleware
app.use(reservationTenantMiddleware);

// Register routes
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/resources', resourceRoutes);

// Register error handlers (must be last)
app.registerErrorHandlers();

// Define the port for the service
const PORT = parseInt(process.env.PORT || '4004', 10); // Use environment variable or default to 4004

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
        url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3003/health',
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
