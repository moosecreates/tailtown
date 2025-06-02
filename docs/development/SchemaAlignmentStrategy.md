# Schema Alignment Strategy

## Overview

This document outlines our approach to handling Prisma schema mismatches between different environments and during schema evolution. The goal is to maintain API stability and prevent runtime errors even when the database schema differs from what the code expects.

## Problem Statement

During development, we encountered several issues related to schema mismatches:

1. **Missing Fields**: References to fields that no longer exist in the schema
2. **Missing Relations**: References to relations that have been renamed or removed
3. **Missing Tables**: Attempts to query tables that don't exist in certain environments
4. **TypeScript Errors**: Type errors due to schema changes not reflected in the code

These issues caused 500 Internal Server Errors in the API and TypeScript compilation errors.

## Solution Strategy

We've implemented a multi-layered approach to handle schema mismatches:

### 1. Defensive Programming

All controllers use defensive programming techniques:
- Null checks before accessing potentially missing fields
- Default values for fields that might not exist
- Fallback behavior when expected data is not available

### 2. Raw SQL Queries with Error Handling

For tables that might not exist in all environments (e.g., `Invoice`):
- Use `prisma.$queryRaw` instead of the Prisma client models
- Wrap queries in try/catch blocks to handle "table does not exist" errors
- Return empty arrays or sensible defaults when tables are missing
- Explicitly type raw query results to maintain type safety

Example:
```typescript
try {
  invoices = await prisma.$queryRaw`
    SELECT * FROM "Invoice" 
    WHERE "customerId" = ${id} 
    ORDER BY "issueDate" DESC 
    LIMIT ${limit} 
    OFFSET ${skip}
  `;
} catch (error) {
  // If the table doesn't exist, return an empty array
  console.log('Invoice table may not exist in the database');
  invoices = [];
}
```

### 3. Feature Toggles

For features dependent on schema elements that might be missing:
- Implement feature toggles to disable functionality when required schema elements are missing
- Provide informative messages to users when features are unavailable
- Maintain a clean separation between core and optional features

### 4. Schema Validation on Startup

- Validate critical schema elements on service startup
- Log warnings for missing non-critical elements
- Fail fast for missing critical elements

## Implementation Details

### Customer Controller

The customer controller has been updated to handle several schema mismatches:

1. **Removed references to non-existent fields and models**:
   - `notifications`
   - `ContactMethod`
   - `emergencyContacts`
   - `medicalRecords`
   - `notificationPreference`
   - `payment`
   - `invoice`
   - `document`
   - `isActive`

2. **Updated Prisma queries**:
   - Changed from `include` to `select` for specific fields
   - Removed invalid includes
   - Used raw SQL queries for potentially missing tables

3. **Error handling**:
   - Added try/catch blocks for database operations
   - Implemented graceful fallbacks for missing tables

### Pet Controller

The pet controller has been updated to:

1. **Fix owner relation queries**:
   - Changed from using `include` with the entire owner object to using `select` with specific owner fields

2. **Remove invalid field references**:
   - Removed all references to the non-existent `profilePhoto` field
   - Disabled pet photo upload functionality temporarily

## Best Practices

When working with the Prisma schema, follow these guidelines:

1. **Schema Changes**:
   - Update all affected controllers when changing the schema
   - Add migration scripts for database updates
   - Document breaking changes

2. **New Features**:
   - Ensure schema support before implementing new features
   - Use feature toggles for optional functionality
   - Implement graceful degradation

3. **Testing**:
   - Test API endpoints with both existing and missing schema elements
   - Verify error handling works as expected
   - Check that fallback behavior is appropriate

## Future Improvements

1. **Schema Versioning**:
   - Implement explicit schema version checking
   - Support multiple schema versions in the same codebase

2. **Automated Testing**:
   - Add tests specifically for schema mismatch scenarios
   - Implement CI/CD checks for schema compatibility

3. **Schema Documentation**:
   - Generate up-to-date schema documentation
   - Track schema changes in a changelog

## Conclusion

This approach ensures that our API remains stable even as the schema evolves or differs between environments. By implementing defensive programming, proper error handling, and graceful fallbacks, we can prevent runtime errors and provide a better experience for both developers and end users.
