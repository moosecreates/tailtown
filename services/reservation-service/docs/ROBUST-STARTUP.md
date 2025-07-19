# Robust Service Startup Process

## Overview

This document describes the enhanced startup process implemented for the Tailtown reservation service. The robust startup process ensures that the service starts reliably and provides clear guidance when issues are detected.

## Features

The robust startup process includes the following checks and features:

1. **Environment Variable Validation**
   - Validates that all required environment variables are present
   - Provides specific guidance for missing variables
   - Supports loading variables from `.env` files

2. **Database Connection Testing**
   - Tests the database connection before starting the service
   - Provides detailed error information and troubleshooting guidance
   - Parses `DATABASE_URL` to provide specific recommendations

3. **Schema Validation**
   - Validates that all critical tables and columns exist
   - Generates detailed reports of missing schema elements
   - Can automatically apply safe migrations when configured
   - Provides clear guidance on how to fix schema issues

4. **Port Availability Checking**
   - Ensures the specified port is available before starting the server
   - Prevents startup conflicts with other services
   - Provides recommendations when port conflicts are detected

5. **Dependency Service Health Checks**
   - Tests connectivity to dependent services (e.g., Customer Service)
   - Distinguishes between required and optional dependencies
   - Provides status information for all dependencies

6. **Graceful Shutdown Handling**
   - Properly closes server connections on termination signals
   - Ensures database connections are closed cleanly
   - Prevents resource leaks during service restarts

## Configuration Options

The startup process can be configured with the following options:

| Option | Environment Variable | Description |
|--------|---------------------|-------------|
| Required Environment Variables | N/A | List of environment variables that must be present |
| Port | `PORT` | The port to use for the service (default: 4003) |
| Auto-Migrate | `AUTO_MIGRATE` | Whether to automatically apply safe migrations (`true`/`false`) |
| Exit on Failure | `EXIT_ON_STARTUP_FAILURE` | Whether to exit if startup checks fail (`true`/`false`) |
| Customer Service URL | `CUSTOMER_SERVICE_URL` | URL for the Customer Service health check (default: `http://localhost:3003/health`) |

## Usage

### Normal Service Startup

The service automatically uses the robust startup process when started:

```bash
# Start with default options
npm start

# Start with auto-migration enabled
AUTO_MIGRATE=true npm start

# Start with custom port
PORT=4004 npm start

# Start with exit on failure
EXIT_ON_STARTUP_FAILURE=true npm start
```

### Testing Startup Process

A dedicated script is provided to test the startup process without starting the service:

```bash
# Test startup with default options
node test-startup.js

# Test startup with auto-migration enabled
node test-startup.js --auto-migrate

# Test startup with exit on failure
node test-startup.js --exit-on-failure

# Test startup with both options
node test-startup.js --auto-migrate --exit-on-failure
```

## Troubleshooting

### Database Connection Issues

If the service fails to connect to the database:

1. Check that PostgreSQL is running
2. Verify the `DATABASE_URL` in your `.env` file
3. Ensure the database exists and is accessible
4. Check for network connectivity issues

Example `DATABASE_URL` format:
```
DATABASE_URL=postgresql://username:password@localhost:5432/tailtown
```

### Schema Issues

If schema validation fails:

1. Run the migration script:
   ```bash
   node prisma/migrations/apply_migrations.js
   ```

2. Alternatively, enable auto-migration:
   ```bash
   AUTO_MIGRATE=true npm start
   ```

### Port Conflicts

If the port is already in use:

1. Check what process is using the port:
   ```bash
   lsof -i :4003
   ```

2. Either stop the conflicting process or use a different port:
   ```bash
   PORT=4004 npm start
   ```

### Dependency Service Issues

If dependency service checks fail:

1. Ensure the Customer Service is running
2. Verify the `CUSTOMER_SERVICE_URL` environment variable
3. Check network connectivity between services

## Implementation Details

The robust startup process is implemented in the following files:

- `src/utils/startupUtils.ts` - Core startup utilities
- `src/index.ts` - Main service entry point
- `test-startup.js` - Standalone startup test script

## Integration with Performance Optimization

This robust startup process supports the Stage 5 (Performance Optimization) goals by:

1. Ensuring proper database schema with indexes for query optimization
2. Validating service dependencies for caching resource availability results
3. Providing a foundation for query performance logging and monitoring
4. Supporting graceful shutdown for optimized batch operations

## Next Steps

Future enhancements to the startup process may include:

1. More detailed performance metrics during startup
2. Integration with centralized monitoring systems
3. Support for dynamic configuration based on environment
4. Enhanced dependency validation with service version checking
