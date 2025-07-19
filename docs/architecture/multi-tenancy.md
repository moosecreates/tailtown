# Multi-Tenancy Architecture for Tailtown SaaS

## Overview

This document outlines the multi-tenancy architecture implemented for Tailtown's SaaS platform. The architecture provides tenant isolation, configuration management, resource tracking, and quota enforcement across all microservices.

## Core Components

### 1. Tenant Middleware

The tenant middleware is a shared component that:

- Validates tenant IDs against the tenant service
- Attaches tenant context to requests
- Enforces tenant-specific rate limits and quotas
- Tracks resource usage for billing and monitoring

```typescript
// Example usage in a service
import { tenantMiddleware } from '@shared/tenant/tenantMiddleware';

// Configure with appropriate options for this service
const serviceTenantMiddleware = tenantMiddleware({
  validateTenant: true,
  enforceQuotas: true,
  trackUsage: true
});

// Apply to routes
app.use('/api/v1/resources', serviceTenantMiddleware);
```

### 2. Tenant Service

The tenant service provides:

- Tenant validation and authentication
- Tenant configuration management with caching
- Resource usage tracking
- Quota enforcement based on subscription tiers

```typescript
// Example usage in a controller
import { TenantService } from '@shared/tenant/tenantService';

const tenantService = new TenantService();

// Get tenant configuration
const config = await tenantService.getTenantConfig(tenantId);

// Check if feature is enabled
if (config.featureFlags.advancedReporting) {
  // Enable advanced reporting features
}
```

### 3. Tenant Configuration

Each tenant has a configuration that includes:

- Feature flags: Control access to premium features
- Quotas: Limit resource usage based on subscription tier
- Preferences: Store tenant-specific settings

```typescript
// Example tenant configuration
{
  "featureFlags": {
    "advancedReporting": true,
    "bulkOperations": true,
    "customBranding": false
  },
  "quotas": {
    "requestsPerMinute": 300,
    "requestsPerDay": 50000,
    "storageGB": 50,
    "maxUsers": 20
  },
  "preferences": {
    "defaultCurrency": "USD",
    "dateFormat": "MM/DD/YYYY",
    "timezone": "UTC"
  }
}
```

## Database Schema

The multi-tenancy system uses two primary database models:

### Organization (Tenant)

```prisma
model Organization {
  id               String   @id @default(uuid())
  name             String
  active           Boolean  @default(true)
  subscriptionTier String   @default("standard")
  settings         Json?    @default("{}")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  // Relationships
  usageRecords     TenantUsage[]
}
```

### Tenant Usage

```prisma
model TenantUsage {
  id         String   @id @default(uuid())
  tenantId   String
  endpoint   String
  method     String
  duration   Int      // in milliseconds
  statusCode Int
  timestamp  DateTime @default(now())
  
  // Relationships
  tenant     Organization @relation(fields: [tenantId], references: [id])
  
  // Indexes for efficient querying
  @@index([tenantId])
  @@index([timestamp])
  @@index([tenantId, timestamp])
}
```

## Integration Guide

### 1. Replace Existing Tenant Middleware

In each service, replace the existing tenant middleware with the enhanced version:

```typescript
// Before
app.use(tenantMiddleware);

// After
import { applyTenantMiddleware } from './middleware/enhancedTenantMiddleware';
applyTenantMiddleware(app);
```

### 2. Update Controllers

Update controllers to use the enhanced tenant context:

```typescript
// Before
const tenantId = req.tenantId;

// After
const tenantId = req.tenantId;
const tenantConfig = req.tenantConfig;
const tenantTier = req.tenantTier;

// Use tenant configuration for feature flags
if (tenantConfig?.featureFlags.advancedReporting) {
  // Enable advanced reporting features
}
```

### 3. Implement Tenant-Aware Database Queries

Ensure all database queries include tenant isolation:

```typescript
// Before
const records = await prisma.reservation.findMany({
  where: { /* query conditions */ }
});

// After
const records = await prisma.reservation.findMany({
  where: {
    organizationId: req.tenantId,
    /* other query conditions */
  }
});
```

### 4. Add Tenant-Specific Feature Checks

Control access to premium features based on tenant subscription:

```typescript
// Check if feature is available for this tenant
if (!req.tenantConfig?.featureFlags.bulkOperations) {
  return res.status(403).json({
    error: 'Bulk operations are not available in your current subscription tier'
  });
}

// Proceed with bulk operation
```

### 5. Apply Resource Limits

Enforce tenant-specific resource limits:

```typescript
// Check user quota before creating a new user
if (req.tenantConfig?.quotas.maxUsers && currentUserCount >= req.tenantConfig.quotas.maxUsers) {
  return res.status(403).json({
    error: 'User limit reached for your subscription tier',
    limit: req.tenantConfig.quotas.maxUsers,
    current: currentUserCount
  });
}
```

## Subscription Tiers

The system supports three subscription tiers with different capabilities:

### Standard Tier

- Basic features
- Limited API access
- 100 requests per minute
- 10,000 requests per day
- 10GB storage
- 5 users maximum

### Professional Tier

- Advanced reporting
- Bulk operations
- Custom branding
- 300 requests per minute
- 50,000 requests per day
- 50GB storage
- 20 users maximum

### Premium Tier

- All features
- Webhooks
- 600 requests per minute
- 100,000 requests per day
- 100GB storage
- 50 users maximum

## Monitoring and Billing

The tenant middleware automatically tracks resource usage for monitoring and billing purposes:

- API requests by endpoint
- Request duration
- Response status codes
- Timestamp information

This data can be used to:

- Generate usage-based billing
- Monitor tenant activity
- Identify performance issues
- Enforce fair usage policies

## Security Considerations

- Tenant IDs are validated on every request
- Inactive tenants are denied access
- Resource limits prevent abuse
- Tenant data is isolated at the API and database levels

## Future Enhancements

- Tenant-specific caching
- Tenant-aware background job processing
- Multi-region tenant deployment
- Tenant data export and portability
- Enhanced analytics and reporting
