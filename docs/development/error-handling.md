# Error Handling Guide

This guide explains how to use the standardized error handling system in the Tailtown application.

## Overview

The error handling system provides:

1. **Standardized error processing** with `handleApiError`
2. **React hook integration** with `useApiError`
3. **Consistent error display** with `ErrorDisplay` component
4. **Type safety** with the `AppError` interface

## Usage Guide

### Basic Error Handling in React Components

```tsx
import useApiError from '../../hooks/useApiError';
import ErrorDisplay from '../common/ErrorDisplay';

const YourComponent: React.FC = () => {
  const { errorMessage, errorDetails, handleError, clearError } = useApiError();
  
  // Fetch data with error handling
  const fetchData = async () => {
    try {
      const response = await api.get('/endpoint');
      // Handle success...
    } catch (error) {
      handleError(error, 'fetch-data');
    }
  };
  
  return (
    <div>
      {/* Display errors */}
      {errorMessage && (
        <ErrorDisplay 
          error={errorDetails || errorMessage} 
          variant="alert" 
          onDismiss={clearError} 
          onRetry={fetchData}
        />
      )}
      
      <button onClick={fetchData}>Fetch Data</button>
    </div>
  );
};
```

### Error Display Variants

The `ErrorDisplay` component offers several presentation options:

1. **alert** - Standard Material-UI Alert with title and actions
2. **box** - Detailed box with error details and action buttons
3. **inline** - Compact inline error message with optional retry
4. **minimal** - Simple text-only error message

### Using with Service Functions

For API service modules, use the `withErrorHandling` utility:

```typescript
import { withErrorHandling } from '../utils/errorHandling';

export const customerService = {
  getAllCustomers: withErrorHandling(
    async (page = 1, limit = 10) => {
      const response = await api.get('/api/customers', {
        params: { page, limit }
      });
      return response.data;
    },
    'customer-service'
  ),
  
  // Other methods...
};
```

### Direct Error Processing

You can also use the error handling utilities directly:

```typescript
import { handleApiError } from '../utils/errorHandling';

try {
  // Some code that might throw
} catch (error) {
  const appError = handleApiError(error, 'context-name');
  console.log(appError.message);
  console.log(appError.statusCode);
  
  // You can also re-throw if needed
  throw appError;
}
```

## AppError Interface

The `AppError` interface standardizes error objects:

```typescript
interface AppError {
  message: string;       // User-friendly message
  code?: string;         // Error code
  context?: string;      // Where the error occurred
  originalError?: any;   // Original error object
  statusCode?: number;   // HTTP status code (for API errors)
  details?: any;         // Additional error details
}
```

## Error Display Props

The `ErrorDisplay` component accepts these props:

```typescript
interface ErrorDisplayProps {
  error?: string | AppError | null;  // Error message or object
  variant?: 'alert' | 'box' | 'inline' | 'minimal';  // Display style
  severity?: 'error' | 'warning' | 'info' | 'success';  // Error severity
  onRetry?: () => void;  // Function to call on retry
  onDismiss?: () => void;  // Function to clear the error
}
```

## Best Practices

1. Use `useApiError` hook in React components that make API calls
2. Display errors with the `ErrorDisplay` component for consistency
3. Provide retry and dismiss handlers when appropriate
4. Include meaningful context names for better error tracking
5. For service modules, use `withErrorHandling` wrapper
6. Always log errors to the console for debugging

## Implementation Example

See the `ErrorHandlingDemo` component for a complete example of all features.
