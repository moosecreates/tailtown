# Tailtown Disaster Recovery Plan

This document outlines the procedures, resources, and checklist for disaster recovery scenarios for the Tailtown Pet Boarding Management System.

## System Architecture Documentation

### Service Configuration
- **Customer Service**
  - Port: 4004
  - Environment Variables: See `/services/customer/.env.example`
  
- **Reservation Service**
  - Port: 4003
  - Environment Variables: See `/services/reservation-service/.env.example`
  
- **Frontend Application**
  - Port: 3000
  - Environment Variables: See `/frontend/.env.example`

### Database Configuration
- PostgreSQL database on port 5433
- Shared database approach between services
- Schemas documented in Prisma schemas

## Disaster Recovery Checklist

### 1. Repository Recovery
- ✅ Full codebase is version controlled in Git
- ✅ Ensure access to the repository backup or main branch
- ✅ Clone repository: `git clone [repository-url]`

### 2. Environment Setup
- ✅ Create `.env` files in each service based on `.env.example` templates
- ✅ Configure database connection in each service to use port 5433
- ✅ Set service ports according to documentation (4004, 4003, 3000)
- ✅ Configure JWT secrets and other security parameters

### 3. Database Recovery
- ✅ Restore PostgreSQL database from latest backup
- ✅ Run database migrations: 
  ```
  cd services/customer && npx prisma migrate deploy
  cd services/reservation-service && npx prisma migrate deploy
  ```
- ✅ Verify database schema matches Prisma schema definitions
- ✅ Run data validation scripts to ensure data integrity

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
- ✅ Test authentication and authorization
- ✅ Verify reservation workflow and resource allocation
- ✅ Check tenant isolation is working correctly

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

## Backup Procedures

### Database Backup
- Automated daily backups of PostgreSQL database
- Backup rotation: 7 daily, 4 weekly, 12 monthly
- Backup verification test monthly

### Code and Configuration Backup
- Regular commits to version control system
- Documentation updates synchronized with code changes
- Environment configuration templates in version control

## Recovery Time Objectives

- Development environment: 4 hours
- Test environment: 8 hours
- Production environment: 12 hours

## Contact Information

- Primary Technical Contact: [Name], [Email], [Phone]
- Secondary Technical Contact: [Name], [Email], [Phone]
- Database Administrator: [Name], [Email], [Phone]

## Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | August 3, 2025 | System | Initial disaster recovery plan |

## Additional Resources

- [PostgreSQL Backup and Recovery Documentation](https://www.postgresql.org/docs/current/backup.html)
- [Docker Container Recovery Best Practices](https://docs.docker.com/engine/reference/commandline/container_restart/)
- [Node.js Application Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
