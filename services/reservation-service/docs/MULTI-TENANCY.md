# Multi-Tenancy Implementation for Reservation Service

## Overview

This document outlines how to implement the enhanced multi-tenancy features in the reservation service. These enhancements support Tailtown's evolution into a scalable SaaS platform with tenant isolation, configuration management, and resource tracking.

## Implementation Steps

### 1. Replace Existing Tenant Middleware

Update `src/app.ts` to use the enhanced tenant middleware:

```typescript
// Before
import { tenantMiddleware } from './middleware/tenantMiddleware';
app.use(tenantMiddleware);

// After
import { applyTenantMiddleware } from './middleware/enhancedTenantMiddleware';
applyTenantMiddleware(app);
```

### 2. Update Controllers to Use Tenant Configuration

Enhance controllers to leverage tenant-specific configuration:

```typescript
// Before
const createReservation = async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  // Implementation...
};

// After
const createReservation = async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  const tenantConfig = req.tenantConfig;
  
  // Check if tenant has access to advanced features
  const allowsCustomFields = tenantConfig?.featureFlags.advancedReporting || false;
  
  // Implementation with tenant-specific behavior...
};
```

### 3. Implement Tenant-Specific Feature Flags

Control access to premium features based on tenant subscription tier:

```typescript
// Example: Bulk reservation creation
if (!req.tenantConfig?.featureFlags.bulkOperations) {
  return res.status(403).json({
    error: 'Bulk reservation creation is not available in your current subscription tier',
    upgrade: true,
    currentTier: req.tenantTier
  });
}

// Proceed with bulk operation
```

### 4. Apply Resource Quotas

Enforce tenant-specific resource limits:

```typescript
// Check reservation quota before creating a new reservation
const currentReservationCount = await prisma.reservation.count({
  where: {
    organizationId: req.tenantId,
    startDate: {
      gte: startOfMonth(new Date())
    }
  }
});

if (req.tenantConfig?.quotas.monthlyReservations && 
    currentReservationCount >= req.tenantConfig.quotas.monthlyReservations) {
  return res.status(403).json({
    error: 'Monthly reservation limit reached for your subscription tier',
    limit: req.tenantConfig.quotas.monthlyReservations,
    current: currentReservationCount,
    upgrade: true
  });
}
```

## Testing the Enhanced Multi-Tenancy

### 1. Test Tenant Validation

```bash
# Valid tenant request
curl -X GET http://localhost:3000/api/v1/reservations \
  -H "x-tenant-id: valid-tenant-id"

# Invalid tenant request
curl -X GET http://localhost:3000/api/v1/reservations \
  -H "x-tenant-id: invalid-tenant-id"
```

### 2. Test Feature Flags

```bash
# Standard tier tenant (no bulk operations)
curl -X POST http://localhost:3000/api/v1/reservations/bulk \
  -H "x-tenant-id: standard-tenant-id" \
  -H "Content-Type: application/json" \
  -d '{"reservations": [...]}'

# Premium tier tenant (with bulk operations)
curl -X POST http://localhost:3000/api/v1/reservations/bulk \
  -H "x-tenant-id: premium-tenant-id" \
  -H "Content-Type: application/json" \
  -d '{"reservations": [...]}'
```

## Monitoring Tenant Resource Usage

The enhanced tenant middleware automatically tracks resource usage. You can view this data using:

```sql
-- Get usage by tenant
SELECT 
  tenant_id, 
  COUNT(*) as request_count, 
  AVG(duration) as avg_duration_ms
FROM tenant_usage
GROUP BY tenant_id
ORDER BY request_count DESC;

-- Get usage by endpoint
SELECT 
  endpoint, 
  method,
  COUNT(*) as request_count, 
  AVG(duration) as avg_duration_ms
FROM tenant_usage
WHERE tenant_id = 'specific-tenant-id'
GROUP BY endpoint, method
ORDER BY request_count DESC;
```

## Environment Variables

The tenant middleware requires the following environment variables:

```
# Database connection for tenant validation and usage tracking
DATABASE_URL=postgresql://username:password@localhost:5432/tenant_db

# Optional: Tenant cache TTL in milliseconds (default: 300000 - 5 minutes)
TENANT_CACHE_TTL=300000

# Optional: Disable tenant validation in development (not recommended for production)
DISABLE_TENANT_VALIDATION=false
```

## Troubleshooting

### Common Issues

1. **Tenant Validation Fails**
   - Check that the tenant exists in the database
   - Verify the tenant is active
   - Ensure DATABASE_URL is correctly configured

2. **Missing Tenant Configuration**
   - Check that the tenant has settings in the database
   - Verify the tenant middleware is correctly applied to the route

3. **Quota Enforcement Issues**
   - Check that the tenant has quota settings
   - Verify the usage tracking is working correctly

## Migration Path

For a smooth transition to the enhanced multi-tenancy system:

1. Deploy the shared tenant middleware and service
2. Update one service at a time to use the enhanced middleware
3. Monitor for any issues during the transition
4. Once all services are updated, enable quota enforcement

## Schema Alignment Considerations

The enhanced tenant middleware complements our existing schema alignment strategy by:

1. Providing graceful fallbacks if tenant configuration is unavailable
2. Using defensive programming to handle missing tables or columns
3. Maintaining API stability even when tenant features evolve

This ensures that our API remains stable while we enhance our multi-tenancy capabilities.
