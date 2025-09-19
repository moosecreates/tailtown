# Tailtown Pet Resort Management System

A modern, full-featured management system for pet resorts, providing comprehensive tools for reservations, customer management, and pet care services.

## Recent Updates (September 2025)

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
- **Simplified Logic**: Replaced overly complex availability checking with direct reservation data queries
- **Real-Time Updates**: Calendar now properly refreshes after reservation creation
- **Add-On Integration**: Seamless add-on service selection workflow during reservation creation

#### Backend API Stabilization
- **Database Schema Alignment**: Both services now use identical, correct Prisma schemas
- **Field Validation**: Removed references to non-existent database fields (cutOffDate, organizationId)
- **Type Safety**: Enhanced TypeScript type definitions and null checking
- **Error Handling**: Improved error messages and graceful fallbacks
- **Service Reliability**: Stable microservices architecture with proper tenant middleware

#### Technical Improvements
- **Prisma Client Regeneration**: Automated schema synchronization between services
- **Date Handling**: Fixed timezone issues in calendar date comparisons
- **API Response Formats**: Standardized response structures across all endpoints
- **Logging Enhancement**: Added detailed debugging information for troubleshooting
- **Performance Optimization**: Streamlined database queries and reduced complexity

### Current System Status
- ✅ **Frontend** (port 3000): Fully functional with working calendar and analytics
- ✅ **Customer Service** (port 4004): Analytics and customer management working correctly
- ✅ **Reservation Service** (port 4003): Reservation creation and calendar display working
- ✅ **Database**: PostgreSQL with synchronized schemas and accurate data
- ✅ **All Core Features**: Reservation creation, calendar display, analytics, and customer management

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
- Maintenance scheduling
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

   # Backend
   cd ../services/customer
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env

   # Backend
   cp services/customer/.env.example services/customer/.env
   ```

4. Start the development servers:
   ```bash
   # Terminal 1: Backend
   cd services/customer
   npm run dev

   # Terminal 2: Frontend
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
