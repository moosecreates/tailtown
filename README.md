# Tailtown Pet Resort Management System

![CI Status](https://github.com/moosecreates/tailtown/workflows/Continuous%20Integration/badge.svg)
![Frontend Tests](https://github.com/moosecreates/tailtown/workflows/Frontend%20Tests/badge.svg)

A modern, full-featured management system for pet resorts, providing comprehensive tools for reservations, customer management, and pet care services.

## Recent Updates (October 2025)

### ✅ NEW: Check-In Workflow & Template Management (October 23, 2025)

**Status**: ✅ Fully functional - Template editing now working correctly!

#### Feature Overview
- **Complete Check-In System**: Full 5-step check-in workflow for boarding reservations
- **Admin Template Manager**: Configure check-in questionnaires without code changes
- **Pre-populated Options**: Manage medication methods and common belongings
- **Flexible Configuration**: Set fields as required/optional, add custom questions
- **Template Editing**: Create, edit, and manage check-in templates with full CRUD support

#### Check-In Workflow Features
1. **Step 1: Questionnaire** - Dynamic questions from templates (contact info, feeding, medical)
2. **Step 2: Medications** - Track medications with dosage, frequency, and administration method
3. **Step 3: Belongings** - Inventory personal items with quick-add buttons
4. **Step 4: Service Agreement** - Digital signature capture for boarding agreement
5. **Step 5: Review & Complete** - Summary and final submission

#### Admin Configuration Interface
- **Template Editor**: Create/edit check-in templates with sections and questions
- **Question Types**: Text, Long Text, Yes/No, Multiple Choice, Time, Date
- **Required/Optional**: Control validation for each field
- **Pre-populated Options Manager**:
  - Medication Methods: Oral, Topical, Injection, Eye Drops, Ear Drops, Other
  - Common Belongings: Collar, Leash, Toy, Bedding, Food, Bowl, Medication, Treats
- **Access**: Settings → Check-In Templates or `/admin/check-in-templates`

#### Technical Implementation
- **Frontend**: React components with Material-UI, signature pad integration
- **Backend**: Prisma models for templates, check-ins, medications, belongings
- **Database**: PostgreSQL with shared database pattern
- **API Endpoints**: RESTful API with `/api` prefix for all operations
- **Automated Tests**: Comprehensive test coverage for API endpoints

#### Quick Start
```bash
# Access check-in for a reservation
/check-in/:reservationId

# Configure templates (Admin)
Settings → Check-In Templates
```

**Documentation**: See [Database Setup Guide](docs/operations/database-setup.md) for schema synchronization and seeding instructions.

---

### 🤖 NEW: MCP RAG Server for AI-Enhanced Development (October 22, 2025)

#### Feature Overview
- **AI-Powered Code Search**: Semantic search across entire Tailtown codebase using RAG (Retrieval-Augmented Generation)
- **Windsurf/Cascade Integration**: Fully integrated MCP (Model Context Protocol) server for AI assistant capabilities
- **297 Files Indexed**: Complete indexing of code, documentation, schemas, and configuration files
- **Real-Time Search**: Sub-100ms semantic search with relevance scoring

#### Capabilities
1. **Semantic Code Search**: Find code by concept, not just keywords
2. **Documentation Lookup**: Instant access to all technical documentation
3. **Schema Reference**: Query database models and relationships
4. **File Context Retrieval**: Get full file contents on demand
5. **Dynamic Reindexing**: Rebuild index when codebase changes

#### Technical Implementation
- **Python-Based MCP Server**: Custom server using Model Context Protocol
- **FAISS Vector Database**: Efficient similarity search with low memory footprint
- **Sentence Transformers**: all-MiniLM-L6-v2 model for embeddings
- **Four MCP Tools**: search_codebase, get_file_context, list_indexed_files, reindex

#### Indexed Content
- **223 Code Files**: TypeScript/JavaScript (frontend + backend services)
- **67 Documentation Files**: All markdown documentation
- **5 Configuration Files**: package.json files
- **2 Schema Files**: Prisma database schemas

#### Quick Start
```bash
# Install dependencies
cd mcp-server
pip install -r requirements.txt

# Configure in Windsurf
# Edit ~/.codeium/windsurf/mcp_config.json
# See mcp-server/README.md for full configuration

# Test search
mcp0_search_codebase({
  query: "reservation creation process",
  filter_type: "code",
  max_results: 5
})
```

**Documentation**: See [MCP Server README](mcp-server/README.md) for complete setup and usage instructions.

---

### ✅ LATEST FIX: Grooming Reservation Service Startup (October 21, 2025)

#### Issue Resolved
- **Problem**: Grooming calendar unable to load reservations, showing `ERR_CONNECTION_REFUSED` errors
- **Root Cause**: Reservation service (port 4003) was not running while frontend and customer service were operational
- **Impact**: Grooming calendar completely non-functional, unable to view or create reservations

#### Technical Solution Implemented
1. **Service Status Verification**: Identified that reservation service had stopped
2. **Port Conflict Resolution**: Cleared misleading `EADDRINUSE` errors
3. **Clean Service Restart**: Started reservation service with explicit PORT configuration
4. **Health Check Verification**: Confirmed all services operational and communicating properly

#### Result
- ✅ **Reservation Service**: Running on port 4003 with database connectivity
- ✅ **Grooming Calendar**: Fully functional with reservation loading and creation
- ✅ **API Endpoints**: All reservation endpoints responding correctly with tenant support
- ✅ **Service Category Filtering**: Proper filtering of grooming vs boarding/daycare reservations

#### Quick Service Startup Reference
```bash
# Check service status
lsof -i :3000  # Frontend
lsof -i :4003  # Reservation service
lsof -i :4004  # Customer service

# Start reservation service
cd services/reservation-service
source ~/.nvm/nvm.sh && PORT=4003 npm run dev

# Verify health
curl http://localhost:4003/health
```

**Documentation**: See [Service Startup Troubleshooting Guide](docs/troubleshooting/SERVICE-STARTUP-GUIDE.md) for comprehensive service management instructions.

---

## Recent Updates (September 2025)

### ✅ Reservation Edit Form Data Loading (September 23, 2025)

#### Issue Resolved
- **Problem**: Reservation edit form fields were not pre-populating when clicking on existing reservations in the calendar
- **Root Cause**: The availability API was returning incomplete reservation data (missing `customerId`, `petId`, `serviceId`)
- **Impact**: Staff couldn't edit existing reservations effectively, requiring manual re-entry of all data

#### Technical Solution Implemented
1. **Enhanced Data Fetching**: Added `fetchCompleteReservation()` function to retrieve full reservation data
2. **API Endpoint Fix**: Corrected API endpoint URL from `/reservations/` to `/api/reservations/`
3. **Response Structure Handling**: Added proper extraction of nested reservation data from API response
4. **Fallback Logic**: Implemented graceful fallback to incomplete data if complete fetch fails

#### Code Changes
- **File**: `/frontend/src/components/calendar/KennelCalendar.tsx`
- **New Function**: `fetchCompleteReservation()` - Fetches complete reservation data by ID
- **Enhanced Function**: `handleCellClick()` - Now async and fetches complete data before opening form
- **API Integration**: Uses correct reservation service endpoint with proper response parsing

#### Result
- ✅ **Form Pre-population**: All fields now populate correctly (customer, pet, service, dates, status)
- ✅ **Complete Data**: Full reservation data with all required IDs available for editing
- ✅ **Seamless UX**: Staff can now click any reservation and immediately see all details
- ✅ **Error Handling**: Graceful fallback ensures form still opens even if complete data fetch fails

### 🎉 MAJOR MILESTONE: Complete Order System Implementation

#### End-to-End Order Processing
- **Complete Order Workflow**: Full 5-step order process from customer selection to payment processing
- **Customer Search & Selection**: Fixed CORS issues and tenant ID handling for seamless customer lookup
- **Pet Selection**: Automatic pet loading based on selected customer
- **Service Selection**: Dynamic service catalog with real-time pricing
- **Add-On Services**: Comprehensive add-on selection with quantity and pricing
- **Invoice Generation**: Automatic invoice creation with line items, tax calculation, and totals
- **Payment Processing**: Complete payment workflow with multiple payment methods
- **Order Completion**: Full order lifecycle with proper status tracking

#### Order System Features
- **5-Step Wizard Interface**: Intuitive step-by-step order creation process
  1. Customer Information - Search and select customer and pet
  2. Reservation Details - Service selection, dates, and resource assignment
  3. Add-On Services - Optional service add-ons with pricing
  4. Review Invoice - Complete invoice preview with itemized breakdown
  5. Process Payment - Payment method selection and processing
- **Real-Time Validation**: Date validation, service availability, and conflict detection
- **Dynamic Pricing**: Automatic price calculation with tax, discounts, and add-ons
- **Smart Date Handling**: Automatic end date adjustment to prevent validation errors
- **Resource Assignment**: Automatic resource allocation with conflict prevention
- **Invoice Integration**: Seamless invoice creation and payment tracking

#### Technical Fixes Applied
- **CORS Configuration**: Fixed customer and reservation service CORS to allow all required headers
- **Tenant ID Handling**: Proper tenant ID middleware and header management
- **Date Validation**: Fixed "start date must be before end date" validation errors
- **Response Format Handling**: Enhanced API response parsing for different response formats
- **Error Handling**: Comprehensive error messages and user feedback
- **Service Integration**: Seamless integration between customer, reservation, and invoice services

### 🎉 Major System Fixes and Improvements

#### Analytics Dashboard Overhaul
- **Fixed $0 Revenue Display**: Analytics now show accurate revenue data based on selected time periods
- **Period-Based Filtering**: Dashboard correctly filters data by month, year, or all-time
- **Real Data Integration**: Replaced mock data with actual database queries
- **Helpful Messaging**: Clear indicators when no data exists for current period with guidance to view historical data
- **Current Status**: All analytics endpoints working with accurate financial data

#### Reservation System Enhancements
- **Schema Synchronization**: Fixed Prisma schema mismatches between customer and reservation services
- **Calendar Display Fix**: Resolved complex calendar logic that prevented reservations from displaying
- **Kennel Management Fix**: Fixed availability display in Kennel Management page to show accurate occupancy
- **Unified Data Logic**: Both Calendar and Kennel Management now use consistent reservation data
- **Simplified Logic**: Replaced overly complex availability checking with direct reservation data queries
- **Real-Time Updates**: Calendar and kennel board now properly refresh after reservation creation
- **Add-On Integration**: Seamless add-on service selection workflow during reservation creation

#### Backend API Stabilization
- **Database Schema Alignment**: Both services now use identical, correct Prisma schemas
- **Field Validation**: Removed references to non-existent database fields (cutOffDate, organizationId)
- **Type Safety**: Enhanced TypeScript type definitions and null checking
- **Error Handling**: Improved error messages and graceful fallbacks
- **Service Reliability**: Stable microservices architecture with proper tenant middleware

#### Navigation and User Experience Improvements
- **Navigation Reorganization**: Moved administrative functions to centralized Admin panel
- **Analytics Rebranding**: Renamed "Analytics" to "Reports" for better user understanding
- **Admin Panel Redesign**: Modern card-based interface for administrative functions
- **Streamlined Main Navigation**: Focused on daily operational tasks
- **Role-Based Organization**: Clear separation between operations and administration

#### Technical Improvements
- **Prisma Client Regeneration**: Automated schema synchronization between services
- **Date Handling**: Fixed timezone issues in calendar date comparisons
- **API Response Formats**: Standardized response structures across all endpoints
- **Logging Enhancement**: Added detailed debugging information for troubleshooting
- **Performance Optimization**: Streamlined database queries and reduced complexity

### Current System Status
- ✅ **Frontend** (port 3000): Fully functional with complete order system and improved UX
- ✅ **Customer Service** (port 4004): Customer management, invoicing, and payment processing working correctly
- ✅ **Reservation Service** (port 4003): Complete reservation system with enhanced data retrieval
- ✅ **Database**: PostgreSQL with synchronized schemas and comprehensive financial data
- ✅ **Order System**: Complete end-to-end order processing from customer selection to payment
- ✅ **Invoice & Payment System**: Full invoice generation and payment tracking with detailed financial reporting
- ✅ **Navigation**: Streamlined main navigation with centralized Admin panel
- ✅ **All Core Features**: Complete order processing, reservation management, calendar display, kennel management, financial reporting, and administration

## Navigation Structure

### Main Navigation (Daily Operations)
- **Dashboard**: Overview of daily activities and key metrics
- **Boarding & Daycare**: Main calendar view for boarding and daycare services with integrated booking
- **Grooming**: Specialized grooming calendar and appointments with integrated scheduling
- **Training**: Training session calendar and scheduling with integrated booking
- **Customers**: Customer profiles and contact management
- **Pets**: Pet profiles with medical history and records
- **Kennels**: Kennel board and suite management with sub-navigation:
  - Kennel Board: Real-time suite availability and occupancy
  - Print Kennel Cards: Generate physical kennel identification cards
- **Reports**: Business analytics and reporting with sub-navigation:
  - All Reports: Comprehensive reporting system with 8 categories
  - Sales Dashboard: Revenue and performance metrics
  - Customer Value: Customer lifetime value analysis

### Temporarily Hidden (Being Integrated into Calendar)
- **Reservations**: Booking management (functionality moving to calendar views)
- **New Order**: Order processing (functionality moving to calendar-based booking)

### Admin Panel (Administrative Functions)
- **Services**: Manage boarding, daycare, grooming, and training services
- **Resources**: Manage suites, equipment, and facility resources
- **Staff Scheduling**: Employee schedules and work assignments
- **Users**: Employee accounts and permissions management
- **Marketing**: SMS and email marketing campaigns
- **Check-In Templates**: Configure check-in questionnaires and pre-populated options
- **Price Rules**: Discount rules and pricing policies
- **General Settings**: System configuration and preferences

## Features

### Customer Management
- Customer profiles with contact information
- Pet profiles with medical history, vaccination records
- Multiple pets per customer
- Document storage for forms and agreements

### Reservation System
- Interactive calendar interface
- Real-time availability checking
- Multiple service types (daycare, boarding, grooming)
- Color-coded reservation status
- Drag-and-drop scheduling
- Specialized kennel grid calendar for boarding and daycare
- Compact view for efficient kennel management
- Seamless add-on service selection workflow
- Consistent reservation experience across all service types
- Unique order number system for easy reference (format: RES-YYYYMMDD-001)
- Comprehensive add-on services management

### Check-In System
- 5-step check-in workflow for boarding reservations
- Dynamic questionnaire from configurable templates
- Medication tracking with administration methods
- Personal belongings inventory with quick-add buttons
- Digital service agreement with signature capture
- Complete check-in summary and review
- Admin template manager for customization
- Pre-populated options configuration

### Invoicing and Payments
- Automatic invoice generation for reservations
- Detailed invoice view with line items
- Service and add-on itemization
- Configurable tax rate (7.44%)
- Payment tracking and history
- Customer account balance management
- Invoice status tracking (draft, sent, paid, etc.)

### Environment Setup
- Each service has its own `.env` file in its respective directory
- Frontend environment file: `/frontend/.env`
- Reservation service environment file: `/services/reservation-service/.env`
  - **Critical**: `DATABASE_URL` must be set to port 5433 for the reservation service to connect to PostgreSQL
- Customer service environment file: `/services/customer/.env`
- Key environment variables:
  - `DATABASE_URL`: PostgreSQL connection string (format: `postgresql://username:password@localhost:5433/customer?schema=public`)
  - `PORT`: Service port number (4004 for customer service, 4003 for reservation service)
  - `NODE_ENV`: Environment mode (development, test, production)
  - `JWT_SECRET`: Secret key for authentication
- **Shared Database Approach**: Both customer and reservation services use the same PostgreSQL database
  - Prisma schemas must be synchronized between services to avoid runtime errors
  - Field names must be consistent across services (e.g., `birthdate` not `age` for Pet model)
- For a complete list of all environment variables and their descriptions, see our detailed [Environment Variables Documentation](./docs/Environment-Variables.md)
- For service architecture and port assignments, see our [Service Architecture Documentation](./docs/architecture/SERVICE-ARCHITECTURE.md)

### Service Management
- Customizable service catalog
- Service duration and capacity settings
- Pricing management with dynamic price rules
- Flexible discount system (percentage or fixed amount)
- Resource allocation

### Resource Management
- Track kennels, rooms, and equipment
- Occupancy tracking with backend validation
- Resource conflict prevention
- Backend API for resource availability checking with support for multiple type filtering
  - Filter resources by one or more types (e.g., `STANDARD_SUITE`, `LUXURY_SUITE`)
  - Robust validation and error handling for resource type parameters
- Multi-tenant support for all resource operations

### Staff Management
- Staff profiles with contact information
- Enhanced scheduling with compact time display
- Starting location assignment for shifts
- Time-off requests and approval workflow
- Performance tracking

### Settings & Configuration
- Centralized system settings
- User management
- Price rules configuration
- System-wide preferences

## Technology Stack

### Frontend
- React with TypeScript
- Material-UI for components
- FullCalendar for scheduling
- JWT authentication
- Responsive design

### Backend
- Express.js with TypeScript
- Prisma ORM
- PostgreSQL database
- RESTful API architecture
- JWT-based authentication
- Graceful error handling for schema mismatches

## Development Guidelines

### Schema Alignment and Database Migration
We've implemented a comprehensive approach to handle Prisma schema mismatches and database migrations:

#### Schema Alignment Strategy
- Backend controllers use defensive programming to handle missing tables/fields
- Raw SQL queries with try/catch blocks for tables that may not exist in all environments
- Graceful fallbacks to empty arrays or default values when schema elements are missing
- TypeScript type safety with explicit typing for raw query results

#### Schema Validation System
- Comprehensive schema validation on service startup
- Detailed reporting of missing tables, columns, indexes, and relationships
- Automatic generation of SQL migration scripts to fix schema issues
- Optional automatic migration capability for development environments
- Clear guidance and recommendations for resolving schema mismatches
- Two-step approach for Prisma operations with type compatibility issues (see TypeScript Improvements)

#### Database Migration Tools
- Raw SQL migration scripts for creating critical tables and columns
- Migration runner script with error handling and transaction support
- Database connection test utility to diagnose connectivity issues

#### TypeScript Improvements
- Enhanced module resolution configuration for better import handling
- Fixed type compatibility issues between extended and standard Prisma input types
- Implemented defensive programming patterns for TypeScript type safety

#### Test Improvements
- Implemented robust testing patterns for controllers with proper mocking
- Fixed circular dependency issues in test files
- Created comprehensive test coverage for all CRUD operations
- Documented test patterns in a detailed Testing Guide
- Improved test reliability with consistent mocking and assertions
- Detailed documentation in `services/reservation-service/docs/TYPESCRIPT-FIXES.md`
- Detailed schema validation reporting on service startup

This approach ensures the API remains stable even when the schema evolves or differs between environments. For detailed migration instructions, see our [Database Migration Guide](./services/reservation-service/DATABASE-MIGRATION.md).

### API Service Layer
We've implemented a shared API service layer to ensure consistency across all microservices as we transition to a domain-driven architecture. The API layer provides:
- Standardized API response formats
- Multi-tenancy support via middleware
- Consistent error handling
- Request validation with Zod
- Service factory for quick bootstrapping

See [API Service Layer Documentation](./docs/architecture/API-SERVICE-LAYER.md) for implementation details and migration guidelines.

### Data Modeling Strategy
We've adopted a balanced approach to data modeling that maintains domain boundaries while optimizing for performance at scale. Key strategies include:
- Keeping core domain models properly normalized
- Creating specialized read models for performance-critical operations
- Strategic denormalization for common query patterns
- Optimized indexing strategy for multi-tenant queries
- Partitioning approach for time-series data like reservations

See [Data Modeling Strategy](./docs/architecture/DATA-MODELING-STRATEGY.md) for the complete approach and implementation guidelines.

## Documentation

We follow a standardized documentation structure to ensure consistency and ease of navigation:

### Project-wide Documentation

- **Main Documentation**
  - [Current State](./docs/CURRENT_STATE.md) - Overview of the current system state and features
  - [Roadmap](./docs/ROADMAP.md) - Comprehensive development and refactoring plans
  - [Documentation Guide](./docs/README.md) - Guide to all project documentation

- **Architecture Documentation** (`/docs/architecture/`)
  - [Architecture Overview](./docs/architecture/Architecture.md) - System architecture overview
  - [API Service Layer](./docs/architecture/API-SERVICE-LAYER.md) - API service layer design
  - [SaaS Implementation Progress](./docs/architecture/SaaS-Implementation-Progress.md) - Progress on SaaS implementation
  - [Service Architecture](./docs/architecture/SERVICE-ARCHITECTURE.md) - Microservice architecture documentation
  - [Data Modeling Strategy](./docs/architecture/DATA-MODELING-STRATEGY.md) - Database design principles

- **Development Guidelines** (`/docs/development/`)
  - [Form Guidelines](./docs/development/FormGuidelines.md) - UI form standards and patterns
  - [Schema Alignment Strategy](./docs/development/SchemaAlignmentStrategy.md) - Database schema management
  - [Express Route Ordering](./docs/development/ExpressRouteOrderingBestPractices.md) - Best practices for Express.js routes
  - [Staff Scheduling Implementation](./docs/development/StaffSchedulingImplementation.md) - Staff scheduling features

- **Feature Documentation** (`/docs/features/`)
  - [Kennel Calendar](./docs/features/KennelCalendar.md) - Kennel calendar implementation
  - [Reservations](./docs/features/Reservations.md) - Reservation system details
  - [Add-On System](./docs/features/AddOnSystem.md) - Service add-on implementation
  - [Checkout Process](./docs/features/CheckoutProcess.md) - End-to-end checkout workflow

- **Operations Documentation** (`/docs/operations/`)
  - [Environment Variables](./docs/operations/Environment-Variables.md) - Environment configuration
  - [Disaster Recovery Plan](./docs/operations/DISASTER-RECOVERY-PLAN.md) - Comprehensive disaster recovery procedures
  - [DevOps](./docs/operations/DevOps.md) - Deployment and operations guide
  - [Setup Guide](./docs/operations/SETUP.md) - Comprehensive setup instructions for development

- **Changelog** (`/docs/changelog/`)
  - [Changelog](./docs/changelog/CHANGELOG.md) - Comprehensive release notes and change history
  - [Kennel Selection Fix](./docs/changelog/2025-05-11-kennel-selection-fix.md) - Specific fix documentation

### Service-specific Documentation

- **Reservation Service** (`/services/reservation-service/docs/`)
  - [Testing Guide](./services/reservation-service/docs/TESTING-GUIDE.md) - Testing patterns and best practices
  - [TypeScript Fixes](./services/reservation-service/docs/TYPESCRIPT-FIXES.md) - TypeScript improvements
  - [Date Conflict Validation](./services/reservation-service/docs/DATE-CONFLICT-VALIDATION.md) - Reservation conflict detection
  - [Database Migration](./services/reservation-service/docs/DATABASE-MIGRATION.md) - Database migration procedures
  - [Schema Alignment](./services/reservation-service/docs/README-SCHEMA-ALIGNMENT.md) - Schema alignment for reservation service
  - [Legacy Roadmap](./docs/ROADMAP-LEGACY.md) - Previous development roadmap (see Roadmap for current plans)
  - [Legacy Refactoring Roadmap](./services/reservation-service/docs/REFACTORING-ROADMAP.md) - Previous refactoring roadmap (see Roadmap for current plans)

## Project Structure

```
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript interfaces
│   │   └── contexts/       # React contexts
│   
├── services/
│   ├── customer/           # Customer service (port 4004)
│   │   ├── src/
│   │   │   ├── controllers/  # Route handlers
│   │   │   ├── routes/       # API routes
│   │   │   ├── middleware/   # Express middleware
│   │   │   └── prisma/       # Database schema
│   │
│   └── reservation-service/ # Reservation service (port 4003)
│       ├── src/
│       │   ├── controllers/  # Route handlers
│       │   ├── routes/       # API routes
│       │   ├── middleware/   # Express middleware
│       │   ├── utils/        # Utility functions
│       │   └── prisma/       # Database schema
│       ├── docs/            # Service documentation
│       └── tests/           # Test files
│
└── docs/                   # Project documentation
    ├── architecture/       # Architecture documentation
    ├── features/           # Feature documentation
    └── development/        # Development guides
```

## Development Setup

### Prerequisites
- Node.js >= 16.x
- npm >= 8.x
- PostgreSQL >= 13

### Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/moosecreates/tailtown.git
   cd tailtown
   ```

2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Customer Service
   cd ../services/customer
   npm install

   # Reservation Service
   cd ../reservation-service
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env

   # Customer Service
   cp services/customer/.env.example services/customer/.env

   # Reservation Service
   cp services/reservation-service/.env.example services/reservation-service/.env
   ```

4. Start the development servers:
   ```bash
   # Terminal 1: Customer Service
   cd services/customer
   npm run dev

   # Terminal 2: Reservation Service
   cd services/reservation-service
   npm run dev

   # Terminal 3: Frontend
   cd frontend
   npm start
   ```

### Available URLs
- Frontend: http://localhost:3000
- Customer Service API: http://localhost:4004
- Reservation Service API: http://localhost:4003
- Health Check Endpoints:
  - Customer Service: http://localhost:4004/health
  - Reservation Service: http://localhost:4003/health

## API Documentation

### Base URL
All API endpoints are prefixed with `/api`

### Authentication
- All routes except login require JWT authentication
- Token should be included in Authorization header:
  ```
  Authorization: Bearer <token>
  ```

### Response Format
All responses follow the format:
```json
{
  "status": "success" | "error",
  "data": <response_data>,
  "results": <number_of_items>,
  "totalPages": <total_pages>,
  "currentPage": <current_page>
}
```

## Contributing

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Follow the coding standards:
   - Use TypeScript
   - Follow ESLint rules
   - Keep files under 300 lines
   - Add JSDoc comments for complex functions
   - Write unit tests for new features

3. Submit a pull request

## File Storage

### Local File Storage
The application currently uses local file storage for uploaded files:
- Upload directory: `services/customer/uploads/`
- Supported file types: JPEG, PNG, GIF, PDF
- File size limit: 5MB
- Directory structure:
  ```
  uploads/
  ├── pets/         # Pet photos and documents
  ├── customers/    # Customer-related documents
  └── temp/         # Temporary file storage
  ```

### Production Considerations
- For production deployments, consider using a cloud storage solution (e.g., AWS S3)
- Ensure proper backup of the uploads directory
- Implement regular cleanup of the temp directory
- Monitor disk space usage

## License

Proprietary - All Rights Reserved
