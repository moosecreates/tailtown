# Tailtown Application Roadmap

## Overview
This roadmap outlines the planned features and improvements for the Tailtown application. It is organized into phases, with each phase building upon the previous one to create a comprehensive pet care management system.

## Phase 1: Core Functionality (Completed)
- ✅ Basic CRUD operations for all entities (customers, pets, services, resources)
- ✅ Reservation management with status workflow
- ✅ Kennel management with occupancy tracking
- ✅ Calendar integration with FullCalendar
- ✅ Pet vaccination status tracking
- ✅ Service duration-based reservation end time calculation
- ✅ Kennel calendar implementation
- ✅ Form improvements and accessibility enhancements

## Phase 2: Enhanced User Experience (Next)
- 🔲 Drag-and-drop functionality for calendar events
- 🔲 Batch operations for reservations (e.g., check-in multiple pets at once)
- 🔲 Advanced filtering and search capabilities
- 🔲 Customer portal for self-service booking
- 🔲 Email notifications for reservation status changes
- ✅ Staff scheduling and availability management
- ✅ Standardized time format display (12-hour format with AM/PM)
- ✅ Unique order number system for reservations (RES-YYYYMMDD-001 format)
- 🔲 Mobile-responsive design improvements
- 🔲 Dark mode support
- 🔲 Priority alerts for staff
- 🔲 Permission levels and restrictions for users

## Phase 3: Business Operations
- ✅ Invoicing and payment processing
  - Invoice generation for reservations
  - Payment tracking and history
  - Invoice details view with line items
  - Tax calculations with configurable tax rate (7.44%)
- 🔲 Integration with merchant services
- 🔲 Inventory management for pet supplies
- ✅ Reporting and analytics dashboard (Implemented May 12, 2025)
- ✅ Service and add-on revenue reporting (Implemented May 12, 2025)
- ✅ Customer value tracking and reporting (Implemented May 12, 2025)
- 🔲 Additional comprehensive reporting features
- ✅ Configurable settings (e.g., tax rates)
- ✅ Customer accounts with balance and payment history
- 🔲 Automated reminders for upcoming appointments
- 🔲 Comprehensive loyalty rewards system
  - Points accumulation based on services
  - Tiered membership levels
  - Reward redemption options
  - Automated loyalty communications
- 🔲 Integration with accounting software
- 🔲 Staff performance metrics
- 🔲 Multi-location support
- ✅ Sales add-ons and upselling features

## Phase 4: Advanced Features
- 🔲 Pet health monitoring and alerts
- 🔲 AI-powered recommendations for services
- 🔲 Customer feedback and review system
- 🔲 Mobile app for customers
- 🔲 Integration with third-party services (e.g., veterinary systems)
- 🔲 Automated marketing campaigns
- 🔲 Advanced business intelligence tools
- 🔲 API for third-party integrations
- 🔲 Embeddable widgets for customer websites

## Phase 5: Infrastructure and Scaling
- ✅ Microservices architecture implementation (Completed August 2025)
  - Customer service (port 4004)
  - Reservation service (port 4003)
  - Frontend application (port 3000)
  - Shared PostgreSQL database (port 5433)
- ✅ Service communication via RESTful APIs (Completed August 2025)
- ✅ Tenant isolation middleware (Completed August 2025)
- 🔲 Migration to hosted servers
- 🔲 Cloud infrastructure optimization
- 🔲 Website integration components for customer online ordering
- 🔲 Global content delivery network (CDN)
- 🔲 Automated deployment pipelines
- 🔲 High-availability configuration
- 🔲 Disaster recovery planning

## Technical Debt and Improvements
Throughout all phases, we will address the following ongoing concerns:

- 🔲 Comprehensive test coverage (unit, integration, and end-to-end tests)
- 🔲 Performance optimization for large datasets
- 🔲 Security audits and improvements
- ✅ Schema alignment and consistency (Completed August 3, 2025)
  - Fixed Prisma schema mismatches between services
  - Standardized field names and types across services
  - Removed references to non-existent fields and models
- ✅ Code refactoring for maintainability and consistency (Ongoing)
  - Enhanced resource filtering logic
  - Improved error handling and logging
  - Fixed tenant middleware for development mode
- ✅ Documentation updates for implemented features (Completed August 3, 2025)
  - Updated service architecture documentation
  - Revised environment variables documentation
  - Enhanced schema alignment strategy documentation
  - Updated feature documentation for reservations
