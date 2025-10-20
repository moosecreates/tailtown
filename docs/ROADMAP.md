# Tailtown Unified Roadmap

This document combines the overall project roadmap and the reservation service refactoring roadmap to provide a single source of truth for tracking progress across all aspects of the Tailtown Pet Resort Management System.

## Recent Major Milestone (September 2025)

### ✅ Complete Order System Implementation (v2.0.0)
- **Complete 5-step order processing** from customer selection to payment
- **End-to-end workflow** with invoice generation and payment tracking
- **Enhanced reservation API** with complete financial data
- **Fixed CORS issues** across all services
- **Smart date validation** and error handling

## Current Focus: Bug Fixes, Calendar Enhancements & Critical Features (October 2025)

### 🔥 Immediate Priorities (High Priority)

#### Critical Bug Fixes
- **Multi-Pet Selection Fix** - Allow selecting multiple pets for single reservation
- **Optional Add-Ons Fix** - Make add-ons truly optional in order process
- **Pet Icons Fix** - Fix broken or missing pet icons throughout the application
- **Calendar Functionality** - Fix grooming and training calendars
- **Drag-and-Drop Calendar** - Enable moving reservations between dates/times

#### Revenue & Customer Experience
- **Online Customer Booking Portal** - Self-service booking workflow for customers (web-based)
- **Credit Card Integration (CardConnect)** - Integrated payment processing for online and in-person transactions
- **Retail POS System** - Point of sale for retail items and packages
- **High Demand Pricing** - Dynamic pricing based on demand, seasonality, and capacity

#### Operations & Hardware
- **Collar/Name Tag Printing** - Direct printing of pet collar tags and kennel cards
- **Area-Specific Checklists** - Customizable checklists for different areas (kennel, grooming, training, etc.)
- **Comprehensive Reports Page** - Advanced reporting for financials, customers, pets, marketing, and operations

#### Infrastructure & Integration
- **AWS Migration** - Migrate to cloud infrastructure (AWS) for production deployment
- **Import Tools (Gingr & Others)** - Data migration tools to import from other pet management systems

## Previous Focus: Stability and Maintenance (August 2025)

- ✅ Schema alignment between services (Completed August 3, 2025)
  - Synchronized Prisma schemas between customer and reservation services
  - Fixed field name inconsistencies (e.g., `birthdate` vs `age`)
  - Removed references to non-existent fields (e.g., `organizationId`)
  - Implemented shared database approach for consistent schema across services

- ✅ Resource filtering enhancements (Completed August 3, 2025)
  - Added support for multiple resource type filtering
  - Implemented proper enum validation for resource types
  - Improved error handling and logging
  - Used Prisma's `in` filter for handling multiple types correctly

- ✅ Documentation updates (Completed August 3, 2025)
  - Updated service architecture documentation
  - Revised environment variables documentation
  - Enhanced schema alignment strategy documentation
  - Updated feature documentation for reservations
  - Updated project roadmap to reflect current status

- ✅ Shared database approach (Completed August 3, 2025)
  - Both services now use the same PostgreSQL database
  - Consistent port configuration (5433) for database access
  - Improved tenant middleware for development mode

## Completed Features

### Core Functionality
- ✅ Basic CRUD operations for all entities (customers, pets, services, resources)
- ✅ Reservation management with status workflow
- ✅ Kennel management with occupancy tracking
- ✅ Calendar integration with FullCalendar
- ✅ Pet vaccination status tracking
- ✅ Service duration-based reservation end time calculation
- ✅ Kennel calendar implementation
- ✅ Form improvements and accessibility enhancements

### Enhanced User Experience
- ✅ Staff scheduling and availability management
- ✅ Standardized time format display (12-hour format with AM/PM)
- ✅ Unique order number system for reservations (RES-YYYYMMDD-001 format)

### Business Operations
- ✅ Invoicing and payment processing
  - Invoice generation for reservations
  - Payment tracking and history
  - Invoice details view with line items
  - Tax calculations with configurable tax rate (7.44%)
- ✅ Reporting and analytics dashboard (Implemented May 12, 2025)
- ✅ Service and add-on revenue reporting (Implemented May 12, 2025)
- ✅ Customer value tracking and reporting (Implemented May 12, 2025)
- ✅ Configurable settings (e.g., tax rates)
- ✅ Customer accounts with balance and payment history
- ✅ Sales add-ons and upselling features

