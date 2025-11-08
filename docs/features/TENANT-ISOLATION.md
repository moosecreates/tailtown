# Tenant Isolation & Multi-Tenancy

## Overview

The Tailtown platform implements tenant isolation to ensure that each tenant can only access their own data. This is achieved through middleware that automatically extracts tenant context from the request and filters all database queries.

---

## How It Works

### 1. Subdomain Extraction

The system identifies tenants by subdomain:

**Production**:
```
https://pawsinn.tailtown.com  → tenant: pawsinn
https://happytails.tailtown.com → tenant: happytails
```

**Development**:
```
http://localhost:3000?subdomain=pawsinn → tenant: pawsinn
http://localhost:3000 (header: X-Tenant-Subdomain: pawsinn) → tenant: pawsinn
http://localhost:3000 → tenant: dev (default)
```

### 2. Tenant Context Middleware

The `extractTenantContext` middleware:
1. Extracts subdomain from hostname, header, or query parameter
2. Looks up tenant in database
3. Verifies tenant is active
4. Attaches tenant info to request object

### 3. Automatic Filtering

All API routes (except `/api/tenants`) require tenant context and automatically filter data by `tenantId`.

---

## Implementation

### Middleware Functions

#### `extractTenantContext`
Extracts tenant from request and attaches to `req.tenant` and `req.tenantId`.

```typescript
app.use('/api', extractTenantContext);
```

#### `requireTenant`
Ensures tenant context exists before proceeding.

```typescript
app.use('/api/customers', requireTenant, customerRoutes);
```

#### `withTenantId`
Helper function to add tenantId to Prisma queries.

```typescript
const customers = await prisma.customer.findMany({
  where: withTenantId(req, { isActive: true })
});
```

---

## Usage in Controllers

### Before (No Isolation):
```typescript
// ❌ Returns ALL customers from ALL tenants
const customers = await prisma.customer.findMany();
```

### After (With Isolation):
```typescript
// ✅ Returns only customers for current tenant
const customers = await prisma.customer.findMany({
  where: { tenantId: req.tenantId }
});

// Or using helper:
const customers = await prisma.customer.findMany({
  where: withTenantId(req, { isActive: true })
});
```

---

## Development Testing

### Method 1: Query Parameter
```bash
curl "http://localhost:4004/api/customers?subdomain=pawsinn"
```

### Method 2: Header
```bash
curl -H "X-Tenant-Subdomain: pawsinn" \
  http://localhost:4004/api/customers
```

### Method 3: Default (dev tenant)
```bash
curl http://localhost:4004/api/customers
# Uses 'dev' tenant by default
```

---

## Frontend Integration

### Main Tenant App (Port 3000)

The tenant app should set the subdomain based on the URL:

```typescript
// In production: Extract from window.location.hostname
const subdomain = window.location.hostname.split('.')[0];

// In development: Use environment variable or default
const subdomain = process.env.REACT_APP_TENANT_SUBDOMAIN || 'dev';

// Add to all API requests
axios.defaults.headers.common['X-Tenant-Subdomain'] = subdomain;
```

### Admin Portal (Port 3001)

The admin portal bypasses tenant context since it manages all tenants:
- Uses `/api/tenants` endpoints (no tenant context)
- Authenticated with super admin API key
- Can view/manage any tenant

---

## Routes & Tenant Context

### Requires Tenant Context:
- `/api/customers` - Customer management
- `/api/pets` - Pet management
- `/api/reservations` - Reservations
- `/api/services` - Services
- `/api/resources` - Resources
- `/api/staff` - Staff
- `/api/invoices` - Invoices
- `/api/payments` - Payments
- `/api/analytics` - Analytics

### No Tenant Context (Super Admin):
- `/api/tenants` - Tenant management
- `/health` - Health check

---

## Security

### Tenant Verification

The middleware verifies:
1. ✅ Tenant exists in database
2. ✅ Tenant is active (`isActive = true`)
3. ✅ Tenant is not paused (`isPaused = false`)

### Error Responses

**Tenant Not Found** (404):
```json
{
  "success": false,
  "error": "Tenant not found",
  "message": "No tenant found for subdomain: pawsinn"
}
```

**Tenant Inactive** (403):
```json
{
  "success": false,
  "error": "Tenant inactive",
  "message": "This tenant account is currently inactive or paused"
}
```

**Tenant Required** (400):
```json
{
  "success": false,
  "error": "Tenant required",
  "message": "This endpoint requires tenant context"
}
```

---

## Data Isolation Testing

