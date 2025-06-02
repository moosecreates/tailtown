# Tailtown Pet Resort Management System

A modern, full-featured management system for pet resorts, providing comprehensive tools for reservations, customer management, and pet care services.

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
  - **Critical**: `DATABASE_URL` must be properly set for the reservation service to connect to PostgreSQL
- Customer service environment file: `/services/customer/.env`
- Key environment variables:
  - `DATABASE_URL`: PostgreSQL connection string (format: `postgresql://username:password@localhost:5432/tailtown?schema=public`)
  - `PORT`: Service port number (default: 3002 for customer service, can be changed to avoid port conflicts)
  - `NODE_ENV`: Environment mode (development, test, production)
  - `JWT_SECRET`: Secret key for authentication
- For a complete list of all environment variables and their descriptions, see our detailed [Environment Variables Documentation](./docs/Environment-Variables.md)

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
- Backend API for resource availability checking
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

### Schema Alignment
We've implemented a robust approach to handle Prisma schema mismatches:
- Backend controllers use defensive programming to handle missing tables/fields
- Raw SQL queries with try/catch blocks for tables that may not exist in all environments
- Graceful fallbacks to empty arrays or default values when schema elements are missing
- TypeScript type safety with explicit typing for raw query results

This approach ensures the API remains stable even when the schema evolves or differs between environments.

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
### Form Standards
To ensure consistency across the application, we've established guidelines for creating forms. These guidelines cover:
- Material UI component usage
- Label positioning and behavior
- Accessibility requirements
- Error handling
- Form validation

See [Form Guidelines](./docs/development/FormGuidelines.md) for detailed information.

## Documentation

### Architecture Documents
- [API Service Layer](./docs/architecture/API-SERVICE-LAYER.md) - Shared API abstraction layer for microservices
- [Data Modeling Strategy](./docs/architecture/DATA-MODELING-STRATEGY.md) - Database design principles and optimization approaches
- [SaaS Scaling Assessment](./docs/architecture/SaaS-Scaling-Assessment.md) - Analysis and roadmap for scaling to multi-tenant SaaS
- [Financial Data Architecture](./docs/architecture/financial-data-architecture.md) - Financial data management and calculations

### Feature Documentation
- [Calendar Components](./docs/features/CalendarComponents.md) - Calendar design and implementation
- [Kennel Calendar](./docs/features/KennelCalendar.md) - Kennel-specific calendar functionality
- [Checkout Process](./docs/features/CheckoutProcess.md) - End-to-end checkout workflow
- [Reservation System](./docs/features/Reservations.md) - Reservation booking and management
- [Add-On System](./docs/features/AddOnSystem.md) - Service add-on implementation

### Development Guides
- [Navigation Structure](./docs/development/Navigation.md) - Application navigation design
- [Form Guidelines](./docs/development/FormGuidelines.md) - UI form standards and patterns
- [Staff Scheduling Implementation](./docs/development/StaffSchedulingImplementation.md) - Staff scheduling features

### Changelogs
- [Recent Updates](./docs/changelog/) - Directory containing all change history

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
└── services/
    └── customer/           # Customer service
        ├── src/
        │   ├── controllers/  # Route handlers
        │   ├── routes/       # API routes
        │   ├── middleware/   # Express middleware
        │   └── prisma/       # Database schema
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
- Customer Service API: http://localhost:3002 (or alternative port if specified)
- Other Backend Services: See service-specific documentation

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
