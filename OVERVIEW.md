# Tailtown Pet Resort Management System
## Project Overview

A modern, full-featured management system for pet resorts, providing comprehensive tools for reservations, customer management, and pet care services. Built with a microservices architecture using React and Node.js, Tailtown offers a complete solution for pet boarding facilities, daycare centers, grooming services, and training programs.

## Current System Status

### ✅ Fully Operational Features
- **Complete Order System**: End-to-end 5-step order processing from customer selection to payment
- **Reservation Management**: Interactive calendar interface with real-time availability checking
- **Customer & Pet Management**: Comprehensive profiles with medical history and vaccination tracking
- **Financial System**: Invoice generation, payment processing, and account balance management
- **Kennel Management**: Real-time suite availability and occupancy tracking
- **Staff Scheduling**: Employee schedules, availability management, and work assignments
- **Analytics & Reporting**: Business intelligence dashboard with revenue tracking and customer insights
- **Multi-Service Support**: Boarding, daycare, grooming, and training services

### 🎯 Current Architecture
- **Frontend**: React application running on port 3000
- **Customer Service**: Node.js microservice on port 4004 (customer management, invoicing, payments)
- **Reservation Service**: Node.js microservice on port 4003 (reservations, resources, availability)
- **Database**: Shared PostgreSQL database on port 5433
- **Authentication**: JWT-based authentication system
- **Multi-tenant**: Tenant isolation middleware for scalability

## Technology Stack

### Frontend Technologies
- **React 18.2.0** with TypeScript for type safety
- **Material-UI (MUI)** for modern, responsive component library
- **FullCalendar** for advanced scheduling and calendar interfaces
- **React Router** for client-side routing
- **Axios** for API communication
- **React Context** for state management

### Backend Technologies
- **Node.js** with Express.js framework
- **TypeScript** for enhanced development experience
- **Prisma ORM** for database operations and schema management
- **PostgreSQL** for reliable data storage
- **JWT** for secure authentication
- **Winston** for comprehensive logging
- **Helmet** for security middleware

### Development & DevOps
- **ESLint** and **Prettier** for code quality
- **Jest** for testing framework
- **Git** for version control
- **npm** for package management
- **Environment-based configuration** for different deployment stages

## Core Features

### Customer Management
- Customer profiles with complete contact information
- Pet profiles with medical history and vaccination records
- Multiple pets per customer support
- Document storage for forms and agreements
- Account balance and payment history tracking

### Reservation System
- Interactive calendar interface with drag-and-drop capabilities
- Real-time availability checking and conflict prevention
- Multiple service types (daycare, boarding, grooming, training)
- Color-coded reservation status tracking
- Specialized kennel grid calendar for efficient management
- Unique order number system (RES-YYYYMMDD-001 format)
- Comprehensive add-on services integration

### Financial Management
- Automatic invoice generation for all reservations
- Detailed invoice views with itemized line items
- Service and add-on itemization with tax calculations
- Payment tracking and history management
- Customer account balance monitoring
- Configurable tax rates and pricing rules

### Service Management
- Customizable service catalog with duration and capacity settings
- Dynamic pricing management with flexible discount systems
- Resource allocation and conflict prevention
- Service category organization (boarding, daycare, grooming, training)

### Resource Management
- Comprehensive tracking of kennels, rooms, and equipment
- Real-time occupancy tracking with backend validation
- Maintenance scheduling and resource conflict prevention
- Multi-type resource filtering and availability checking

### Staff Management
- Staff profiles with contact information and scheduling
- Enhanced scheduling with time-off requests and approval workflow
- Starting location assignment for shifts
- Performance tracking capabilities

## Navigation Structure

### Main Navigation (Daily Operations)
- **Dashboard**: Overview of daily activities and key metrics
- **Boarding & Daycare**: Main calendar view with integrated booking
- **Grooming**: Specialized grooming calendar and appointments
- **Training**: Training session calendar and scheduling
- **Customers**: Customer profiles and contact management
- **Pets**: Pet profiles with medical history
- **Kennels**: Real-time suite availability and kennel board management
- **Reports**: Business analytics with comprehensive reporting system

### Admin Panel (Administrative Functions)
- **Services**: Manage all service types and configurations
- **Resources**: Facility resource and equipment management
- **Staff Scheduling**: Employee management and work assignments
- **Users**: Employee accounts and permissions management
- **Price Rules**: Discount rules and pricing policies
- **General Settings**: System configuration and preferences

## Roadmap & Future Development

### 🔥 Immediate Priorities (Q4 2025)
- **Enhanced Calendar Functionality**: Drag-and-drop reservation management
- **Multi-Pet Selection**: Allow multiple pets for single reservations
- **Retail POS System**: Point of sale for retail items and service packages
- **Advanced Reporting**: Comprehensive reports for financials, customers, and operations

### 🚀 Short Term Goals (Q1 2026)
- **Vaccine Requirements Management**: Admin-configurable vaccine policies
- **Deposits & Wait-list Management**: Handle reservation deposits and waiting lists
- **Standing Reservations**: Recurring/repeating reservation system
- **Comprehensive Testing Infrastructure**: Unit, integration, and end-to-end testing