## Analytics & Reporting Notes

- Revenue totals come from invoices, not reservations. Totals sum `Invoice.total` filtered by `issueDate` and `status` not in `CANCELLED`/`REFUNDED`. See `services/customer/src/controllers/analytics.controller.ts` (`getDashboardSummary()`, `getSalesByService()`).
- To see revenue in reports, create invoices for reservations via the UI (New Order) or `POST /api/invoices` in customer-service. Linking `reservationId` is recommended.
- Add-on revenue requires reservation add-ons and invoices associated to those reservations; analytics reads add-on amounts from `reservation.addOnServices` on the invoice’s reservation.
- Time-period filters use `getDateFilter()` with day/week/month/year/all/custom and operate on invoice `issueDate`.
- Counts by service/add-on include only currently active items.
### Infrastructure
- ✅ Microservices architecture implementation (Completed August 2025)
  - Customer service (port 4004)
  - Reservation service (port 4003)
  - Frontend application (port 3000)
  - Shared PostgreSQL database (port 5433)
- ✅ Service communication via RESTful APIs (Completed August 2025)
- ✅ Tenant isolation middleware (Completed August 2025)

### Technical Improvements
- ✅ Schema alignment and consistency (Completed August 3, 2025)
- ✅ Code refactoring for maintainability and consistency (Ongoing)
- ✅ Documentation updates for implemented features (Completed August 3, 2025)

## Ongoing Refactoring Work

### Reservation Controller Refactoring 🔄 (In Progress)

**Objective:** Enhance the reservation controller with improved validation, error handling, and resource assignment

**Tasks:**
- Fix TypeScript errors in reservation controller
- Implement contextual validation for reservation fields
- Add robust resource assignment with conflict detection
- Enhance logging and error messages
- Ensure suite type is correctly handled based on service context
- Implement comprehensive date conflict validation

**Success Criteria:**
- Reservation creation works consistently across all service types
- Proper error messages are returned for invalid inputs
- Resource conflicts are properly detected and reported
- Suite type is correctly handled based on service context

### Documentation and Knowledge Transfer 🔄 (Partially Completed August 3, 2025)

**Completed Tasks:**
- ✅ Updated service architecture documentation with correct ports and shared database approach
- ✅ Revised environment variables documentation with proper database configuration
- ✅ Enhanced schema alignment strategy documentation with recent fixes
- ✅ Updated feature documentation for reservations and resource filtering
- ✅ Updated project roadmap to reflect current status and recent work
- ✅ Documented shared database approach and its benefits

**Remaining Tasks:**
- Update API documentation with all endpoints and parameters
- Create developer guides for common tasks
- Create troubleshooting guides for common issues
- Document performance considerations and best practices
- Create video walkthroughs for complex workflows

## Upcoming Features

### Enhanced User Experience
- 🔲 **Drag-and-drop reservation calendar** - Move reservations between dates/times/resources
- 🔲 **Multi-pet reservation selection** - Select multiple pets for a single reservation
- 🔲 **Optional add-ons workflow** - Make add-ons truly optional in order process
- 🔲 **Functional grooming calendar** - Fix and enhance grooming-specific calendar features
- 🔲 **Functional training calendar** - Fix and enhance training-specific calendar features
- 🔲 **Pet Icons Fix** - Fix broken or missing pet icons throughout the application
- 🔲 **Online Customer Booking Portal** - Self-service booking workflow for customers
  - Customer account creation and login
  - Browse available services and time slots
  - Select pets and add-ons
  - Real-time availability checking
  - Online payment processing
  - Booking confirmation and email notifications
  - Manage existing reservations
- 🔲 **Area-Specific Checklists** - Customizable checklists for different operational areas
  - Kennel check-in/check-out checklists
  - Grooming service checklists
  - Training session checklists
  - Daily facility checklists
  - Custom checklist templates
- 🔲 Batch operations for reservations (e.g., check-in multiple pets at once)
- 🔲 Advanced filtering and search capabilities
- 🔲 Email notifications for reservation status changes
- 🔲 Mobile-responsive design improvements
- 🔲 Dark mode support
- 🔲 Priority alerts for staff
- 🔲 Permission levels and restrictions for users
- 🔲 **Recent checkouts tracking** - Keep track of recent pet checkouts for staff reference