### Test Scenario

1. **Create Two Tenants**:
   ```bash
   # Tenant 1: pawsinn
   curl -X POST http://localhost:4004/api/tenants \
     -H "X-API-Key: dev-super-admin-key-12345" \
     -H "Content-Type: application/json" \
     -d '{"subdomain": "pawsinn", ...}'
   
   # Tenant 2: happytails
   curl -X POST http://localhost:4004/api/tenants \
     -H "X-API-Key: dev-super-admin-key-12345" \
     -H "Content-Type: application/json" \
     -d '{"subdomain": "happytails", ...}'
   ```

2. **Add Customers to Each**:
   ```bash
   # Add customer to pawsinn
   curl -X POST http://localhost:4004/api/customers \
     -H "X-Tenant-Subdomain: pawsinn" \
     -H "Content-Type: application/json" \
     -d '{"firstName": "John", "lastName": "Doe", ...}'
   
   # Add customer to happytails
   curl -X POST http://localhost:4004/api/customers \
     -H "X-Tenant-Subdomain: happytails" \
     -H "Content-Type: application/json" \
     -d '{"firstName": "Jane", "lastName": "Smith", ...}'
   ```

3. **Verify Isolation**:
   ```bash
   # Get pawsinn customers (should only see John)
   curl -H "X-Tenant-Subdomain: pawsinn" \
     http://localhost:4004/api/customers
   
   # Get happytails customers (should only see Jane)
   curl -H "X-Tenant-Subdomain: happytails" \
     http://localhost:4004/api/customers
   ```

4. **Expected Results**:
   - ✅ Each tenant sees only their own customers
   - ✅ No cross-tenant data leakage
   - ✅ Queries automatically filtered by tenantId

---

## Production Deployment

### DNS Configuration

Set up wildcard DNS:
```
*.tailtown.com → Your server IP
```

### SSL Certificate

Get wildcard SSL certificate:
```bash
certbot certonly --dns-cloudflare \
  -d tailtown.com \
  -d *.tailtown.com
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name *.tailtown.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:4004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Troubleshooting

### Issue: "Tenant not found"

**Cause**: Subdomain doesn't exist in database

**Solution**:
1. Check subdomain spelling
2. Verify tenant exists: `SELECT * FROM tenants WHERE subdomain = 'xxx'`
3. Create tenant if missing

### Issue: "Tenant inactive"

**Cause**: Tenant is paused or inactive

**Solution**:
1. Check tenant status in admin portal
2. Reactivate tenant if needed
3. Verify `isActive = true` and `isPaused = false`

### Issue: Getting data from wrong tenant

**Cause**: Tenant context not being applied

**Solution**:
1. Verify middleware is applied to route
2. Check `req.tenantId` is set
3. Ensure queries use `withTenantId` helper
4. Review controller implementation

---

## Best Practices

### 1. Always Use Tenant Context
```typescript
// ✅ Good
const customers = await prisma.customer.findMany({
  where: { tenantId: req.tenantId }
});

// ❌ Bad
const customers = await prisma.customer.findMany();
```

### 2. Use Helper Functions
```typescript
// ✅ Good
const customers = await prisma.customer.findMany({
  where: withTenantId(req, { isActive: true })
});

// ❌ Bad (easy to forget tenantId)
const customers = await prisma.customer.findMany({
  where: { isActive: true }
});
```

### 3. Test Isolation
- Always test with multiple tenants
- Verify no cross-tenant data access
- Check all CRUD operations
- Test edge cases (deleted tenants, paused tenants)

### 4. Log Tenant Context
```typescript
console.log(`[${req.tenant?.subdomain}] Processing request`);
```

---

## Migration Guide

### Updating Existing Controllers

1. **Import TenantRequest type**:
   ```typescript
   import { TenantRequest } from '../middleware/tenant.middleware';
   ```

2. **Update function signatures**:
   ```typescript
   // Before
   export const getCustomers = async (req: Request, res: Response) => {
   
   // After
   export const getCustomers = async (req: TenantRequest, res: Response) => {
   ```

3. **Add tenantId to queries**:
   ```typescript
   // Before
   const customers = await prisma.customer.findMany();
   
   // After
   const customers = await prisma.customer.findMany({
     where: { tenantId: req.tenantId }
   });
   ```

4. **Test thoroughly**:
   - Create test tenants
   - Verify data isolation
   - Check all endpoints

---

**Status**: ✅ Implemented  
**Last Updated**: October 23, 2025  
**Version**: 1.0
