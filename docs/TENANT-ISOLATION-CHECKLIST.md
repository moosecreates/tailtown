# Tenant Isolation Checklist

**Purpose**: Ensure all new features maintain proper tenant data isolation  
**When to Use**: Before merging any PR that touches database queries, API endpoints, or caching

---

## 🔴 CRITICAL - Database Queries

### All Queries Must Include `tenantId`
- [ ] All `findMany` queries include `tenantId` in WHERE clause
- [ ] All `findFirst` queries include `tenantId` in WHERE clause
- [ ] All `findUnique` queries validate tenant ownership after fetch
- [ ] All `update` operations validate tenant ownership before update
- [ ] All `delete` operations validate tenant ownership before delete
- [ ] All aggregations (`count`, `sum`, etc.) filter by `tenantId`

### Query Patterns
```typescript
// ✅ SECURE
const customers = await prisma.customer.findMany({
  where: {
    tenantId: req.tenantId,  // REQUIRED!
    // ... other filters
  }
});

// ✅ SECURE - Validate after findUnique
const customer = await prisma.customer.findUnique({
  where: { id }
});
if (!customer || customer.tenantId !== req.tenantId) {
  return next(new AppError('Not found', 404));
}

// ❌ INSECURE - Missing tenantId
const customers = await prisma.customer.findMany({
  where: { isActive: true }  // Missing tenantId!
});
```

---

## 🔴 CRITICAL - API Endpoints

### Middleware
- [ ] All routes use tenant middleware to extract `tenantId`
- [ ] `req.tenantId` is populated before controller execution
- [ ] Tenant validation happens before any database queries

### Controller Validation
- [ ] GET endpoints filter by `tenantId`
- [ ] POST endpoints set `tenantId` from `req.tenantId`
- [ ] PUT endpoints validate tenant ownership
- [ ] DELETE endpoints validate tenant ownership
- [ ] List endpoints return only tenant's data

### Response Data
- [ ] Responses include `tenantId` for test validation
- [ ] No sensitive data from other tenants in responses
- [ ] Error messages don't leak cross-tenant information

---

## 🔴 CRITICAL - Redis Caching

### Cache Keys
- [ ] All cache keys include `tenantId`
- [ ] Using `getCacheKey(tenantId, type, id)` helper
- [ ] Cache keys follow pattern: `{tenantId}:{type}:{id}`
- [ ] Global caches use `global:` prefix (tenant lookups only)

### Cache Invalidation
- [ ] Cache invalidation is tenant-scoped
- [ ] Using `deleteCache(getCacheKey(tenantId, ...))` for single items
- [ ] Using `deleteCachePattern(\`${tenantId}:type:*\`)` for lists
- [ ] Never using global patterns like `type:*`

### Cache Patterns
```typescript
// ✅ SECURE - Tenant-scoped cache
const cacheKey = getCacheKey(tenantId, 'customer', customerId);
const cached = await getCache(cacheKey);

// ✅ SECURE - Tenant-scoped invalidation
await deleteCachePattern(`${tenantId}:customers:*`);

// ❌ INSECURE - No tenant in key
const cacheKey = `customer:${customerId}`;

// ❌ INSECURE - Global invalidation
await deleteCachePattern(`customers:*`);
```

---

## 🟡 HIGH PRIORITY - Database Indexes

### Index Optimization
- [ ] Indexes include `tenantId` as first column
- [ ] Composite indexes: `[tenantId, otherColumn]`
- [ ] Partial indexes filter by `tenantId` when appropriate

### Index Patterns
```prisma
// ✅ GOOD - tenantId first
@@index([tenantId, customerId])
@@index([tenantId, createdAt])

// ⚠️ SUBOPTIMAL - tenantId not first
@@index([customerId, tenantId])
```

---

## 🟡 HIGH PRIORITY - Testing

### Unit Tests
- [ ] Tests create separate tenants for isolation
- [ ] Tests verify cross-tenant access returns 404
- [ ] Tests verify own-tenant access succeeds
- [ ] Tests clean up test data in `afterAll`

### Integration Tests
- [ ] Tenant isolation tests added for new endpoints
- [ ] Tests use `x-tenant-subdomain` header
- [ ] Tests verify `tenantId` in responses
- [ ] Tests run in CI/CD pipeline

