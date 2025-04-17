# DevOps Guide

## Server Management

### Development Environment Setup

1. Node.js Environment
```bash
# Always source nvm before starting servers
source ~/.nvm/nvm.sh
```

2. Starting Services
```bash
# Start backend first
cd services/customer
npm run dev

# Start frontend second
cd frontend
npm start
```

### Process Management

#### Checking Running Processes
```bash
# Check frontend server (port 3000)
lsof -i :3000

# Check backend server (port 3002)
lsof -i :3002
```

#### Killing Processes
```bash
# Kill a process
kill -9 [PID]

# Example:
kill -9 58875
```

### Best Practices

1. Server Start Order
   - Always start backend before frontend
   - Wait for backend to fully initialize before starting frontend
   - Verify both servers are running before testing

2. Process Management
   - Always check for existing processes before starting servers
   - Kill existing processes to avoid port conflicts
   - Use proper process termination commands

3. Environment
   - Use nvm to ensure correct Node.js version
   - Verify .env files are properly configured
   - Check database connection before starting servers

## Deployment Considerations

1. Environment Variables
   - Use .env.example as template
   - Never commit actual .env files
   - Verify all required variables are set

2. File Storage
   - Regular backup of uploads directory
   - Monitor disk space usage
   - Clean up temporary files

3. Database
   - Run migrations before deployment
   - Verify backup systems are in place
   - Monitor database connections
