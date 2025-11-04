# Testing Guide for Reservation Service

This document outlines the testing patterns and best practices established for the Reservation Service. Following these guidelines will ensure consistent, reliable, and maintainable tests across the codebase.

## Test Implementation Patterns

### Controller Testing Pattern

We've established a robust pattern for testing controllers that avoids circular dependencies and ensures proper isolation between tests:

1. **Mock Dependencies Before Importing Controllers**
   ```typescript
   // First mock all dependencies
   jest.mock('@prisma/client', () => ({
     PrismaClient: jest.fn().mockImplementation(() => ({
       reservation: {
         findFirst: jest.fn(),
         findMany: jest.fn(),
         create: jest.fn(),
         update: jest.fn(),
         delete: jest.fn(),
       },
       // Other models as needed
     })),
   }));
   
   // Then import the controller
   import { getReservationById } from '../../controllers/reservation.controller';
   ```

2. **Reset Mocks Between Tests**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
     // Reset specific mocks to default values if needed
     mockPrisma.reservation.findFirst.mockResolvedValue(null);
   });
   ```

3. **Test Both Success and Error Paths**
   ```typescript
   it('should return 404 when reservation not found', async () => {
     // Arrange
     mockPrisma.reservation.findFirst.mockResolvedValue(null);
     
     // Act
     await getReservationById(req, res, next);
     
     // Assert
     expect(res.status).toHaveBeenCalledWith(404);
     expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
       status: 'error',
       error: expect.objectContaining({
         message: expect.stringContaining('not found')
       })
     }));
   });
   ```

4. **Mock Utility Functions**
   ```typescript
   jest.mock('../../utils/reservationUtils', () => ({
     detectReservationConflicts: jest.fn().mockResolvedValue([]),
     generateOrderNumber: jest.fn().mockReturnValue('RES-20250602-001'),
   }));
   ```

5. **Mock Error Classes**
   ```typescript
   jest.mock('../../utils/error', () => ({
     AppError: jest.fn().mockImplementation((message, statusCode) => ({
       message,
       statusCode,
     })),
   }));
   ```

## Best Practices

1. **Test Isolation**
   - Each test should be independent and not rely on the state from previous tests
   - Use `beforeEach` to reset mocks and set up test conditions
   - Avoid shared mutable state between tests

2. **Comprehensive Coverage**
   - Test all controller methods
   - Include tests for success cases, error cases, and edge cases
   - Test tenant validation, input validation, and business logic

3. **Realistic Test Data**
   - Use realistic test data that matches the expected schema
   - Include all required fields in test objects
   - Use helper functions to generate test data for reuse

4. **Clear Assertions**
   - Make assertions specific and clear
   - Test both the status code and response body
   - Verify that the correct error messages are returned

5. **Avoid Circular Dependencies**
   - Always mock dependencies before importing the module under test
   - Use jest.mock() at the top of the file
   - Be careful with imports that might cause circular dependencies

## Example Test File

See `reservation.controller.final.test.ts` for a complete example of these patterns in action. This file includes tests for all reservation controller methods with proper mocking and assertions.

## Troubleshooting Common Issues

### "Cannot find module" errors
- Ensure the import path is correct
- Check that the module exists at the specified path
- Verify that the module is included in the TypeScript compilation

### Mock function not called
- Verify that the mock is set up correctly
- Check that the function is being called with the expected arguments
- Ensure that the mock is reset between tests

### Unexpected test interactions
- Look for shared state between tests
- Ensure all mocks are properly reset in beforeEach
- Check for asynchronous operations that might be affecting other tests

## Next Steps

1. Apply these patterns to all controller tests
2. Create shared test utilities for common operations
3. Implement integration tests for critical paths
4. Set up CI/CD to run tests automatically