### Test Patterns
```typescript
// ✅ GOOD - Test cross-tenant blocking
test('Tenant A cannot access Tenant B data', async () => {
  const response = await request(app)
    .get(`/api/customers/${tenantBCustomerId}`)
    .set('x-tenant-subdomain', 'tenant-a');
  
  expect(response.status).toBe(404);  // Should be blocked!
});
```

---

## 🟢 MEDIUM PRIORITY - Code Quality

### Naming Conventions
- [ ] Variables named `tenantId` (not `tenant_id` or `tenant`)
- [ ] Consistent use of `req.tenantId`
- [ ] Clear error messages for tenant validation failures

### Error Handling
- [ ] 404 for cross-tenant access attempts
- [ ] 401 for missing tenant context
- [ ] Proper logging with tenant context

### Documentation
- [ ] API docs mention tenant isolation
- [ ] README updated if new patterns introduced
- [ ] Comments explain tenant validation logic

---

## 🟢 MEDIUM PRIORITY - Security

### Input Validation
- [ ] Never trust `tenantId` from request body
- [ ] Always use `req.tenantId` from middleware
- [ ] Validate UUIDs are properly formatted

### Logging
- [ ] Include `tenantId` in all log statements
- [ ] No PII in logs (GDPR/HIPAA compliance)
- [ ] Log tenant validation failures

### Audit Trail
- [ ] Track who accessed what data
- [ ] Log cross-tenant access attempts
- [ ] Monitor for suspicious patterns

---

## Common Mistakes to Avoid

### ❌ Using findUnique without validation
```typescript
// WRONG
const customer = await prisma.customer.findUnique({
  where: { id }
});
return customer;  // Might belong to different tenant!
```

### ❌ Missing tenantId in WHERE
```typescript
// WRONG
const customers = await prisma.customer.findMany({
  where: { isActive: true }  // Missing tenantId!
});
```

### ❌ Global cache keys
```typescript
// WRONG
const cacheKey = `customer:${customerId}`;  // No tenantId!
```

### ❌ Global cache invalidation
```typescript
// WRONG
await deleteCachePattern(`customers:*`);  // Affects all tenants!
```

### ❌ Trusting request body tenantId
```typescript
// WRONG
const tenantId = req.body.tenantId;  // Can be manipulated!

// RIGHT
const tenantId = req.tenantId;  // From middleware
```

---

## Pre-Merge Checklist

Before requesting code review:

- [ ] All database queries include `tenantId` filter
- [ ] All cache keys include `tenantId`
- [ ] Tenant isolation tests added
- [ ] Tests pass locally
- [ ] No console.log statements
- [ ] Error handling includes tenant context
- [ ] Documentation updated
- [ ] Self-reviewed for tenant isolation issues

---

## Code Review Checklist

When reviewing PRs:

- [ ] Search for `prisma.` calls - verify `tenantId` in WHERE
- [ ] Search for `getCache` - verify tenant-scoped keys
- [ ] Search for `deleteCache` - verify tenant-scoped invalidation
- [ ] Check test coverage for tenant isolation
- [ ] Verify middleware is applied to new routes
- [ ] Check for hardcoded tenant IDs
- [ ] Verify no cross-tenant data leakage possible

---

## Quick Reference

### Essential Patterns

**Database Query**:
```typescript
where: { id, tenantId: req.tenantId }
```

**Cache Key**:
```typescript
getCacheKey(req.tenantId, 'type', id)
```

**Cache Invalidation**:
```typescript
await deleteCachePattern(`${req.tenantId}:type:*`)
```

**Test**:
```typescript
.set('x-tenant-subdomain', 'tenant-a')
expect(response.status).toBe(404)  // Cross-tenant blocked
```

---

## Resources

- [Tenant Isolation CI/CD Summary](./TENANT-ISOLATION-CI-CD-SUMMARY.md)
- [Tenant Isolation Quick Reference](./TENANT-ISOLATION-QUICK-REFERENCE.md)
- [Redis Caching Implementation](./REDIS-CACHING-IMPLEMENTATION.md)
- [Reservation Service TODO](./TENANT-ISOLATION-RESERVATION-SERVICE-TODO.md)

---

**Last Updated**: November 20, 2025  
**Status**: ✅ Active - Use for all PRs  
**Enforcement**: Required before merge
