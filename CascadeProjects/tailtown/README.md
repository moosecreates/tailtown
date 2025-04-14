# Tailtown Pet Resort Management System

A comprehensive management system for pet resorts, handling reservations, customer management, billing, and more.

## Features

- Customer and pet management
- Online reservations and scheduling
- Service catalog (daycare, boarding, grooming, training)
- Billing and payment processing
- Staff scheduling and management
- Reporting and analytics

## Architecture

This project uses a microservices architecture with the following components:

- **Frontend**: React with TypeScript
- **Backend Services**:
  - Auth Service: User authentication and authorization
  - Customer Service: Customer and pet management
  - Reservation Service: Booking and scheduling
  - Billing Service: Invoicing and payments
  - Notification Service: Email and SMS notifications
- **Databases**: PostgreSQL for structured data
- **Message Queue**: Redis for async operations

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js >= 16.x
- npm >= 8.x

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development environment:
   ```
   npm run dev
   ```
4. The services will be available at:
   - Frontend: http://localhost:8080
   - API Gateway: http://localhost:3000
   - Individual service endpoints: http://localhost:300[1-5]

## Production Deployment

For production deployment to AWS:

1. Build the Docker images:
   ```
   npm run build
   ```
2. Push to ECR (or your container registry)
3. Deploy using ECS/EKS

## License

Proprietary - All Rights Reserved
