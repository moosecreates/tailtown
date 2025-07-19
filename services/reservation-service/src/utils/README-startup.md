# Startup Utilities

## Overview

The `startupUtils.ts` module provides a comprehensive set of utilities for implementing a robust service startup process. These utilities help ensure that the service starts reliably and provides clear guidance when issues are detected.

## Features

### Environment Variable Validation

```typescript
validateEnvironment(requiredVars: string[] = []): Promise<{
  valid: boolean;
  missing: string[];
  recommendations: string[];
}>
```

Validates that all required environment variables are present and provides specific guidance for missing variables. It also supports loading variables from `.env` files.

Example:
```typescript
const envResult = await validateEnvironment(['DATABASE_URL', 'PORT']);
if (!envResult.valid) {
  console.log('Missing environment variables:', envResult.missing);
  console.log('Recommendations:', envResult.recommendations);
}
```

### Database Connection Testing

```typescript
testDatabaseConnection(prisma: PrismaClient): Promise<{
  connected: boolean;
  error?: string;
  recommendations: string[];
}>
```

Tests the database connection before starting the service and provides detailed error information and troubleshooting guidance. It parses `DATABASE_URL` to provide specific recommendations.

Example:
```typescript
const dbResult = await testDatabaseConnection(prisma);
if (!dbResult.connected) {
  console.log('Database connection error:', dbResult.error);
  console.log('Recommendations:', dbResult.recommendations);
}
```

### Port Availability Checking

```typescript
isPortAvailable(port: number): Promise<boolean>
```

Ensures the specified port is available before starting the server, preventing startup conflicts with other services.

Example:
```typescript
const portAvailable = await isPortAvailable(4003);
if (!portAvailable) {
  console.log('Port 4003 is already in use. Try a different port.');
}
```

### Dependency Service Health Checks

```typescript
checkDependencyServices(dependencies: DependencyService[]): Promise<{
  allRequired: boolean;
  results: Record<string, boolean>;
  recommendations: string[];
}>
```

Tests connectivity to dependent services (e.g., Customer Service), distinguishing between required and optional dependencies.

Example:
```typescript
const dependencies = [
  {
    name: 'Customer Service',
    url: 'http://localhost:3003/health',
    required: false,
    timeout: 3000
  }
];

const dependencyResult = await checkDependencyServices(dependencies);
console.log('All required services available:', dependencyResult.allRequired);
console.log('Service status:', dependencyResult.results);
```

### Graceful Shutdown Handling

```typescript
setupGracefulShutdown(server: http.Server, prisma: PrismaClient): void
```

Sets up handlers for termination signals to properly close server connections and database connections, preventing resource leaks during service restarts.

Example:
```typescript
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
setupGracefulShutdown(server, prisma);
```

### Comprehensive Startup Process

```typescript
performRobustStartup(
  prisma: PrismaClient,
  options: StartupOptions = {}
): Promise<{
  success: boolean;
  recommendations: string[];
}>
```

Orchestrates a comprehensive startup process with all checks and provides detailed recommendations for resolving any issues.

Example:
```typescript
const startupResult = await performRobustStartup(prisma, {
  requiredEnvVars: ['DATABASE_URL'],
  port: parseInt(process.env.PORT || '4003', 10),
  autoMigrate: process.env.AUTO_MIGRATE === 'true',
  dependencies: [
    {
      name: 'Customer Service',
      url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3003/health',
      required: false,
      timeout: 3000
    }
  ],
  exitOnFailure: process.env.EXIT_ON_STARTUP_FAILURE === 'true'
});

if (!startupResult.success) {
  console.log('Startup issues detected:');
  startupResult.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
}
```

## Configuration Options

The `performRobustStartup` function accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `requiredEnvVars` | `string[]` | `['DATABASE_URL']` | List of required environment variables |
| `port` | `number` | `4003` | Port to use for the service |
| `autoMigrate` | `boolean` | `false` | Whether to automatically apply safe migrations |
| `migrationPath` | `string` | `path.join(process.cwd(), 'prisma/migrations')` | Path to migration files |
| `dependencies` | `DependencyService[]` | `[]` | List of dependency services to check |
| `exitOnFailure` | `boolean` | `false` | Whether to exit if startup checks fail |

## Testing

A standalone test script is provided to test the startup process without starting the service:

```bash
# Test with default options
node test-startup-simple.js

# Test with exit on failure
node test-startup-simple.js --exit-on-failure

# Test with auto-migration
node test-startup-simple.js --auto-migrate
```

## Integration with Performance Optimization

These startup utilities support the Stage 5 (Performance Optimization) goals by:

1. Ensuring proper database schema with indexes for query optimization
2. Validating service dependencies for caching resource availability results
3. Providing a foundation for query performance logging and monitoring
4. Supporting graceful shutdown for optimized batch operations