### Business Operations & Revenue
- 🔲 **CardConnect Payment Integration** - Integrated credit card processing
  - Real-time payment processing
  - PCI-compliant card storage
  - Recurring payment support
  - Payment reporting and reconciliation
  - Refund and void capabilities
- 🔲 **High Demand Pricing** - Dynamic pricing based on demand and capacity
  - Seasonal pricing rules
  - Peak time surcharges
  - Capacity-based pricing
  - Special event pricing
  - Automated price adjustments
- 🔲 **Retail Items & Packages** - Point of sale system for retail products and service packages
  - Inventory management
  - Product catalog
  - Package deals and bundles
  - Quick-sale items
  - Retail reporting
- 🔲 **Deposits & Wait-list Management** - Handle reservation deposits and waiting lists
- 🔲 **Standing Reservations** - Recurring/repeating reservation system
- 🔲 **Coupons & Discounts** - Comprehensive coupon and promotional code system
- 🔲 **Contracts Management** - Digital contract creation, signing, and storage
- 🔲 **Group Classes** - Multi-week group training classes with enrollment management
- 🔲 **Comprehensive Reports Page** - Advanced reporting system with multiple report types:
  - **Sales Reports**: Advanced sales analytics with flexible time period filtering
    - **Time Filters**: Day, week, month, month-to-date (if current month), year-to-date
    - **Year-over-Year Comparison**: Compare current period to same period last year
    - **Metrics**: Total sales, average transaction, sales by service type, payment methods
    - **Trending**: Growth rates, seasonal patterns, performance indicators
  - **Financial Reports**: Revenue, profit/loss, payment methods, outstanding balances
  - **Sales Tax Reports**: Comprehensive tax reporting for compliance and filing
    - **Monthly Tax Reports**: Month-by-month tax collection summaries
    - **Quarterly Tax Reports**: Quarterly tax totals for quarterly filing requirements
    - **Annual Tax Reports**: Year-end tax summaries for annual reporting
    - **Tax Breakdown**: Taxable vs. non-taxable sales, tax rates applied, exemptions
    - **Export Options**: Tax reports formatted for accounting software and tax filing
  - **Customer Reports**: Customer acquisition, retention rates, lifetime value, demographics, visit frequency
  - **Pet Reports**: Pet demographics, breed analysis, health tracking, service preferences
  - **Marketing Reports**: Campaign effectiveness, referral tracking, seasonal trends, promotional analysis
  - **Operational Reports**: Staff performance, resource utilization, booking patterns, capacity analysis
  - **Service Reports**: Popular services, add-on performance, pricing analysis, duration trends
  - **Custom Reports**: User-defined filters, date ranges, export capabilities (PDF, CSV, Excel)
- 🔲 Integration with merchant services
- 🔲 Inventory management for pet supplies
- 🔲 Automated reminders for upcoming appointments
- 🔲 Comprehensive loyalty rewards system
  - Points accumulation based on services
  - Tiered membership levels
  - Reward redemption options
  - Automated loyalty communications
- 🔲 Integration with accounting software
- 🔲 Staff performance metrics
- 🔲 Multi-location support

### Admin Settings & Configuration
- 🔲 **Vaccine Requirements Management** - Admin area to edit and configure required vaccines (multi-tenant support)
- 🔲 **System Configuration** - Enhanced admin settings for business rules and preferences
- 🔲 **Multi-tenant Vaccine Policies** - Different vaccine requirements per tenant/location

### Hardware Integration
- 🔲 **Collar/Name Tag Printer Integration** - Direct printing of pet collar tags and kennel cards
  - Zebra printer support
  - Custom tag templates
  - Batch printing capabilities
  - QR code integration for pet tracking
  - Kennel card printing
- 🔲 **Receipt Printer Integration** - Point of sale receipt printing
- 🔲 **Barcode/QR Code System** - Pet identification and tracking

### Advanced Features
- 🔲 Pet health monitoring and alerts
- 🔲 AI-powered recommendations for services
- 🔲 Customer feedback and review system
- 🔲 Mobile app for customers
- 🔲 Integration with third-party services (e.g., veterinary systems)
- 🔲 Automated marketing campaigns
- 🔲 Advanced business intelligence tools
- 🔲 API for third-party integrations
- 🔲 Embeddable widgets for customer websites

