# Super Admin Portal - Implementation Roadmap

**Date:** November 1, 2025  
**Status:** Planning Phase  
**Priority:** High - Security & Multi-Tenancy Foundation

---

## 🎯 Overview

The Super Admin Portal is a secure, elevated-privilege interface for managing the Tailtown multi-tenant platform. It provides system administrators with the ability to manage tenant accounts, monitor system health, and access tenant contexts for support purposes.

### Key Objectives

1. **Security First**: Implement robust authentication and authorization
2. **Tenant Management**: Full CRUD operations for tenant accounts
3. **Context Switching**: Secure impersonation for customer support
4. **Audit Trail**: Complete logging of all super admin actions
5. **Account Lifecycle**: Enable/disable/delete tenant accounts

---

## 📋 Current State Analysis

### What Exists Today

**Frontend:**
- ✅ Admin routes exist (`/admin/*`)
- ✅ Tenant management UI components (TenantList, TenantDetail, etc.)
- ✅ Basic tenant CRUD operations
- ❌ No authentication/authorization
- ❌ No role-based access control
- ❌ No tenant switching capability

**Backend:**
- ✅ Tenant table in database
- ✅ Basic tenant API endpoints
- ✅ Staff authentication system
- ❌ No super admin role/table
- ❌ No audit logging
- ❌ No impersonation system

### Security Gaps

1. **No Authentication**: Admin portal accessible to anyone
2. **No Authorization**: No role checking for admin operations
3. **No Audit Trail**: No logging of who did what
4. **No Session Management**: No tracking of super admin sessions
5. **No Impersonation Controls**: No secure tenant switching

---

## 🏗️ Architecture Design

### Database Schema

#### New Tables

**1. super_admins**
```sql
CREATE TABLE super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'SUPER_ADMIN', -- SUPER_ADMIN, SUPPORT, DEVELOPER
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_super_admins_email ON super_admins(email);
CREATE INDEX idx_super_admins_active ON super_admins(is_active);
```