### 📈 Medium Term Vision (Q2-Q3 2026)
- **Group Classes**: Multi-week training classes with enrollment management
- **Coupons & Discounts**: Comprehensive promotional code system
- **Contracts Management**: Digital contract creation and signing
- **Hardware Integration**: Name tag and receipt printer integration
- **Customer Portal**: Self-service booking and account management

### 🌟 Long Term Objectives (Q4 2026+)
- **Mobile Applications**: Native iOS and Android apps for customers
- **AI-Powered Recommendations**: Smart service suggestions and optimization
- **Advanced Business Intelligence**: Predictive analytics and insights
- **Third-Party Integrations**: Veterinary systems, accounting software, marketing platforms
- **Multi-Location Support**: Franchise and chain management capabilities

### 📊 Advanced Reporting System
- **Sales Reports**: Advanced analytics with year-over-year comparisons
- **Financial Reports**: Revenue, profit/loss, and payment method analysis
- **Tax Reports**: Monthly, quarterly, and annual tax compliance reporting
- **Customer Reports**: Acquisition, retention, and lifetime value analysis
- **Marketing Reports**: Campaign effectiveness and referral tracking
- **Operational Reports**: Staff performance and resource utilization

### 🏗️ Infrastructure & Scaling
- **Cloud Migration**: Transition to hosted cloud infrastructure
- **High Availability**: Disaster recovery and backup systems
- **Performance Optimization**: Database indexing and query optimization
- **API Ecosystem**: Third-party integration capabilities
- **Global CDN**: Content delivery network for optimal performance

## Development Guidelines

### Code Standards
- TypeScript for type safety across all components
- Component-based architecture with reusable patterns
- RESTful API design with consistent response formats
- Comprehensive error handling and logging
- Files maintained under 300 lines for readability
- Extensive JSDoc comments for complex functions

### Database Strategy
- Shared database approach for consistent schema across services
- Prisma ORM for type-safe database operations
- Multi-tenant architecture with proper isolation
- Strategic indexing for performance optimization
- Automated schema validation and migration tools

### Testing Philosophy
- Unit tests for all business logic components
- Integration tests for API endpoints
- End-to-end tests for critical user workflows
- Automated testing in CI/CD pipeline
- Code coverage monitoring and reporting

## Project Structure

```
tailtown/
├── frontend/                    # React application (port 3000)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components and routes
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript interfaces
│   │   └── contexts/          # React context providers
│
├── services/
│   ├── customer/              # Customer service (port 4004)
│   │   ├── src/controllers/   # Business logic handlers
│   │   ├── src/routes/        # API route definitions
│   │   └── prisma/            # Database schema
│   │
│   └── reservation-service/   # Reservation service (port 4003)
│       ├── src/controllers/   # Reservation logic
│       ├── src/routes/        # API endpoints
│       ├── src/utils/         # Utility functions
│       └── docs/              # Service documentation
│
└── docs/                      # Comprehensive documentation
    ├── architecture/          # System design documents
    ├── features/             # Feature specifications
    ├── development/          # Development guidelines
    └── operations/           # Deployment and maintenance
```

## Getting Started

### Prerequisites
- Node.js >= 16.x
- npm >= 8.x
- PostgreSQL >= 13

### Quick Start
1. **Clone and Install**:
   ```bash
   git clone https://github.com/moosecreates/tailtown.git
   cd tailtown
   npm install # Install all dependencies
   ```

2. **Environment Setup**:
   ```bash
   # Copy environment templates
   cp frontend/.env.example frontend/.env
   cp services/customer/.env.example services/customer/.env
   cp services/reservation-service/.env.example services/reservation-service/.env
   ```

3. **Start Development Servers**:
   ```bash
   # Terminal 1: Customer Service
   cd services/customer && npm run dev

   # Terminal 2: Reservation Service  
   cd services/reservation-service && npm run dev

   # Terminal 3: Frontend
   cd frontend && npm start
   ```

4. **Access Applications**:
   - Frontend: http://localhost:3000
   - Customer API: http://localhost:4004
   - Reservation API: http://localhost:4003

## API Architecture

### Authentication
- JWT-based authentication for all protected routes
- Token included in Authorization header: `Bearer <token>`
- Multi-tenant support via `x-tenant-id` header

### Response Format
```json
{
  "status": "success" | "error",
  "data": "<response_data>",
  "results": "<number_of_items>",
  "totalPages": "<total_pages>",
  "currentPage": "<current_page>"
}
```

### Microservices Communication
- RESTful APIs with consistent endpoint patterns
- Service-to-service communication via HTTP
- Shared database for data consistency
- Tenant isolation middleware for security

## Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Follow coding standards and TypeScript best practices
3. Write comprehensive tests for new functionality
4. Update documentation for significant changes
5. Submit pull request with detailed description

### Code Quality Standards
- ESLint and Prettier for consistent formatting
- TypeScript for type safety and better developer experience
- Jest for unit and integration testing
- JSDoc comments for complex business logic
- Regular code reviews and pair programming

---

**Tailtown Pet Resort Management System** - Transforming pet care operations with modern technology and intuitive design.

*For detailed technical documentation, see the `/docs` directory. For specific implementation guides, refer to service-specific documentation in each service folder.*