### Infrastructure and Scaling
- 🔲 **AWS Migration** - Complete migration to Amazon Web Services
  - EC2 instances for application servers
  - RDS for PostgreSQL database
  - S3 for file storage and backups
  - CloudFront CDN for static assets
  - Route 53 for DNS management
  - Load balancing and auto-scaling
  - VPC configuration and security groups
  - CloudWatch monitoring and alerting
- 🔲 **Data Migration Tools** - Import from other pet management systems
  - Gingr import tool with field mapping
  - Generic CSV import with validation
  - Data transformation and cleanup
  - Duplicate detection and merging
  - Import history and rollback
  - Bulk data validation tools
- 🔲 Cloud infrastructure optimization
- 🔲 Website integration components for customer online ordering
- 🔲 Global content delivery network (CDN)
- 🔲 Automated deployment pipelines
- 🔲 High-availability configuration
- 🔲 Disaster recovery planning

## Planned Refactoring Work

### Performance Optimization ⏱️ (Planned)

**Objective:** Improve API response times and database query efficiency

**Tasks:**
- Add database indexes for frequently queried fields
- Implement query optimization for availability checks
- Add caching for resource availability results
- Optimize batch operations for multiple resources
- Implement pagination for large result sets
- Add query performance logging and monitoring

### Testing Infrastructure ⏱️ (Planned)

**Objective:** Implement comprehensive testing for the reservation service

**Tasks:**
- Create unit tests for controllers and utilities
- Implement integration tests for API endpoints
- Add schema validation tests
- Create test fixtures for different database states
- Implement CI/CD pipeline for automated testing
- Add code coverage reporting

### Frontend Integration ⏱️ (Planned)

**Objective:** Ensure frontend components work seamlessly with the refactored backend

**Tasks:**
- Update frontend API service to handle new response formats
- Enhance error handling in frontend components
- Implement retry logic for transient errors
- Add loading states for asynchronous operations
- Update form validation to match backend requirements
- Implement comprehensive end-to-end testing

## Technical Debt and Improvements

Throughout all phases, we will address the following ongoing concerns:

- 🔲 Comprehensive test coverage (unit, integration, and end-to-end tests)
- 🔲 Performance optimization for large datasets
- 🔲 Security audits and improvements
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

## Bug Fixes

### Recent Fixes (August 2025)
- ✅ Fixed resource filtering to correctly handle multiple resource types (Fixed August 3, 2025)
- ✅ Fixed Prisma schema mismatches between customer and reservation services (Fixed August 3, 2025)
- ✅ Fixed field name inconsistencies (`birthdate` vs `age` in Pet model) (Fixed August 3, 2025)
- ✅ Removed references to non-existent `organizationId` field (Fixed August 3, 2025)
- ✅ Fixed database connection issues by using consistent port 5433 (Fixed August 3, 2025)
- ✅ Kennel calendar now loads all ~165 suites by paginating `/api/resources` via `resourceService.getSuites()` (Fixed August 10, 2025)
- ✅ Reservations UI updated to parse nested response `{ data: { reservations: [...] }, pagination }` and render safely (Fixed August 10, 2025)
- ✅ Reservation-service now includes the `service` relation in all reservation responses (list/get/create/update); frontend displays service name instead of 'Unknown' (Fixed August 10, 2025)

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

### New Issues Identified (September-October 2025)
- 🔲 **Multi-Pet Selection**: When creating new reservation, can't select multiple pets at the same time
- 🔲 **Optional Add-Ons**: Suggested add-ons need to be optional - currently no way to continue without an add-on in cart
- ✅ **Pet Icons**: Pet icons are broken or missing throughout the application (Fixed October 20, 2025)
  - Added petIcons and iconNotes fields to database schema
  - Fixed tenantId filtering in getAllPets and getAllCustomers controllers
  - All APIs now returning data correctly with multi-tenant support
- 🔲 **Grooming Calendar**: Grooming calendar is currently non-functional
- 🔲 **Training Calendar**: Training calendar is currently non-functional

## Implementation Timeline

### Phase 1: Critical Bug Fixes (October 2025 - Week 1-2)
| Feature/Task | Status | Estimated Completion | Priority | Effort |
|--------------|--------|---------------------|----------|--------|
| Multi-Pet Selection Bug Fix | 🔲 Planned | October 25, 2025 | Critical | 2-3 days |
| Optional Add-Ons Bug Fix | 🔲 Planned | October 25, 2025 | Critical | 1-2 days |
| Pet Icons Fix | ✅ **COMPLETED** (Oct 20, 2025) | - | High | 1 day |
| Grooming Calendar Fix | 🔲 Planned | October 30, 2025 | High | 2-3 days |
| Training Calendar Fix | 🔲 Planned | October 30, 2025 | High | 2-3 days |

