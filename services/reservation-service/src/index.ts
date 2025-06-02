import { createService, tenantMiddleware } from './utils/service';
import reservationRoutes from './routes/reservation.routes';
import resourceRoutes from './routes/resourceRoutes';

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

// Start the service
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Reservation service running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

export default app;
