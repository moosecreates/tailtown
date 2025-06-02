import { createService, tenantMiddleware } from './utils/service';
import reservationRoutes from './routes/reservation.routes';
import resourceRoutes from './routes/resourceRoutes';
import { PrismaClient } from '@prisma/client';
import { validateSchema } from './utils/schemaUtils';

// Create and configure the reservation service
const app = createService({
  name: 'reservation-service',
  version: 'v1'
});

// Apply tenant middleware to ensure all requests include tenant ID
app.use(tenantMiddleware({
  required: true,
  // In production, this would validate against a tenant service
  validateTenant: async (tenantId) => true
}));

// Register routes
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/resources', resourceRoutes);

// Register error handlers (must be last)
app.registerErrorHandlers();

// Initialize Prisma client
const prisma = new PrismaClient();

// Start the service
const PORT = process.env.PORT || 4567; // Updated to use port 4567 to avoid conflicts
app.listen(PORT, async () => {
  console.log(`Reservation service running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  
  // Validate schema on startup
  try {
    console.log('Validating database schema...');
    const validationResults = await validateSchema(prisma);
    console.log('Schema validation complete');
  } catch (error) {
    console.error('Schema validation failed:', error);
    console.warn('Service may encounter errors due to schema mismatches');
  }
});

export default app;