### Phase 2: Calendar & UX Enhancements (November 2025 - Week 1-2)
| Feature/Task | Status | Estimated Completion | Priority | Effort |
|--------------|--------|---------------------|----------|--------|
| Drag-and-Drop Calendar | 🔲 Planned | November 8, 2025 | High | 1-2 weeks |
| Area-Specific Checklists | 🔲 Planned | November 15, 2025 | High | 1 week |

### Phase 3: Revenue & Payment Features (November 2025 - Week 3-4)
| Feature/Task | Status | Estimated Completion | Priority | Effort |
|--------------|--------|---------------------|----------|--------|
| CardConnect Integration | 🔲 Planned | November 22, 2025 | Critical | 1-2 weeks |
| Retail Items & POS | 🔲 Planned | November 29, 2025 | High | 2 weeks |
| High Demand Pricing | 🔲 Planned | December 6, 2025 | High | 1 week |

### Phase 4: Customer Portal & Booking (December 2025)
| Feature/Task | Status | Estimated Completion | Priority | Effort |
|--------------|--------|---------------------|----------|--------|
| Online Customer Booking Portal | 🔲 Planned | December 20, 2025 | Critical | 3-4 weeks |
| Customer Account Management | 🔲 Planned | December 20, 2025 | High | Included |
| Email Notifications | 🔲 Planned | December 20, 2025 | High | 1 week |

### Phase 5: Hardware & Operations (January 2026)
| Feature/Task | Status | Estimated Completion | Priority | Effort |
|--------------|--------|---------------------|----------|--------|
| Collar/Name Tag Printing | 🔲 Planned | January 10, 2026 | High | 1-2 weeks |
| Comprehensive Reports Page | 🔲 Planned | January 24, 2026 | High | 2 weeks |
| Vaccine Requirements Admin | 🔲 Planned | January 31, 2026 | Medium | 1 week |

### Phase 6: Infrastructure & Migration (February-March 2026)
| Feature/Task | Status | Estimated Completion | Priority | Effort |
|--------------|--------|---------------------|----------|--------|
| AWS Migration Planning | 🔲 Planned | February 7, 2026 | Critical | 1 week |
| AWS Infrastructure Setup | 🔲 Planned | February 21, 2026 | Critical | 2 weeks |
| AWS Deployment & Testing | 🔲 Planned | March 7, 2026 | Critical | 2 weeks |
| Production Cutover | 🔲 Planned | March 14, 2026 | Critical | 1 week |

### Phase 7: Data Migration & Integration (March-April 2026)
| Feature/Task | Status | Estimated Completion | Priority | Effort |
|--------------|--------|---------------------|----------|--------|
| Gingr Import Tool | 🔲 Planned | March 28, 2026 | High | 2 weeks |
| Generic CSV Import | 🔲 Planned | April 11, 2026 | Medium | 1 week |
| Data Validation Tools | 🔲 Planned | April 18, 2026 | Medium | 1 week |

### Phase 8: Additional Features (April-June 2026)
| Feature/Task | Status | Estimated Completion | Priority | Effort |
|--------------|--------|---------------------|----------|--------|
| Deposits & Wait-list | 🔲 Planned | April 30, 2026 | Medium | 2 weeks |
| Standing Reservations | 🔲 Planned | May 15, 2026 | Medium | 2 weeks |
| Coupons System | 🔲 Planned | May 30, 2026 | Medium | 2 weeks |
| Group Classes Enhancement | 🔲 Planned | June 15, 2026 | Medium | 2 weeks |
| Contracts Management | 🔲 Planned | June 30, 2026 | Medium | 2 weeks |

## Monitoring and Evaluation

Throughout the development and refactoring projects, we will monitor the following metrics:

- API response times for critical endpoints
- Error rates for API requests
- Test coverage percentage
- Number of reported bugs
- User satisfaction with the reservation system

Regular reviews will be conducted to ensure the project is on track and meeting its objectives.

## Prioritization Criteria

Features and tasks will be prioritized based on:

1. Business value
2. User impact
3. Technical complexity
4. Dependencies
5. Resource availability
