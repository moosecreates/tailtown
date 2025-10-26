# Testing Guide

**Last Updated**: October 25, 2025  
**Status**: Active Development

---

## Overview

This guide provides patterns and examples for writing tests in the Tailtown application. Use the reference tests as templates for new test files.

---

## Test Structure

### Frontend Tests
Location: `/frontend/src/**/__tests__/`

### Backend Tests  
Location: `/services/{service-name}/src/**/__tests__/`

---

## Reference Test Files

### 1. Component Testing - GroomerSelector
**File**: `/frontend/src/components/reservations/__tests__/GroomerSelector.test.tsx`

**What it demonstrates**:
- React component testing with React Testing Library
- Mocking service dependencies
- Testing async operations
- User interaction simulation
- Accessibility testing
- Edge case handling

**Test Categories**:
```typescript
describe('GroomerSelector', () => {
  describe('Rendering', () => {
    // Loading states, error states, empty states
  });
  
  describe('Availability Checking', () => {
    // API calls, data processing, status display
  });
  
  describe('User Interactions', () => {
    // Clicks, selections, form changes
  });
  
  describe('Edge Cases', () => {
    // Boundary conditions, invalid data
  });
  
  describe('Accessibility', () => {
    // ARIA labels, keyboard navigation
  });
});
```

**Key Patterns**:
```typescript
// Mock service
jest.mock('../../../services/staffService');
const mockService = staffService as jest.Mocked<typeof staffService>;

// Setup before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockService.getAllStaff.mockResolvedValue(mockData);
});

// Test async rendering
await waitFor(() => {
  expect(screen.getByText(/expected text/i)).toBeInTheDocument();
});

// Test user interactions
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'new value' } });
```

---

### 2. Form Validation Testing - TrainingClasses
**File**: `/frontend/src/pages/training/__tests__/TrainingClasses.validation.test.tsx`

**What it demonstrates**:
- Form validation testing
- Required field checking
- Date formatting validation
- API error handling
- Success flow testing

**Test Categories**:
```typescript
describe('TrainingClasses - Validation', () => {
  describe('Required Field Validation', () => {
    // Test each required field individually
  });
  
  describe('Date Formatting', () => {
    // Date object to ISO string conversion
  });
  
  describe('API Error Handling', () => {
    // Backend errors, network errors, error display
  });
  
  describe('Successful Creation', () => {
    // Happy path, API calls, state updates
  });
  
  describe('Edge Cases', () => {
    // Zero values, negative numbers, etc.
  });
});
```

**Key Patterns**:
```typescript
// Test required field
it('should show error when name is missing', async () => {
  render(<Component />);
  
  const saveButton = await screen.findByText(/save/i);
  fireEvent.click(saveButton);
  
  await waitFor(() => {
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
  
  expect(mockService.create).not.toHaveBeenCalled();
});

// Test error handling
it('should display backend error message', async () => {
  mockService.create.mockRejectedValue({
    response: { data: { message: 'Error message' } }
  });
  
  // ... trigger action
  
  await waitFor(() => {
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
```

---

### 3. Controller Testing - TrainingClass
**File**: `/services/customer/src/controllers/__tests__/trainingClass.controller.test.ts`

**What it demonstrates**:
- Express controller testing
- Request/response mocking
- Validation logic testing
- Error middleware testing

**Test Categories**:
```typescript
describe('TrainingClass Controller', () => {
  describe('Required Field Validation', () => {
    // Test each required field
  });
  
  describe('Valid Request', () => {
    // Test successful requests
  });
});
```

**Key Patterns**:
```typescript
// Mock request/response
let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
let mockNext: NextFunction;

beforeEach(() => {
  mockRequest = {
    headers: { 'x-tenant-id': 'test' },
    body: {}
  };
  
  mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  
  mockNext = jest.fn();
});

// Test validation
it('should return 400 when field is missing', async () => {
  mockRequest.body = { /* missing field */ };
  
  await controller(
    mockRequest as Request,
    mockResponse as Response,
    mockNext
  );
  
  expect(mockNext).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'Missing required fields',
      statusCode: 400
    })
  );
});
```

---

## Testing Best Practices

### 1. Test Organization
```typescript
describe('ComponentName', () => {
  // Group related tests
  describe('Feature/Behavior', () => {
    // Individual test cases
    it('should do something specific', () => {
      // Arrange, Act, Assert
    });
  });
});
```

