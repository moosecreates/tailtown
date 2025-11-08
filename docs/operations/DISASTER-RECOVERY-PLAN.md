# Tailtown Disaster Recovery Plan

**Last Updated:** November 7, 2025  
**Version:** 2.0  
**Status:** 🟢 Current with Production

This document outlines the procedures, resources, and checklist for disaster recovery scenarios for the Tailtown Pet Boarding Management System.

## System Architecture Documentation

### Service Configuration
- **Customer Service**
  - Port: 4004
  - Environment Variables: See `/services/customer/.env.example`
  - **Critical:** JWT_SECRET, JWT_REFRESH_SECRET, DATABASE_URL
  
- **Reservation Service**
  - Port: 4003
  - Environment Variables: See `/services/reservation-service/.env.example`
  - **Critical:** DATABASE_URL
  
- **Frontend Application**
  - Port: 3000
  - Environment Variables: See `/frontend/.env.example`
  - **Critical:** REACT_APP_API_URL

### Database Configuration
- **PostgreSQL** database on port 5432 (default) or 5433
- **Multi-tenant architecture** with tenant isolation
- Shared database with tenant_id on all tables
- Schemas documented in Prisma schemas
- **Critical tables:** Staff, Customer, Pet, Reservation, RefreshToken

### Security Features (Critical for Recovery)
- **Rate Limiting:** 5 login attempts per 15 minutes
- **Account Lockout:** Auto-locks after 5 failed attempts (15 min)
- **Refresh Tokens:** 8-hour access tokens, 7-day refresh tokens
- **Input Validation:** Zod validation on all API endpoints
- **Security Headers:** HSTS, CSP, CORS configured

## Disaster Recovery Checklist

### 1. Repository Recovery
- ✅ Full codebase is version controlled in Git
- ✅ Ensure access to the repository backup or main branch
- ✅ Clone repository: `git clone [repository-url]`

### 2. Environment Setup
- ✅ Create `.env` files in each service based on `.env.example` templates
- ✅ **CRITICAL:** Set JWT_SECRET and JWT_REFRESH_SECRET (must be different!)
- ✅ Configure database connection (default port 5432)
- ✅ Set service ports according to documentation (4004, 4003, 3000)
- ✅ Configure CORS allowed origins for production
- ✅ Set NODE_ENV=production for production deployment

### 3. Database Recovery
- ✅ Restore PostgreSQL database from latest backup
- ✅ **CRITICAL:** Verify tenant_id exists on all tables (multi-tenancy)
- ✅ Run database migrations: 
  ```bash
  cd services/customer && npx prisma migrate deploy
  cd services/reservation-service && npx prisma migrate deploy
  ```
- ✅ Verify database schema matches Prisma schema definitions
- ✅ **CRITICAL:** Verify RefreshToken table exists (added Nov 2025)
- ✅ **CRITICAL:** Verify Staff table has lockout fields (failedLoginAttempts, lockedUntil, lastFailedLogin)
- ✅ Run data validation scripts to ensure data integrity
- ✅ Verify tenant isolation is working (test cross-tenant queries fail)

### 4. Service Deployment
- ✅ Install dependencies in all services:
  ```
  cd services/customer && npm install
  cd services/reservation-service && npm install
  cd frontend && npm install
  ```
- ✅ Build services:
  ```
  cd services/customer && npm run build
  cd services/reservation-service && npm run build
  cd frontend && npm run build
  ```
- ✅ Start services in the correct order:
  1. Database service
  2. Customer service
  3. Reservation service
  4. Frontend application

### 5. Verification and Testing
- ✅ Verify all services are running on correct ports
- ✅ Test basic CRUD operations for all entities
- ✅ **CRITICAL:** Test authentication and authorization
  - Login with valid credentials
  - Verify JWT token generation
  - Test refresh token flow
  - Verify account lockout after 5 failed attempts
  - Test rate limiting (5 attempts/15 min)
- ✅ **CRITICAL:** Verify tenant isolation
  - Login as user from Tenant A
  - Verify cannot access Tenant B data
  - Test cross-tenant queries are blocked
- ✅ Verify reservation workflow and resource allocation
- ✅ **Security Tests:**
  - Test input validation (try invalid data)
  - Verify security headers are present
  - Test CORS configuration
  - Verify no sensitive data in error messages

## Documentation Validation Checklist

Ensure the following documentation is up-to-date and aligned:

### 1. Environment Variables
- ✅ `.env.example` files exist for all services
- ✅ Port numbers are consistent across all documentation
- ✅ Database connection parameters are consistent

### 2. Service Documentation
- ✅ Service architecture documentation reflects current implementation
- ✅ API endpoints are documented with examples
- ✅ Service dependencies and communication patterns are documented

### 3. Database Documentation
- ✅ Schema alignment strategy is documented
- ✅ Migration procedures are documented
- ✅ Data models match actual database schema
- ✅ Shared database approach is documented

### 4. Security Documentation
- ✅ Authentication and authorization flow is documented
- ✅ JWT secret handling procedures are documented
- ✅ Tenant isolation mechanism is documented
- ✅ **NEW:** Rate limiting configuration documented
- ✅ **NEW:** Account lockout mechanism documented
- ✅ **NEW:** Refresh token system documented
- ✅ **NEW:** Input validation (Zod) documented

