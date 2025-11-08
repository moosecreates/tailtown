# Tailtown Current System Architecture

**Last Updated**: November 5, 2025 - 4:10 PM PST  
**Status**: ✅ Production - All Systems Operational

---

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Production Environment                           │
│                    https://brangro.canicloud.com                        │
│                         129.212.178.244                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            Nginx (SSL/Proxy)                            │
│                      Let's Encrypt SSL Certificate                      │
│                  Routes: /, /api/*, /static/*                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│   Frontend (React SPA)       │    │   Backend Services           │
│   Port: 3000 (PM2)           │    │   PM2 Cluster Mode           │
│   Build: Static files        │    │                              │
│   served by Nginx            │    │   ┌──────────────────────┐   │
│                              │    │   │ Customer Service     │   │
│   Features:                  │    │   │ Port: 4004          │   │
│   - Material-UI              │    │   │ Instances: 2        │   │
│   - React Router             │    │   │                     │   │
│   - JWT Auth                 │    │   │ Controllers:        │   │
│   - Multi-tenant             │    │   │ - Customers         │   │
│   - Calendar                 │    │   │ - Pets              │   │
│   - POS                      │    │   │ - Staff             │   │
│                              │    │   │ - Products          │   │
│   API Integration:           │    │   │ - Announcements     │   │
│   - Auto JWT headers         │    │   │ - Invoices          │   │
│   - Tenant detection         │    │   │ - Grooming          │   │
│   - Dynamic URLs             │    │   │ - Training          │   │
└──────────────────────────────┘    │   │ - Checklists        │   │
                                    │   │ - SMS               │   │
                                    │   └──────────────────────┘   │
                                    │                              │
                                    │   ┌──────────────────────┐   │
                                    │   │ Reservation Service  │   │
                                    │   │ Port: 4003          │   │
                                    │   │ Instances: 2        │   │
                                    │   │                     │   │
                                    │   │ Controllers:        │   │
                                    │   │ - Reservations      │   │
                                    │   │ - Resources         │   │
                                    │   │ - Availability      │   │
                                    │   └──────────────────────┘   │
                                    └──────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                                │
│                           Port: 5432                                    │
│                                                                        │
│   Tenants:                                                             │
│   - tailtown (🔴 PRODUCTION - Your business, real data)               │
│   - brangro (🟡 DEMO - Customer demo site, mock data)                 │
│   - dev (🟢 DEVELOPMENT - Local testing, safe to break)               │
│                                                                        │
│   Key Tables:                                                          │
│   - customers, pets, staff                                            │
│   - reservations, resources                                           │
│   - products, invoices                                                │
│   - announcements, training_classes                                   │
│   - groomer_appointments, checklists                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │ 1. Login (email/password)
       ▼
┌──────────────────────────────────┐
│  Frontend (AuthContext)          │
│  POST /api/staff/login           │
└──────┬───────────────────────────┘
       │ 2. Credentials
       ▼
┌──────────────────────────────────┐
│  Backend (Staff Controller)      │
│  - Validate credentials          │
│  - Generate JWT token            │
│  - Return user + accessToken     │
└──────┬───────────────────────────┘
       │ 3. { data: {...}, accessToken: "jwt..." }
       ▼
┌──────────────────────────────────┐
│  Frontend (localStorage)         │
│  - Store JWT token               │
│  - Store user data               │
└──────┬───────────────────────────┘
       │ 4. All subsequent requests
       ▼
┌──────────────────────────────────┐
│  API Service (Axios Interceptor) │
│  - Add Authorization header      │
│  - Bearer {token}                │
└──────┬───────────────────────────┘
       │ 5. Authenticated request
       ▼
┌──────────────────────────────────┐
│  Backend Middleware              │
│  - optionalAuth OR authenticate  │
│  - Verify JWT                    │
│  - Extract user info             │
│  - Attach to req.user            │
└──────┬───────────────────────────┘
       │ 6. Authorized request
       ▼
┌──────────────────────────────────┐
│  Controller                      │
│  - Access req.user.id            │
│  - Process business logic        │
└──────────────────────────────────┘
```

---

## 🏢 Multi-Tenant Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    Tenant Detection Flow                        │
└────────────────────────────────────────────────────────────────┘

Request: https://brangro.canicloud.com/dashboard
                    │
                    ▼
┌────────────────────────────────────────────────────────────────┐
│  extractTenantContext Middleware                               │
│                                                                │
│  1. Extract subdomain from hostname                            │
│     hostname: "brangro.canicloud.com"                         │
│     subdomain: "brangro"                                      │
│                                                                │
│  2. Lookup tenant in database                                  │
│     SELECT * FROM tenants WHERE subdomain = 'brangro'         │
│                                                                │
│  3. Validate tenant is active                                  │
│     if (!tenant.isActive) → 403 Forbidden                     │
│                                                                │
│  4. Attach to request                                          │
│     req.tenantId = 'brangro'                                  │
│     req.tenant = { ...tenant data }                           │
└────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────┐
│  Controller (TenantRequest)                                    │
│                                                                │
│  const tenantId = req.tenantId || 'dev';                      │
│                                                                │
│  // All queries filtered by tenant                             │
│  const products = await prisma.product.findMany({             │
│    where: { tenantId }                                        │
│  });                                                           │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Isolation

### Tenant-Specific Data
Every major table includes `tenantId` for data isolation:

```sql
-- Example: Products table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR NOT NULL,  -- Isolates data
  name VARCHAR NOT NULL,
  price DECIMAL(10,2),
  ...
  INDEX idx_products_tenant (tenant_id)
);

-- All queries MUST filter by tenant_id
SELECT * FROM products WHERE tenant_id = 'brangro';
```

### Controllers Using Proper Tenant Context
✅ **All 13 controllers updated** (Nov 5, 2025):
- products.controller.ts
- groomerAppointment.controller.ts
- checklist.controller.ts
- custom-icons.controller.ts
- enrollment.controller.ts
- referenceData.controller.ts
- reports.controller.ts
- sms.controller.ts
- staff.controller.ts
- trainingClass.controller.ts
- vaccineRequirement.controller.ts
- announcement.controller.ts
- invoice.controller.ts

---

## 🔧 Middleware Stack

### Request Processing Pipeline

```
Incoming Request
    │
    ▼
┌─────────────────────────────────┐
│  1. extractTenantContext        │  ← Identifies tenant from subdomain
│     - Subdomain detection       │
│     - Tenant lookup             │
│     - Validation                │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  2. optionalAuth (if needed)    │  ← Extracts user from JWT if present
│     - Parse Authorization       │
│     - Verify JWT                │
│     - Attach user to req        │
│     - Continue if no token      │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  3. authenticate (if required)  │  ← Requires valid JWT
│     - Parse Authorization       │
│     - Verify JWT                │
│     - Attach user to req        │
│     - 401 if no valid token     │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  4. requireTenant (if needed)   │  ← Ensures tenant context exists
│     - Check req.tenantId        │
│     - 400 if missing            │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  5. Controller                  │  ← Business logic
│     - Access req.tenantId       │
│     - Access req.user           │
│     - Process request           │
└─────────────────────────────────┘
```

---

## 🧪 Testing Infrastructure

### Test Coverage (Nov 5, 2025)

```
services/customer/src/middleware/__tests__/
├── tenant.middleware.test.ts      (8 test cases)
│   ├── Extract tenant from subdomain
│   ├── Extract from header
│   ├── Extract from query param
│   ├── Default to 'dev'
│   ├── Handle inactive tenant
│   ├── Handle non-existent tenant
│   └── Require tenant validation
│
└── auth.middleware.test.ts        (10 test cases)
    ├── authenticate middleware
    │   ├── Valid JWT token
    │   ├── Valid API key
    │   ├── Invalid token
    │   └── No authentication
    ├── optionalAuth middleware
    │   ├── Valid token
    │   ├── Invalid token
    │   └── No token
    └── requireSuperAdmin middleware
        ├── Allow super admin
        ├── Reject non-admin
        └── Reject unauthenticated

Total: 18 test cases
```

---

## 🚀 Deployment Architecture

### PM2 Process Management

```
┌─────────────────────────────────────────────────────────────┐
│  PM2 Ecosystem                                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  frontend (id: 6)                                    │  │
│  │  Mode: fork                                          │  │
│  │  Instances: 1                                        │  │
│  │  Command: serve -s build -l 3000                    │  │
│  │  Auto-restart: Yes                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  customer-service (id: 0, 2)                        │  │
│  │  Mode: cluster                                       │  │
│  │  Instances: 2                                        │  │
│  │  Port: 4004                                          │  │
│  │  Auto-restart: Yes                                   │  │
│  │  Load balancing: Round-robin                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  reservation-service (id: 1, 3)                     │  │
│  │  Mode: cluster                                       │  │
│  │  Instances: 2                                        │  │
│  │  Port: 4003                                          │  │
│  │  Auto-restart: Yes                                   │  │
│  │  Load balancing: Round-robin                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Nginx Configuration

**Note:** The `localhost` references below are **server-side** configuration on the production server. Nginx proxies external requests (https://canicloud.com) to internal services running on localhost ports.

```nginx
server {
    listen 443 ssl http2;
    server_name brangro.canicloud.com;
    
    ssl_certificate /etc/letsencrypt/live/canicloud.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/canicloud.com/privkey.pem;
    
    # Frontend (static files)
    # External: https://brangro.canicloud.com
    # Internal: http://localhost:3000 (on server)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend APIs
    # External: https://brangro.canicloud.com/api
    # Internal: http://localhost:4004 (on server)
    location /api/ {
        proxy_pass http://localhost:4004;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📦 Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **Language**: TypeScript 4.9.5
- **UI Library**: Material-UI 5.x
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Build Tool**: Create React App

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator

### Infrastructure
- **Server**: Oracle Cloud (129.212.178.244)
- **OS**: Ubuntu 22.04 LTS
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
- **DNS**: Cloudflare

---

## 🔄 Recent Updates (November 5, 2025)

### Code Cleanup Session
- ✅ Fixed 13 controllers for proper tenant context (86+ functions)
- ✅ Removed debug console.log statements
- ✅ Cleaned up 6 unused icon imports
- ✅ Added error handling for profile photos
- ✅ Added JSDoc documentation

### Authentication Improvements
- ✅ Added `optionalAuth` middleware
- ✅ Removed 'default-user' fallback
- ✅ Fixed JWT token storage in frontend
- ✅ Auto-send JWT with all API requests
- ✅ Require authentication for announcement dismissals

### Testing Infrastructure
- ✅ Created tenant middleware tests (8 cases)
- ✅ Created auth middleware tests (10 cases)
- ✅ Total: 18 test cases with full coverage

### Deployments Today
- Frontend: 11 deployments
- Backend: 5 deployments
- All services healthy ✅

---

## 📊 Production Metrics

### Tenant Overview (Nov 5, 2025)
- **Production Tenant**: Tailtown (your business)
- **Demo Tenant**: BranGro (customer demos)
- **Dev Tenant**: Dev (local development)

### Tailtown Tenant (Production - YOUR BUSINESS)
- **Status**: 🔴 **CRITICAL - PRODUCTION**
- **Purpose**: Real business operations
- **Data**: Real customers, pets, reservations
- **Priority**: Highest - must work flawlessly
- **Use For**: Daily operations, real testing

### BranGro Tenant (Demo Site)
- **Status**: 🟡 **DEMO - NON-CRITICAL**
- **Purpose**: Customer demos, feature testing
- **Data**: Mock/demo data
- **Customers**: 20 (demo)
- **Pets**: 20 (demo)
- **Reservations**: 10 (demo)
- **Staff**: 4 (demo)
- **Products**: 6 (template POS items)
- **Use For**: Sales demos, safe testing, training

### System Health
- **Uptime**: 99.9%
- **Active Tenants**: 3 (tailtown, brangro, dev)

### Performance
- **API Response Time**: < 200ms average
- **Page Load Time**: < 2s
- **Database Queries**: Optimized with indexes
- **Memory Usage**: ~200MB per service instance

---

## 🎯 Architecture Principles

1. **Multi-Tenancy First**: All data isolated by tenant
2. **Type Safety**: TypeScript everywhere
3. **Test Coverage**: Critical paths tested
4. **Security**: JWT auth, password hashing, SQL injection prevention
5. **Scalability**: Cluster mode, load balancing ready
6. **Maintainability**: Clean code, documented, consistent patterns
7. **Monitoring**: PM2 logs, health checks, error tracking

## 🏢 Tenant Strategy

For detailed information about tenant purposes and usage, see [TENANT-STRATEGY.md](TENANT-STRATEGY.md).

### Quick Reference
- **Tailtown**: 🔴 Production (your business, real data)
- **BranGro**: 🟡 Demo (customer demos, mock data)
- **Dev**: 🟢 Development (local testing, safe to break)

### Development Workflow
```
Dev → BranGro → Tailtown → Future Customer Tenants
```

1. Develop and test in **Dev**
2. Validate with demo data in **BranGro**
3. Deploy to production in **Tailtown**
4. Roll out to paying customers

---

## 📝 Next Steps

### Immediate
- Configure SendGrid/Twilio for production
- Implement automated backups
- Add monitoring and alerting

### Short Term
- Add more test coverage
- Implement token refresh
- Add API rate limiting

### Long Term
- Microservices expansion
- Kubernetes deployment
- Multi-region support

---

**Document Status**: ✅ Current and Accurate  
**Last Verified**: November 5, 2025  
**Maintained By**: Development Team
