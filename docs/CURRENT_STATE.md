# Tailtown Application - Current State

## System Overview
- **Frontend**: React with Material-UI running on port 3000
- **Backend**: Express.js with Prisma ORM running on port 3003
- **Database**: PostgreSQL running in Docker on port 5433

## Key Features Implemented
1. **Navigation Pages**
   - Dashboard
   - Customers
   - Pets
   - Services
   - Resources (Kennels)
   - Reservations
   - Calendar

2. **Core Functionality**
   - CRUD operations for all entities
   - Reservation management with status updates
   - Kennel management with occupancy tracking
   - Calendar integration with FullCalendar
   - Pet vaccination status tracking
   - Service duration-based reservation end time calculation

3. **Recent Fixes**
   - Fixed suite status display between main kennel board and suite details modal
   - Implemented proper status determination for kennels
   - Added status field to reservation edit modal
   - Made reservation form more compact for better usability
   - Fixed reservation creation and update functionality
   - Added quick status update feature for reservations page

## Configuration Notes
- Backend runs on port 3003 (not 3002 as originally configured)
- Frontend connects to backend via proxy configuration
- PostgreSQL database runs on port 5433 with credentials postgres:postgres
- Database name: 'customer'

## Startup Process
1. Start PostgreSQL (if not already running):
   ```bash
   docker run -d --name tailtown-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=customer -p 5433:5432 postgres:14
   ```

2. Start backend server:
   ```bash
   cd services/customer
   source ~/.nvm/nvm.sh && npm run dev
   ```

3. Start frontend server:
   ```bash
   cd frontend
   source ~/.nvm/nvm.sh && npm start
   ```

## Known Issues
- Frontend environment configuration expects backend on port 3002, but it's running on 3003
- Some TypeScript linting warnings remain to be addressed
