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
   - Kennel calendar implementation

3. **Recent Fixes**
   - Fixed suite status display between main kennel board and suite details modal
   - Implemented proper status determination for kennels
   - Added status field to reservation edit modal
   - Made reservation form more compact for better usability
   - Fixed reservation creation and update functionality
   - Added quick status update feature for reservations page
   - Updated theme color to #126f9f for better visual appeal
   - Fixed accessibility issues with aria-hidden attributes
   - Resolved scrolling problems in the PetDetails page

## UI and UX

- Material-UI components are used throughout the application
- Primary theme color: #126f9f
- Responsive design for both desktop and mobile views
- Form validation for all user inputs
- Loading states for asynchronous operations
- Error handling with user-friendly messages
- Specialized calendar views for different service types (boarding, daycare, grooming, training)
- Grid-based kennel calendar for efficient boarding and daycare management

## Configuration Notes
- Backend runs on port 3003
- Frontend connects to backend via the API service (api.ts) which uses port 3003
- The frontend .env file contains REACT_APP_API_URL=http://localhost:3002, but this is not currently used by the application
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
- There's a discrepancy between the frontend .env configuration (port 3002) and the actual backend port (3003), but this doesn't affect functionality as the application uses a hardcoded port in api.ts
- Some TypeScript linting warnings remain to be addressed
