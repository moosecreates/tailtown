# Architecture Overview

## System Architecture

The Tailtown Pet Resort Management System follows a modern microservices architecture with a clear separation of concerns:

```
┌─────────────┐     ┌─────────────┐     ┌───────────────────────┐
│   Browser   │────▶│   Frontend  │────▶│   Customer Service    │
└─────────────┘     └─────────────┘     └───────────────────────┘
                          │                         │
                          │                         ▼
                          │               ┌─────────────────────┐
                          │               │      Database       │
                          │               └─────────────────────┘
                          ▼                         ▲
                    ┌────────────────┐              │
                    │  Reservation   │──────────────┘
                    │    Service     │
                    └────────────────┘
```

For detailed information on service boundaries, port assignments, and communication patterns, see [Service Architecture](./SERVICE-ARCHITECTURE.md).

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

### Microservices Architecture

Tailtown uses a microservices architecture with the following core services:

#### Customer Service (Port 3003)
```
┌─────────────────────────────────────┐
│         Customer Service            │
├─────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌──────┐ │
│ │Customer │  │  Pet    │  │Auth  │ │
│ │   API   │  │  API    │  │      │ │
│ └─────────┘  └─────────┘  └──────┘ │
├─────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌──────┐ │
│ │Services │  │Prisma   │  │Error │ │
│ │         │  │  ORM    │  │Handle│ │
│ └─────────┘  └─────────┘  └──────┘ │
└─────────────────────────────────────┘
```

#### Reservation Service (Port 4003)
```
┌─────────────────────────────────────┐
│        Reservation Service           │
├─────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌──────┐ │
│ │Reserv.  │  │Resource │  │Add-on│ │
│ │   API   │  │  API    │  │  API │ │
│ └─────────┘  └─────────┘  └──────┘ │
├─────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌──────┐ │
│ │Services │  │Prisma   │  │Schema│ │
│ │         │  │  ORM    │  │Align │ │
│ └─────────┘  └─────────┘  └──────┘ │
└─────────────────────────────────────┘
```

## Key Components

### Frontend Components
- **Pages**: Main views (Dashboard, Calendar, etc.)
- **UI Components**: Reusable UI elements
- **Services**: API communication layer
- **Contexts**: Global state management
- **Types**: TypeScript interfaces

### Microservice Components

#### Customer Service Components
- **Routes**: Customer and pet API endpoint definitions
- **Controllers**: Customer and pet business logic
- **Middleware**: Authentication, tenant isolation, request validation
- **Services**: Customer and pet data operations
- **Database**: Prisma ORM with schema alignment

#### Reservation Service Components
- **Routes**: Reservation, resource, and add-on API endpoint definitions
- **Controllers**: Reservation and resource business logic
- **Middleware**: Authentication, tenant isolation, request validation
- **Services**: Reservation and resource data operations
- **Database**: Prisma ORM with schema alignment strategy

## Data Flow

1. **User Interaction**
   ```
   User Action → React Component → Service Layer → API Call to Appropriate Microservice
   ```

2. **Microservice API Request**
   ```
   API Call → Express Route → Middleware → Controller → Service → Database
   ```

3. **Cross-Service Communication** (when needed)
   ```
   Service A → HTTP Request → Service B API → Service B Controller → Response
   ```

4. **Response Flow**
   ```
   Database → Service → Controller → Response → Frontend → UI Update
   ```

5. **Multi-tenant Data Isolation**
   ```
   Request with Tenant ID → Tenant Middleware → Filtered Database Queries → Tenant-specific Data
   ```

## Security Architecture

1. **Authentication**
   - JWT-based token system implemented in each microservice
   - Secure cookie storage
   - Role-based access control
   - Tenant isolation middleware

2. **Data Protection**
   - HTTPS everywhere
   - Input validation in each microservice
   - SQL injection prevention through Prisma ORM
   - XSS protection
   - Multi-tenant data isolation

3. **Service Security**
   - Independent authentication in each service
   - Service-to-service communication security
   - Rate limiting per service
   - Environment-specific security configurations

## Performance Considerations

1. **Frontend**
   - Code splitting
   - Lazy loading
   - Memoization
   - Efficient re-renders
   - Service-specific API client optimization

2. **Microservices**
   - Independent scaling of each service based on load
   - Service-specific query optimization
   - Connection pooling in each service
   - Response caching strategies
   - Rate limiting per service

3. **Database**
   - Efficient schema design for each service
   - Proper indexing for multi-tenant queries
   - Query optimization with Prisma
   - Connection pooling

4. **Cross-Service Communication**
   - Minimized cross-service dependencies
   - Efficient API design for service-to-service calls
   - Appropriate timeout and retry strategies