**2. audit_logs**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID REFERENCES super_admins(id),
  action VARCHAR(100) NOT NULL, -- LOGIN, LOGOUT, CREATE_TENANT, DELETE_TENANT, IMPERSONATE, etc.
  entity_type VARCHAR(50), -- TENANT, USER, RESERVATION, etc.
  entity_id VARCHAR(255),
  tenant_id VARCHAR(50), -- Which tenant was affected
  details JSONB, -- Additional context
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_admin ON audit_logs(super_admin_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

**3. impersonation_sessions**
```sql
CREATE TABLE impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID REFERENCES super_admins(id) NOT NULL,
  tenant_id VARCHAR(50) NOT NULL,
  reason TEXT, -- Why they're accessing this tenant
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_impersonation_active ON impersonation_sessions(is_active);
CREATE INDEX idx_impersonation_admin ON impersonation_sessions(super_admin_id);
```

#### Modified Tables

**tenants** (add status fields)
```sql
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
-- Status: ACTIVE, SUSPENDED, INACTIVE, DELETED

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES super_admins(id);
```

---

## 🔐 Phase 1: Super Admin Authentication

**Timeline:** Week 1  
**Priority:** Critical

### Backend Implementation

#### 1.1 Database Setup
- [ ] Create `super_admins` table migration
- [ ] Create `audit_logs` table migration
- [ ] Seed initial super admin account
- [ ] Add status fields to `tenants` table

**Files to Create:**
- `services/customer/prisma/migrations/XXX_create_super_admins.sql`
- `services/customer/prisma/migrations/XXX_create_audit_logs.sql`
- `scripts/create-super-admin.mjs`

#### 1.2 Prisma Schema Updates
- [ ] Add SuperAdmin model
- [ ] Add AuditLog model
- [ ] Update Tenant model with status fields
- [ ] Regenerate Prisma client

**Files to Modify:**
- `services/customer/prisma/schema.prisma`

#### 1.3 Authentication Endpoints
- [ ] POST `/api/super-admin/login` - Super admin login
- [ ] POST `/api/super-admin/logout` - Super admin logout
- [ ] GET `/api/super-admin/me` - Get current super admin
- [ ] POST `/api/super-admin/refresh` - Refresh token

**Files to Create:**
- `services/customer/src/controllers/super-admin/auth.controller.ts`
- `services/customer/src/routes/super-admin.routes.ts`
- `services/customer/src/middleware/super-admin-auth.middleware.ts`

#### 1.4 Security Middleware
- [ ] JWT token generation for super admins
- [ ] Token validation middleware
- [ ] Role-based access control (RBAC) middleware
- [ ] Rate limiting for login attempts

**Files to Create:**
- `services/customer/src/middleware/require-super-admin.middleware.ts`
- `services/customer/src/utils/super-admin-jwt.ts`

#### 1.5 Audit Logging
- [ ] Audit log service
- [ ] Automatic logging of all super admin actions
- [ ] IP address and user agent tracking

**Files to Create:**
- `services/customer/src/services/audit-log.service.ts`

### Frontend Implementation

#### 1.6 Super Admin Login Page
- [ ] Login form component
- [ ] Authentication state management
- [ ] Token storage (secure httpOnly cookies)
- [ ] Redirect to admin portal after login

**Files to Create:**
- `frontend/src/pages/super-admin/Login.tsx`
- `frontend/src/contexts/SuperAdminContext.tsx`
- `frontend/src/hooks/useSuperAdmin.ts`

#### 1.7 Protected Routes
- [ ] Super admin route wrapper
- [ ] Redirect to login if not authenticated
- [ ] Role-based route protection

**Files to Create:**
- `frontend/src/components/auth/SuperAdminRoute.tsx`

#### 1.8 Session Management
- [ ] Auto-refresh tokens
- [ ] Session timeout warning
- [ ] Logout on inactivity

**Files to Modify:**
- `frontend/src/App.tsx` (add super admin routes)

### Testing
- [ ] Unit tests for auth controllers
- [ ] Integration tests for login flow
- [ ] Security tests (SQL injection, XSS, etc.)

---

## 🏢 Phase 2: Tenant Management

**Timeline:** Week 2  
**Priority:** High

### Backend Implementation

#### 2.1 Enhanced Tenant Endpoints
- [ ] GET `/api/super-admin/tenants` - List all tenants with filters
- [ ] GET `/api/super-admin/tenants/:id` - Get tenant details
- [ ] POST `/api/super-admin/tenants` - Create new tenant
- [ ] PUT `/api/super-admin/tenants/:id` - Update tenant
- [ ] DELETE `/api/super-admin/tenants/:id` - Hard delete tenant
- [ ] POST `/api/super-admin/tenants/:id/suspend` - Suspend tenant
- [ ] POST `/api/super-admin/tenants/:id/activate` - Activate tenant

**Files to Create:**
- `services/customer/src/controllers/super-admin/tenant-management.controller.ts`

#### 2.2 Tenant Status Management
- [ ] Suspend tenant (soft delete)
- [ ] Activate tenant
- [ ] Delete tenant (hard delete with confirmation)
- [ ] Cascade delete tenant data

**Files to Create:**
- `services/customer/src/services/tenant-lifecycle.service.ts`

#### 2.3 Tenant Statistics
- [ ] GET `/api/super-admin/tenants/:id/stats` - Tenant usage stats
- [ ] Customer count, pet count, reservation count
- [ ] Revenue metrics
- [ ] Active users

**Files to Create:**
- `services/customer/src/controllers/super-admin/tenant-stats.controller.ts`

### Frontend Implementation

#### 2.4 Tenant Management Dashboard
- [ ] Tenant list with search/filter
- [ ] Tenant status indicators (Active, Suspended, Inactive)
- [ ] Quick actions (Suspend, Activate, Delete)
- [ ] Tenant statistics cards

**Files to Modify:**
- `frontend/src/pages/admin/TenantList.tsx` (add super admin features)
- `frontend/src/pages/admin/TenantDetail.tsx` (add status management)

#### 2.5 Tenant Creation Wizard
- [ ] Multi-step tenant creation form
- [ ] Validation and error handling
- [ ] Success confirmation

**Files to Modify:**
- `frontend/src/pages/admin/CreateTenant.tsx`

#### 2.6 Tenant Status Management UI
- [ ] Suspend tenant modal (with reason)
- [ ] Activate tenant confirmation
- [ ] Delete tenant confirmation (with data warning)
- [ ] Status history timeline

**Files to Create:**
- `frontend/src/components/super-admin/TenantStatusManager.tsx`
- `frontend/src/components/super-admin/SuspendTenantDialog.tsx`
- `frontend/src/components/super-admin/DeleteTenantDialog.tsx`

### Testing
- [ ] Test tenant CRUD operations
- [ ] Test status transitions
- [ ] Test cascade delete

---

## 👤 Phase 3: Tenant Impersonation

**Timeline:** Week 3  
**Priority:** High

### Backend Implementation

#### 3.1 Impersonation System
- [ ] POST `/api/super-admin/impersonate/:tenantId` - Start impersonation
- [ ] POST `/api/super-admin/end-impersonation` - End impersonation
- [ ] GET `/api/super-admin/impersonation/active` - Get active session

**Files to Create:**
- `services/customer/src/controllers/super-admin/impersonation.controller.ts`
- `services/customer/src/middleware/impersonation.middleware.ts`

#### 3.2 Session Management
- [ ] Create impersonation session
- [ ] Track session duration
- [ ] Automatic session timeout (30 minutes)
- [ ] Require reason for impersonation

**Files to Create:**
- `services/customer/src/services/impersonation.service.ts`

#### 3.3 Audit Trail
- [ ] Log all impersonation starts
- [ ] Log all actions during impersonation
- [ ] Log impersonation ends
- [ ] Track what was viewed/modified

**Files to Modify:**
- `services/customer/src/services/audit-log.service.ts`

### Frontend Implementation

#### 3.4 Tenant Switching UI
- [ ] "Login as Tenant" button on tenant detail page
- [ ] Impersonation reason modal
- [ ] Confirmation dialog

**Files to Create:**
- `frontend/src/components/super-admin/ImpersonateTenantButton.tsx`
- `frontend/src/components/super-admin/ImpersonationReasonDialog.tsx`

#### 3.5 Impersonation Banner
- [ ] Prominent banner when in impersonation mode
- [ ] Shows which tenant you're viewing as
- [ ] "Exit Impersonation" button
- [ ] Session timer

**Files to Create:**
- `frontend/src/components/super-admin/ImpersonationBanner.tsx`

#### 3.6 Context Switching
- [ ] Switch tenant context
- [ ] Update x-tenant-id header
- [ ] Reload data for new tenant
- [ ] Maintain super admin session

**Files to Modify:**
- `frontend/src/contexts/SuperAdminContext.tsx`
- `frontend/src/services/api.ts` (add impersonation header)

### Security Measures
- [ ] Require reason for impersonation
- [ ] Time-limited sessions (30 min default)
- [ ] Read-only mode option
- [ ] Alert tenant of impersonation (optional)

### Testing
- [ ] Test impersonation flow
- [ ] Test session timeout
- [ ] Test audit logging
- [ ] Test context switching

---

## 📊 Phase 4: Audit & Monitoring

**Timeline:** Week 4  
**Priority:** Medium

### Backend Implementation

#### 4.1 Audit Log Endpoints
- [ ] GET `/api/super-admin/audit-logs` - List audit logs with filters
- [ ] GET `/api/super-admin/audit-logs/:id` - Get log details
- [ ] GET `/api/super-admin/audit-logs/export` - Export logs (CSV)

**Files to Create:**
- `services/customer/src/controllers/super-admin/audit-logs.controller.ts`

#### 4.2 System Monitoring
- [ ] GET `/api/super-admin/system/health` - System health check
- [ ] GET `/api/super-admin/system/stats` - Platform statistics
- [ ] GET `/api/super-admin/system/errors` - Recent errors

**Files to Create:**
- `services/customer/src/controllers/super-admin/system-monitoring.controller.ts`

### Frontend Implementation

#### 4.3 Audit Log Viewer
- [ ] Audit log list with filters
- [ ] Filter by admin, action, tenant, date range
- [ ] Log detail modal
- [ ] Export to CSV

**Files to Create:**
- `frontend/src/pages/super-admin/AuditLogs.tsx`
- `frontend/src/components/super-admin/AuditLogViewer.tsx`

#### 4.4 System Dashboard
- [ ] Platform statistics
- [ ] Active tenants count
- [ ] System health indicators
- [ ] Recent activity feed

**Files to Create:**
- `frontend/src/pages/super-admin/SystemDashboard.tsx`

### Testing
- [ ] Test audit log filtering
- [ ] Test log export
- [ ] Test system monitoring

---

## 🔧 Phase 5: Advanced Features

**Timeline:** Week 5-6  
**Priority:** Low-Medium

### 5.1 Super Admin Management
- [ ] Manage other super admin accounts
- [ ] Role assignment (Super Admin, Support, Developer)
- [ ] Permission matrix
- [ ] Activity monitoring

### 5.2 Tenant Billing Integration
- [ ] View tenant billing status
- [ ] Subscription management
- [ ] Usage-based billing metrics

### 5.3 Data Migration Tools
- [ ] Tenant data export
- [ ] Tenant data import
- [ ] Backup/restore functionality

### 5.4 Communication Tools
- [ ] Send announcements to specific tenants
- [ ] Email all tenants
- [ ] In-app notifications

### 5.5 Advanced Analytics
- [ ] Tenant growth metrics
- [ ] Revenue analytics
- [ ] Usage patterns
- [ ] Churn analysis

---

## 🔒 Security Considerations

### Authentication & Authorization
- [ ] Strong password requirements for super admins
- [ ] Two-factor authentication (2FA)
- [ ] IP whitelist for super admin access
- [ ] Session management with secure cookies
- [ ] CSRF protection
- [ ] Rate limiting on all endpoints

### Data Protection
- [ ] Encrypt sensitive data at rest
- [ ] Secure audit log storage
- [ ] PII handling compliance
- [ ] GDPR compliance for tenant deletion

### Access Control
- [ ] Role-based permissions
- [ ] Principle of least privilege
- [ ] Separation of duties
- [ ] Regular access reviews

### Monitoring & Alerts
- [ ] Failed login attempt alerts
- [ ] Suspicious activity detection
- [ ] Impersonation alerts
- [ ] Data export alerts

---

## 📝 API Endpoints Summary

### Authentication
- `POST /api/super-admin/login` - Login
- `POST /api/super-admin/logout` - Logout
- `GET /api/super-admin/me` - Current user
- `POST /api/super-admin/refresh` - Refresh token

### Tenant Management
- `GET /api/super-admin/tenants` - List tenants
- `GET /api/super-admin/tenants/:id` - Get tenant
- `POST /api/super-admin/tenants` - Create tenant
- `PUT /api/super-admin/tenants/:id` - Update tenant
- `DELETE /api/super-admin/tenants/:id` - Delete tenant
- `POST /api/super-admin/tenants/:id/suspend` - Suspend
- `POST /api/super-admin/tenants/:id/activate` - Activate
- `GET /api/super-admin/tenants/:id/stats` - Statistics

### Impersonation
- `POST /api/super-admin/impersonate/:tenantId` - Start
- `POST /api/super-admin/end-impersonation` - End
- `GET /api/super-admin/impersonation/active` - Active session

### Audit & Monitoring
- `GET /api/super-admin/audit-logs` - List logs
- `GET /api/super-admin/audit-logs/:id` - Log details
- `GET /api/super-admin/audit-logs/export` - Export
- `GET /api/super-admin/system/health` - Health check
- `GET /api/super-admin/system/stats` - Statistics

---

## 🎨 UI/UX Design

### Navigation Structure
```
/super-admin/login
/super-admin/dashboard
/super-admin/tenants
/super-admin/tenants/new
/super-admin/tenants/:id
/super-admin/tenants/:id/edit
/super-admin/audit-logs
/super-admin/system
/super-admin/settings
```

### Key Components
- SuperAdminLayout (with impersonation banner)
- TenantStatusBadge
- ImpersonationBanner
- AuditLogViewer
- SystemHealthIndicator
- TenantStatisticsCard

### Color Coding
- 🟢 Active Tenant
- 🟡 Suspended Tenant
- 🔴 Inactive/Deleted Tenant
- 🔵 Impersonation Mode Active

---

## 📦 Dependencies

### Backend
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `express-rate-limit` - Rate limiting
- `helmet` - Security headers
- `express-validator` - Input validation

### Frontend
- `react-router-dom` - Routing (already installed)
- `@mui/material` - UI components (already installed)
- `date-fns` - Date formatting (already installed)

---

## ✅ Testing Strategy

### Unit Tests
- [ ] Auth controller tests
- [ ] Tenant management tests
- [ ] Impersonation service tests
- [ ] Audit log service tests

### Integration Tests
- [ ] Login flow
- [ ] Tenant CRUD operations
- [ ] Impersonation flow
- [ ] Audit logging

### Security Tests
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Authentication bypass attempts
- [ ] Authorization bypass attempts

### E2E Tests
- [ ] Complete super admin workflow
- [ ] Tenant creation to deletion
- [ ] Impersonation session

---

## 📊 Success Metrics

### Security
- Zero unauthorized access incidents
- 100% audit log coverage
- < 1 second authentication response time

### Functionality
- Tenant creation in < 30 seconds
- Impersonation switch in < 2 seconds
- Audit log search in < 1 second

### Usability
- Super admin can create tenant in < 5 clicks
- Impersonation requires < 3 clicks
- Clear visual indication of impersonation mode

---

## 🚀 Deployment Plan

### Phase 1 Deployment (Auth)
1. Run database migrations
2. Create initial super admin account
3. Deploy backend changes
4. Deploy frontend changes
5. Test login flow
6. Document super admin credentials

### Phase 2 Deployment (Tenant Management)
1. Run tenant status migrations
2. Deploy backend changes
3. Deploy frontend changes
4. Test tenant operations

### Phase 3 Deployment (Impersonation)
1. Run impersonation session migrations
2. Deploy backend changes
3. Deploy frontend changes
4. Test impersonation flow

### Phase 4 Deployment (Audit)
1. Deploy audit log enhancements
2. Deploy monitoring dashboard
3. Test log viewing and export

---

## 📚 Documentation Requirements

### Developer Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Authentication flow diagrams
- [ ] Impersonation flow diagrams

### User Documentation
- [ ] Super admin user guide
- [ ] Tenant management guide
- [ ] Impersonation best practices
- [ ] Security guidelines

### Operations Documentation
- [ ] Deployment procedures
- [ ] Backup and recovery
- [ ] Incident response
- [ ] Access management

---

## 🔄 Maintenance & Support

### Regular Tasks
- Review audit logs weekly
- Review active impersonation sessions daily
- Update super admin passwords quarterly
- Review and revoke inactive super admin accounts

### Monitoring
- Failed login attempts
- Unusual impersonation patterns
- Long-running impersonation sessions
- Tenant deletion events

---

## 📅 Timeline Summary

| Phase | Duration | Priority | Status |
|-------|----------|----------|--------|
| Phase 1: Authentication | Week 1 | Critical | Not Started |
| Phase 2: Tenant Management | Week 2 | High | Not Started |
| Phase 3: Impersonation | Week 3 | High | Not Started |
| Phase 4: Audit & Monitoring | Week 4 | Medium | Not Started |
| Phase 5: Advanced Features | Week 5-6 | Low-Medium | Not Started |

**Total Estimated Time:** 5-6 weeks

---

## 🎯 Next Steps

1. **Review & Approve** this roadmap
2. **Set up development environment** for super admin work
3. **Create database migrations** for Phase 1
4. **Implement authentication** backend
5. **Build login UI** frontend
6. **Test and iterate**

---

## 📞 Configuration Decisions ✅

1. **Initial Super Admin**: Rob Weinstein ✅
2. **2FA Requirement**: Not for MVP, mandatory in future ✅
3. **Impersonation Limits**: 30 minutes per session ✅
4. **Audit Retention**: 90 days (quarterly review) ✅
5. **Tenant Deletion**: Recoverable for 1 year (soft delete) ✅
6. **IP Whitelist**: Not enforced (remote work flexibility) ✅

**See:** `docs/SUPER-ADMIN-CONFIG.md` for complete configuration details

---

**Last Updated:** November 1, 2025  
**Document Owner:** Development Team  
**Status:** Ready for Review
