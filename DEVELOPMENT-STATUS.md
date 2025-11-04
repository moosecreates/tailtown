# Development Environment Status

**Last Updated**: November 3, 2025 12:53 PM PST

## ✅ Current Status: STABLE & RUNNING

### Active Services
- **Frontend**: Running on `http://localhost:3000`
- **Customer Service**: Running on `http://localhost:4004`
- **Reservation Service**: Running on `http://localhost:4003`
- **PostgreSQL Databases**: 
  - Main DB: `localhost:5433` (customer database)
  - Secondary DB: `localhost:5435`

### Recent Fixes (Nov 3, 2025)
1. ✅ Fixed reservation service dotenv configuration
2. ✅ Updated frontend .env to use localhost instead of production IP
3. ✅ All services verified and health checks passing

### Environment Configuration

#### Frontend (.env)
```
REACT_APP_TENANT_ID=dev
REACT_APP_API_URL=http://localhost:4004
REACT_APP_RESERVATION_API_URL=http://localhost:4003
```

#### Customer Service (.env)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/customer"
PORT=4004
NODE_ENV=development
```

#### Reservation Service (.env)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/customer"
PORT=4003
NODE_ENV=development
CUSTOMER_SERVICE_URL="http://localhost:4004/health"
```

### Starting Services

**Important**: Always use `source ~/.nvm/nvm.sh` before starting Node services.

```bash
# Start Customer Service
cd services/customer
source ~/.nvm/nvm.sh && npm run dev

# Start Reservation Service
cd services/reservation-service
source ~/.nvm/nvm.sh && npm run dev

# Start Frontend
cd frontend
source ~/.nvm/nvm.sh && npm start
```

### Health Check
```bash
# Check all services
curl http://localhost:4004/health  # Customer Service
curl http://localhost:4003/health  # Reservation Service
curl http://localhost:3000         # Frontend
```

### Known Issues
- None currently

### Production Environment
- **URL**: http://129.212.178.244:3000
- **Status**: Deployed and operational
- **Note**: Local development uses different configuration (localhost vs production IP)

---

## Quick Start After Restart

1. Verify databases are running:
   ```bash
   docker ps --filter "name=tailtown"
   ```

2. Start all services (in separate terminals):
   ```bash
   # Terminal 1 - Customer Service
   cd services/customer && source ~/.nvm/nvm.sh && npm run dev
   
   # Terminal 2 - Reservation Service
   cd services/reservation-service && source ~/.nvm/nvm.sh && npm run dev
   
   # Terminal 3 - Frontend
   cd frontend && source ~/.nvm/nvm.sh && npm start
   ```

3. Access application at http://localhost:3000

---

## Development Notes

### Architecture
- Microservices architecture with separate customer and reservation services
- Shared PostgreSQL database (customer)
- React frontend with Material-UI
- TypeScript throughout

### Key Directories
- `/frontend` - React application
- `/services/customer` - Customer service API
- `/services/reservation-service` - Reservation service API
- `/docs` - Project documentation

### Testing
- Login credentials: Any email with password "bypass" (development mode)
- Default tenant: "dev"
