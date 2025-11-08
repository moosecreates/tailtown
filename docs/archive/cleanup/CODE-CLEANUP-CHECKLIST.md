# Code Cleanup Checklist

## 🧹 Immediate Cleanup Tasks

### 1. Remove Debug Console Logs
**Priority**: Medium  
**Effort**: 15 minutes

- [ ] `/frontend/src/components/layouts/MainLayout.tsx` (line 104)
  ```typescript
  // REMOVE: console.log('Loaded announcements:', data.length, data);
  ```

### 2. Add JSDoc Comments to Modified Functions
**Priority**: Low  
**Effort**: 30 minutes

#### Products Controller
- [ ] Add JSDoc to `getAllProducts` explaining tenant context usage
- [ ] Add JSDoc to `createProduct` with parameter descriptions
- [ ] Add JSDoc to `updateProduct` with parameter descriptions
- [ ] Document the `TenantRequest` type usage

Example:
```typescript
/**
 * Get all products for the current tenant
 * @param req - TenantRequest with tenant context from middleware
 * @param res - Express response
 * @returns List of products filtered by tenant
 */
export const getAllProducts = async (req: TenantRequest, res: Response) => {
  // ...
}
```

#### Auth Context
- [ ] Add JSDoc to `login` function explaining profile photo handling
- [ ] Document the dynamic API URL logic

### 3. Audit Controllers for Tenant Context
**Priority**: High  
**Effort**: 1-2 hours

Check all controllers for proper tenant context usage:

- [ ] `/services/customer/src/controllers/announcement.controller.ts`
  - Lines 23, 214: Using `'default-user'` fallback
  - Consider implementing proper user sessions

- [ ] `/services/customer/src/controllers/customer.controller.ts`
  - Verify uses `TenantRequest` type
  - Check for `req.headers['x-tenant-id']` pattern

- [ ] `/services/customer/src/controllers/reservation.controller.ts`
  - Verify uses `TenantRequest` type
  - Check for `req.headers['x-tenant-id']` pattern

- [ ] `/services/customer/src/controllers/pet.controller.ts`
  - Verify uses `TenantRequest` type
  - Check for `req.headers['x-tenant-id']` pattern

- [ ] `/services/customer/src/controllers/staff.controller.ts`
  - Verify uses `TenantRequest` type
  - Check for `req.headers['x-tenant-id']` pattern

- [ ] `/services/customer/src/controllers/invoice.controller.ts`
  - Already fixed (uses `TenantRequest`)
  - ✅ No action needed

### 4. Unused Imports Cleanup
**Priority**: Low  
**Effort**: 10 minutes

- [ ] `/frontend/src/components/layouts/MainLayout.tsx`
  - Lines 29, 30, 34, 35, 42, 43: Unused icon imports
  ```typescript
  // REMOVE these unused imports:
  // EventNoteIcon, CalendarIcon, ServicesIcon, ResourcesIcon, ScheduleIcon, OrdersIcon
  ```

### 5. Add Error Handling
**Priority**: Medium  
**Effort**: 30 minutes

- [ ] `/frontend/src/contexts/AuthContext.tsx`
  - Add try-catch around profile photo URL construction
  - Handle cases where profilePhoto is malformed

- [ ] `/frontend/src/components/layouts/MainLayout.tsx`
  - Add error boundary for announcement loading failures
  - Handle network errors gracefully

## 📚 Documentation Tasks

### 1. Update API Documentation
**Priority**: Medium  
**Effort**: 1 hour

- [ ] Document `/api/products` endpoint
  - Query parameters
  - Response format
  - Tenant context requirements
  
- [ ] Document `/api/products/categories` endpoint
  - Response format
  - Tenant filtering

- [ ] Document `/api/announcements` endpoint
  - User context handling
  - Dismissal logic

### 2. Create Developer Guide
**Priority**: Low  
**Effort**: 2 hours

- [ ] Document tenant middleware usage
  - How to use `TenantRequest` type
  - When to use `requireTenant` middleware
  - Examples of proper tenant context

- [ ] Document authentication flow
  - Login process
  - Session management
  - Profile photo handling

- [ ] Document deployment process
  - Frontend build and deploy
  - Backend build and deploy
  - Database migrations

### 3. Update README Files
**Priority**: Low  
**Effort**: 30 minutes

- [ ] Update main README with:
  - Recent bug fixes
  - New features (POS products)
  - Known limitations

- [ ] Update services/customer/README with:
  - Tenant middleware documentation
  - Controller patterns
  - Testing guidelines

## 🔒 Security Tasks

### 1. Review Authentication
**Priority**: High  
**Effort**: 2-3 hours

- [ ] Audit `'default-user'` usage
  - Replace with proper session management
  - Implement JWT or session-based auth

- [ ] Review profile photo upload security
  - Validate file types
  - Limit file sizes
  - Sanitize file names

### 2. Environment Variables
**Priority**: Medium  
**Effort**: 30 minutes

- [ ] Audit all hardcoded values
  - API URLs
  - Default tenant IDs
  - Port numbers

- [ ] Document required environment variables
  - Create `.env.example` files
  - Add validation for required vars

## 🧪 Testing Tasks

### 1. Add Unit Tests
**Priority**: Medium  
**Effort**: 3-4 hours

- [ ] Test tenant middleware
  - Subdomain extraction
  - Tenant lookup
  - Error cases

- [ ] Test products controller
  - CRUD operations
  - Tenant isolation
  - Error handling

- [ ] Test authentication
  - Login flow
  - Profile photo handling
  - Session management

### 2. Add Integration Tests
**Priority**: Low  
**Effort**: 4-6 hours

- [ ] Test multi-tenant scenarios
  - Product isolation between tenants
  - Announcement isolation
  - User isolation

- [ ] Test deployment process
  - Build scripts
  - Migration scripts
  - Rollback procedures

## 📊 Performance Tasks

### 1. Optimize Database Queries
**Priority**: Low  
**Effort**: 1-2 hours

- [ ] Add indexes for tenant queries
  - `products.tenantId`
  - `announcements.tenantId`
  - `staff.tenantId`

- [ ] Review N+1 query issues
  - Products with categories
  - Announcements with dismissals

### 2. Frontend Optimization
**Priority**: Low  
**Effort**: 1 hour

- [ ] Lazy load announcement components
- [ ] Memoize expensive computations
- [ ] Optimize re-renders in MainLayout

## 🎨 Code Style Tasks

### 1. Consistent Naming
**Priority**: Low  
**Effort**: 30 minutes

- [ ] Review variable naming conventions
  - `tenantId` vs `tenant_id`
  - `profilePhoto` vs `profile_photo`

- [ ] Ensure consistent error messages
  - Standardize error response format
  - Use consistent status codes

### 2. TypeScript Strict Mode
**Priority**: Low  
**Effort**: 2-3 hours

- [ ] Enable strict mode in tsconfig
- [ ] Fix any type errors
- [ ] Remove `any` types where possible

## 📝 Summary

### High Priority (Do First)
1. ✅ Audit controllers for tenant context (CRITICAL)
2. ✅ Review authentication security
3. ⏳ Add error handling

### Medium Priority (Do Soon)
1. ⏳ Remove debug console logs
2. ⏳ Update API documentation
3. ⏳ Add unit tests

### Low Priority (Do Eventually)
1. ⏳ Add JSDoc comments
2. ⏳ Clean up unused imports
3. ⏳ Optimize performance
4. ⏳ Create developer guide

---

**Estimated Total Effort**: 20-30 hours  
**Recommended Timeline**: 1-2 weeks  
**Can be done incrementally**: Yes