### 5. Current Documentation Structure
- ✅ `/docs/human/` - Quick guides for developers
- ✅ `/docs/ai-context/` - Complete context for AI assistants
- ✅ `/docs/features/` - Feature documentation
- ✅ `/docs/security/` - Security documentation
- ✅ `/docs/deployment/` - Deployment guides
- ✅ See `/docs/DOCUMENTATION-STRATEGY.md` for organization

## Backup Procedures

### DigitalOcean Droplet Backups (Primary)
- **Automated daily backups** enabled in DigitalOcean
- **Entire server** backed up (database, code, configuration)
- **Retention:** Last 4 backups (rolling)
- **Location:** DigitalOcean managed storage
- **Restore:** One-click from DigitalOcean dashboard
- **CRITICAL:** Test restore procedure quarterly

### Database Backup (Additional - Optional)
- **Manual backups** available via `/scripts/database/backup-database.sh`
- **Use for:** Point-in-time recovery, migration, testing
- **Backup rotation:** 7 daily, 4 weekly, 12 monthly (if configured)
- **CRITICAL:** Ensure backups include all tenant data
- **Backup location:** Local or DigitalOcean Spaces (if configured)

### Code and Configuration Backup
- Regular commits to version control system (GitHub)
- Documentation updates synchronized with code changes
- Environment configuration templates in version control
- **CRITICAL:** Secure storage of production secrets (not in git)

### Security Configuration Backup
- JWT secrets (stored securely, not in version control)
- Rate limiting configuration
- CORS allowed origins
- Database credentials

## Recovery Time Objectives (RTO)

- **Development environment:** 2 hours
- **Staging environment:** 4 hours
- **Production environment (DigitalOcean restore):** 1-2 hours
- **Database restore (from droplet backup):** 30 minutes
- **Full system verification:** 2 hours

## Recovery Point Objectives (RPO)

- **Full server (DigitalOcean):** 24 hours (daily backups)
- **Database:** 24 hours (included in droplet backup)
- **Code:** Real-time (GitHub)
- **Configuration:** 24 hours (included in droplet backup)

## Multi-Tenant Recovery Considerations

### Tenant Data Isolation
- ✅ Verify tenant_id on all restored tables
- ✅ Test tenant isolation after recovery
- ✅ Verify no cross-tenant data leakage
- ✅ Test tenant-specific queries work correctly

### Tenant-Specific Recovery
- Ability to restore single tenant if needed
- Tenant data export/import procedures
- Tenant isolation verification scripts

## Security Recovery Checklist

### Post-Recovery Security Verification
- ✅ Rotate all JWT secrets
- ✅ Verify rate limiting is active
- ✅ Test account lockout mechanism
- ✅ Verify refresh token system works
- ✅ Test input validation on all endpoints
- ✅ Verify security headers are present
- ✅ Run security test suite (380+ tests)
- ✅ Check for any exposed secrets or credentials

## Contact Information

- **Primary Technical Contact:** [Name], [Email], [Phone]
- **Secondary Technical Contact:** [Name], [Email], [Phone]
- **Database Administrator:** [Name], [Email], [Phone]
- **Security Contact:** [Name], [Email], [Phone]
- **Hosting Provider Support:** [Provider], [Support URL], [Phone]

## Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | August 3, 2025 | System | Initial disaster recovery plan |
| 2.0 | November 7, 2025 | System | Updated for multi-tenancy, security features, new file structure |

## Additional Resources

### Internal Documentation
- [Quick Start Guide](/docs/human/QUICK-START.md)
- [Security Documentation](/docs/security/)
- [Deployment Guide](/docs/deployment/)
- [Documentation Strategy](/docs/DOCUMENTATION-STRATEGY.md)

### External Resources
- [PostgreSQL Backup and Recovery](https://www.postgresql.org/docs/current/backup.html)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## Quick Recovery from DigitalOcean Backup

### Option 1: Restore Entire Droplet (Fastest)
1. **Log into DigitalOcean dashboard**
2. **Go to your droplet** → Backups tab
3. **Select backup** to restore from
4. **Click "Restore from this backup"**
5. **Wait 5-15 minutes** for restore to complete
6. **Verify services** are running:
   ```bash
   ssh root@your-droplet-ip
   pm2 status
   systemctl status postgresql
   ```

### Option 2: Create New Droplet from Backup
1. **Go to Create → Droplets**
2. **Choose an image** → Backups tab
3. **Select your backup**
4. **Create droplet**
5. **Update DNS** to point to new droplet IP
6. **Update environment variables** if needed

---

## Quick Recovery Commands

### Clone and Setup (Manual Recovery)
```bash
# 1. Clone repository
git clone https://github.com/moosecreates/tailtown.git
cd tailtown

# 2. Install dependencies
npm install
cd services/customer && npm install && cd ../..
cd services/reservation-service && npm install && cd ../..
cd frontend && npm install && cd ../..

# 3. Setup environment variables
cp services/customer/.env.example services/customer/.env
cp services/reservation-service/.env.example services/reservation-service/.env
cp frontend/.env.example frontend/.env
# EDIT .env files with production values!

# 4. Run migrations
cd services/customer && npx prisma migrate deploy && cd ../..
cd services/reservation-service && npx prisma migrate deploy && cd ../..

# 5. Start services
npm run start:services
cd frontend && npm start
```

### Verification
```bash
# Test services are running
curl http://localhost:4004/health
curl http://localhost:4003/health

# Run security tests
cd services/customer
npm test -- --testPathPattern=security
```

---

**Last Review:** November 7, 2025  
**Next Review:** February 7, 2026  
**Status:** ✅ Current with production architecture