- 🔲 Accessibility compliance (WCAG 2.1 AA)
- 🔲 DevOps improvements (CI/CD, monitoring, logging)

## Environment-Specific Considerations

### Development Environment
- ✅ Shared database configuration (Completed August 3, 2025)
  - PostgreSQL on port 5433
  - Consistent database URL format across services
  - Schema synchronization between services
- ✅ Service port standardization (Completed August 3, 2025)
  - Customer service: 4004
  - Reservation service: 4003
  - Frontend: 3000
- ✅ Enhanced tenant middleware for development mode (Completed August 3, 2025)
- 🔲 Improved developer tooling
- 🔲 Streamlined local setup process
- 🔲 Better debugging capabilities
- 🔲 Comprehensive API documentation

### Test Environment
- 🔲 Automated test data generation
- 🔲 Performance testing infrastructure
- 🔲 Integration test environment
- 🔲 User acceptance testing framework

### Production Environment
- 🔲 Scalable infrastructure
- 🔲 Backup and disaster recovery
- 🔲 Monitoring and alerting
- 🔲 High availability configuration

## Prioritization Criteria
Features will be prioritized based on:

1. Business value
2. User impact
3. Technical complexity
4. Dependencies
5. Resource availability

## Current Focus: Stability and Maintenance (August 2025)

- ✅ Schema alignment between services (Completed August 3, 2025)
  - Synchronized Prisma schemas between customer and reservation services
  - Fixed field name inconsistencies (e.g., `birthdate` vs `age`)
  - Removed references to non-existent fields (e.g., `organizationId`)

- ✅ Resource filtering enhancements (Completed August 3, 2025)
  - Added support for multiple resource type filtering
  - Implemented proper enum validation for resource types
  - Improved error handling and logging

- ✅ Documentation updates (Completed August 3, 2025)
  - Updated service architecture documentation
  - Revised environment variables documentation
  - Enhanced schema alignment strategy documentation
  - Updated feature documentation for reservations

- ✅ Shared database approach (Completed August 3, 2025)
  - Both services now use the same PostgreSQL database
  - Consistent port configuration (5433) for database access
  - Improved tenant middleware for development mode

## Upcoming Priorities

- 🔲 Batch operations for reservations (e.g., check-in multiple pets at once)
- 🔲 Customer portal for self-service booking
- 🔲 Email and text notifications for reservation status changes
- 🔲 Mobile-responsive design improvements
- 🔲 Priority alerts for staff
- 🔲 Permission levels and restrictions for users
- 🔲 Integration with merchant services
- 🔲 Inventory management for pet supplies
- 🔲 Additional comprehensive reporting features
- 🔲 Automated reminders for upcoming appointments
- 🔲 Comprehensive loyalty rewards system
  - Points accumulation based on services
  - Tiered membership levels
  - Reward redemption options
  - Automated loyalty communications

## Bug Fixes

### Recent Fixes (August 2025)
- ✅ Fixed resource filtering to correctly handle multiple resource types (Fixed August 3, 2025)
- ✅ Fixed Prisma schema mismatches between customer and reservation services (Fixed August 3, 2025)
- ✅ Fixed field name inconsistencies (`birthdate` vs `age` in Pet model) (Fixed August 3, 2025)
- ✅ Removed references to non-existent `organizationId` field (Fixed August 3, 2025)
- ✅ Fixed database connection issues by using consistent port 5433 (Fixed August 3, 2025)

### Previous Fixes
- ✅ New Customer under New Order doesn't accept text (Fixed May 6, 2025)
- ✅ New orders are displaying all kennels and not taking availability into account (Fixed May 6, 2025)
- ✅ Total price under reservation details is not reflecting the add ons and discounts (Fixed May 6, 2025)
- ✅ Staff scheduling now uses compact time format (minutes only shown when needed) (Fixed May 12, 2025)
- ✅ Staff schedule now shows starting assignment location (Fixed May 12, 2025)
- ✅ Fixed duplicate shift creation when updating staff schedules (Fixed May 12, 2025)
- ✅ Add-on sales are now working on all reservation types (Fixed May 11, 2025)
- ✅ Fixed service deletion issues with active reservations (Fixed May 12, 2025)
- ✅ Improved service management UI by simplifying deactivation workflow (Fixed May 12, 2025)

### Outstanding Issues
- 🔲 Cash amount paid after discount can have strange partial penny issues
- 🔲 Add feeding schedule to kennel cards with weekly dates automatically added
