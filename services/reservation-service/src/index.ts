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
    const { isValid, missingTables, missingColumns, validationMap } = await validateSchema(prisma);
    
    if (isValid) {
      console.log('✅ Schema validation successful - all critical tables and columns exist');
    } else {
      console.warn('⚠️ Schema validation detected issues:');
      
      if (missingTables.length > 0) {
        console.warn(`  Missing critical tables: ${missingTables.join(', ')}`);
        console.warn('  To fix this, run the database migration script:');
        console.warn('  node prisma/migrations/apply_migrations.js');
      }
      
      if (Object.keys(missingColumns).length > 0) {
        console.warn('  Missing critical columns:');
        for (const [table, columns] of Object.entries(missingColumns)) {
          console.warn(`    ${table}: ${columns.join(', ')}`);
        }
        console.warn('  To fix this, run the database migration script:');
        console.warn('  node prisma/migrations/apply_migrations.js');
      }
      
      console.warn('⚠️ The service will continue to run with defensive programming,');
      console.warn('  but some functionality may be limited until the schema is fixed.');
    }
    
    // Log optional tables status
    const optionalTables = ['Service', 'AddOnService', 'ReservationAddOn'];
    const missingOptionalTables = optionalTables.filter(table => !validationMap.get(table));
    
    if (missingOptionalTables.length > 0) {
      console.info(`ℹ️ Missing optional tables: ${missingOptionalTables.join(', ')}`);
      console.info('  These tables are not critical but may limit some functionality.');
    }
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    console.warn('  Service may encounter errors due to schema mismatches');
    console.warn('  To fix this, check database connection and run migrations');
  }
});

export default app;
