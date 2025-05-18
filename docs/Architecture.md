# Architecture Overview

## System Architecture

The Tailtown Pet Resort Management System follows a modern web application architecture with a clear separation of concerns:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Frontend  │────▶│   Backend   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  Database   │
                                       └─────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────┐
│              Frontend               │
├─────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌──────┐ │
│ │  Pages  │  │   UI    │  │State │ │
│ │         │  │Components│  │ Mgmt │ │
│ └─────────┘  └─────────┘  └──────┘ │
├─────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌──────┐ │
│ │ Service │  │  Types  │  │Utils │ │
│ │  Layer  │  │         │  │      │ │
│ └─────────┘  └─────────┘  └──────┘ │
└─────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────┐
│              Backend                │
├─────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌──────┐ │
│ │ Routes  │  │   API   │  │Auth  │ │
│ │         │  │Endpoints│  │      │ │
│ └─────────┘  └─────────┘  └──────┘ │
├─────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌──────┐ │
│ │Services │  │Database │  │Error │ │
│ │         │  │  Layer  │  │Handle│ │
│ └─────────┘  └─────────┘  └──────┘ │
└─────────────────────────────────────┘
```

## Key Components

### Frontend Components
- **Pages**: Main views (Dashboard, Calendar, Customers, Reservations, etc.)
- **UI Components**: Reusable UI elements (Calendar, Forms, Modals, etc.)
- **Services**: API communication layer (customerService, reservationService, financialService, etc.)
- **Contexts**: Global state management
- **Types**: TypeScript interfaces for consistent data structures
- **Utils**: Helper functions for formatting, validation, and calculations

### Backend Components
- **Routes**: API endpoint definitions
- **Controllers**: Business logic implementation
- **Middleware**: Request processing (authentication, validation, error handling)
- **Services**: Data operations and business rules
- **Database**: Prisma ORM with PostgreSQL

### Financial Components
- **Financial Service**: Centralized financial calculations and data processing
- **Financial Transactions**: Handling payments, refunds, and account adjustments
- **Invoicing System**: Generation and management of customer invoices
- **Financial Reporting**: Analytics and reporting on financial data

## Specialized Architecture Documentation

For more detailed architecture information on specific subsystems:

- [Financial Data Architecture](./architecture/financial-data-architecture.md) - Detailed design of the financial components
- [Database Schema](./Database-Schema.md) - Complete database schema documentation

## Data Flow

1. **User Interaction**
   ```
   User Action → React Component → Service Layer → API Call
   ```

2. **API Request**
   ```
   API Call → Express Route → Middleware → Controller → Service → Database
   ```

3. **Response**
   ```
   Database → Service → Controller → Response → Frontend → UI Update
   ```

## Security Architecture

1. **Authentication**
   - JWT-based token system
   - Secure cookie storage
   - Role-based access control

2. **Data Protection**
   - HTTPS everywhere
   - Input validation
   - SQL injection prevention
   - XSS protection

## Performance Considerations

1. **Frontend**
   - Code splitting
   - Lazy loading
   - Memoization
   - Efficient re-renders

2. **Backend**
   - Query optimization
   - Connection pooling
   - Response caching
   - Rate limiting
