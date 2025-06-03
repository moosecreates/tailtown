# Tailtown Pet Resort Management System - Setup Guide

This document provides step-by-step instructions for setting up the Tailtown pet resort management system for development and testing.

## Prerequisites

These tools must be installed on your system:

1. **Node.js and npm** (v14+ recommended)
   ```bash
   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   nvm install --lts
   nvm use --lts
   
   # Or via homebrew on macOS
   brew install node
   ```

2. **PostgreSQL** (v12+ recommended)
   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14
   
   # Create database
   createdb tailtown_dev
   ```

## Backend Setup (Customer Service)

1. **Install dependencies**:
   ```bash
   cd /Users/robweinstein/CascadeProjects/tailtown/services/customer
   npm install
   ```

2. **Database setup**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations to set up database schema
   npx prisma migrate dev --name init
   
   # Optional: Seed the database with test data
   npx ts-node src/tests/scripts/seed-services.ts
   ```

3. **Start the backend server**:
   ```bash
   npm run dev
   ```
   The server should start on http://localhost:3002

## Frontend Setup

1. **Install dependencies**:
   ```bash
   cd /Users/robweinstein/CascadeProjects/tailtown/frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```
   The frontend should start on http://localhost:3000

## Running Tests

1. **Run all tests**:
   ```bash
   cd /Users/robweinstein/CascadeProjects/tailtown/services/customer
   npm test
   ```

2. **Run specific tests**:
   ```bash
   # Test the service controller
   npm test -- src/tests/controllers/service.controller.test.ts
   
   # Run integration tests
   npm test -- src/tests/integration
   
   # Run validation tests
   npm test -- src/tests/api-validation
   ```

3. **Generate test coverage report**:
   ```bash
   npm test -- --coverage
   ```

## Testing with Postman

1. Import the Postman collection from:
   `/Users/robweinstein/CascadeProjects/tailtown/services/customer/src/tests/postman/tailtown-services-api.postman_collection.json`

2. Configure a Postman environment with:
   - `baseUrl`: `http://localhost:3002`

3. Use the collection to test all service endpoints

## Manual Testing Steps

For manual testing without Postman, follow the test plan at:
`/Users/robweinstein/CascadeProjects/tailtown/services/customer/src/tests/manual-test-plan.md`

## Troubleshooting

1. **Database connection issues**:
   - Check that PostgreSQL is running
   - Verify DATABASE_URL in .env file
   - Ensure the database exists

2. **Missing modules errors**:
   - Run `npm install` again
   - Delete node_modules folder and run `npm install`

3. **TypeScript errors**:
   - Run `npm install --save-dev @types/node @types/express`
   - Ensure typescript is installed: `npm install --save-dev typescript`