### 2. AAA Pattern
```typescript
it('should update value when input changes', () => {
  // Arrange - Set up test data and mocks
  const mockOnChange = jest.fn();
  render(<Input onChange={mockOnChange} />);
  
  // Act - Perform the action
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'new' } });
  
  // Assert - Verify the result
  expect(mockOnChange).toHaveBeenCalledWith('new');
});
```

### 3. Descriptive Test Names
```typescript
// ✅ Good
it('should show error message when API returns 400')
it('should disable submit button while loading')
it('should call onSave with formatted data')

// ❌ Bad
it('works')
it('test error')
it('button test')
```

### 4. Test One Thing
```typescript
// ✅ Good - Tests one specific behavior
it('should disable button when loading', () => {
  render(<Button loading={true} />);
  expect(screen.getByRole('button')).toBeDisabled();
});

// ❌ Bad - Tests multiple things
it('should handle loading state', () => {
  render(<Button loading={true} />);
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  // Too many assertions
});
```

### 5. Use waitFor for Async
```typescript
// ✅ Good
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// ❌ Bad
expect(screen.getByText('Loaded')).toBeInTheDocument(); // May fail if async
```

### 6. Clean Up Mocks
```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Clear mock call history
});

afterEach(() => {
  jest.restoreAllMocks(); // Restore original implementations
});
```

---

## Common Testing Patterns

### Testing Loading States
```typescript
it('should show loading indicator', () => {
  render(<Component />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

it('should hide loading after data loads', async () => {
  mockService.getData.mockResolvedValue(data);
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
```

### Testing Error States
```typescript
it('should display error message on failure', async () => {
  mockService.getData.mockRejectedValue(new Error('Failed'));
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });
});
```

### Testing Form Submission
```typescript
it('should call onSubmit with form data', async () => {
  const mockOnSubmit = jest.fn();
  render(<Form onSubmit={mockOnSubmit} />);
  
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: 'Test Name' }
  });
  
  fireEvent.click(screen.getByText(/submit/i));
  
  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Test Name'
    });
  });
});
```

### Testing Conditional Rendering
```typescript
it('should show component when condition is true', () => {
  render(<Component showDetails={true} />);
  expect(screen.getByText('Details')).toBeInTheDocument();
});

it('should hide component when condition is false', () => {
  render(<Component showDetails={false} />);
  expect(screen.queryByText('Details')).not.toBeInTheDocument();
});
```

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test GroomerSelector.test.tsx
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

---

## Test Coverage Goals

### Critical Paths: 85%+
- Authentication
- Payment processing
- Reservation creation
- Data validation

### Business Logic: 75%+
- Availability checking
- Pricing calculations
- Scheduling logic

### UI Components: 60%+
- User interactions
- Error states
- Loading states

---

## Mocking Guidelines

### When to Mock
- External API calls
- Database operations
- File system operations
- Date/time functions
- Random number generation

### When NOT to Mock
- Pure functions
- Simple utilities
- Type definitions
- Constants

### Mock Examples
```typescript
// Mock entire module
jest.mock('../services/api');

// Mock specific function
jest.spyOn(service, 'getData').mockResolvedValue(data);

// Mock with implementation
jest.mock('../utils', () => ({
  formatDate: jest.fn((date) => '2025-10-26')
}));

// Mock Date
jest.useFakeTimers();
jest.setSystemTime(new Date('2025-10-26'));
```

---

## Debugging Tests

### View Test Output
```bash
npm test -- --verbose
```

### Debug Single Test
```typescript
it.only('should do something', () => {
  // Only this test will run
});
```

### Skip Test
```typescript
it.skip('should do something', () => {
  // This test will be skipped
});
```

### Add Debug Output
```typescript
it('should work', () => {
  render(<Component />);
  screen.debug(); // Prints DOM to console
});
```

---

## Common Issues

### Issue: "Unable to find element"
**Solution**: Use `waitFor` for async operations
```typescript
await waitFor(() => {
  expect(screen.getByText('Text')).toBeInTheDocument();
});
```

### Issue: "Act warning"
**Solution**: Wrap state updates in `act` or use `waitFor`
```typescript
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled();
});
```

### Issue: "Mock not being called"
**Solution**: Verify mock setup and clear between tests
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

---

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

### Reference Tests
- `/frontend/src/components/reservations/__tests__/GroomerSelector.test.tsx`
- `/frontend/src/pages/training/__tests__/TrainingClasses.validation.test.tsx`
- `/services/customer/src/controllers/__tests__/trainingClass.controller.test.ts`

---

## Next Steps

1. Review reference tests
2. Write tests for new features
3. Maintain test coverage above goals
4. Update this guide with new patterns

---

**Remember**: Tests are documentation. Write them to help future developers understand how the code should work!
