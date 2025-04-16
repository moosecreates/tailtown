# Environment Variables

This document describes the environment variables used in the Tailtown Pet Resort Management System.

## Backend Environment Variables

Location: `/services/customer/.env`

### Database Configuration
- `DATABASE_URL`: PostgreSQL connection string
  - Format: `postgresql://username:password@localhost:5432/tailtown?schema=public`
  - Required: Yes
  - Example: `postgresql://admin:secret@localhost:5432/tailtown?schema=public`

### Server Configuration
- `PORT`: Server port number
  - Default: 3002
  - Required: Yes

- `NODE_ENV`: Environment mode
  - Values: development, test, production
  - Default: development
  - Required: Yes

### JWT Configuration
- `JWT_SECRET`: Secret key for JWT token generation
  - Required: Yes
  - Note: Must be unique and secure in production

- `JWT_EXPIRES_IN`: JWT token expiration time
  - Format: Time units (e.g., 24h, 7d)
  - Default: 24h
  - Required: Yes

### File Upload Configuration
- `UPLOAD_DIR`: Directory for file uploads
  - Default: uploads
  - Required: Yes

- `MAX_FILE_SIZE`: Maximum file size in bytes
  - Default: 5242880 (5MB)
  - Required: Yes

### API Configuration
- `API_PREFIX`: Prefix for all API routes
  - Default: /api
  - Required: Yes

### CORS Configuration
- `ALLOWED_ORIGINS`: Allowed CORS origins
  - Format: Comma-separated URLs
  - Default: http://localhost:3000
  - Required: Yes

### Rate Limiting
- `RATE_LIMIT_WINDOW`: Time window for rate limiting in minutes
  - Default: 15
  - Required: No

- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window
  - Default: 100
  - Required: No

## Frontend Environment Variables

Location: `/frontend/.env`

### API Configuration
- `REACT_APP_API_URL`: Backend API URL
  - Default: http://localhost:3002
  - Required: Yes

- `REACT_APP_API_TIMEOUT`: API request timeout in milliseconds
  - Default: 30000
  - Required: No

### Feature Flags
- `REACT_APP_ENABLE_DEBUG`: Enable debug mode
  - Values: true, false
  - Default: false
  - Required: No

- `REACT_APP_ENABLE_MOCK_DATA`: Enable mock data
  - Values: true, false
  - Default: false
  - Required: No

### Authentication
- `REACT_APP_AUTH_STORAGE_KEY`: Local storage key for auth token
  - Default: tailtown_auth
  - Required: Yes

### UI Configuration
- `REACT_APP_ITEMS_PER_PAGE`: Default items per page
  - Default: 10
  - Required: No

- `REACT_APP_DATE_FORMAT`: Default date format
  - Default: MM/DD/YYYY
  - Required: No

## Environment Setup Instructions

1. Copy the example files:
   ```bash
   cp services/customer/.env.example services/customer/.env
   cp frontend/.env.example frontend/.env
   ```

2. Update the values in both .env files with your specific configuration

3. Never commit .env files to version control

4. For production deployment:
   - Use secure values for all secrets
   - Set NODE_ENV=production
   - Use proper database credentials
   - Configure proper CORS settings

## Backup and Restore

To safely backup your environment configuration:

1. Create a secure backup of your .env files:
   ```bash
   # Backup
   cp services/customer/.env services/customer/.env.backup
   cp frontend/.env frontend/.env.backup
   ```

2. To restore from backup:
   ```bash
   # Restore
   cp services/customer/.env.backup services/customer/.env
   cp frontend/.env.backup frontend/.env
   ```

3. Store backups in a secure location outside of version control

4. Consider using a secrets management service for production environments
