import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent,
  CardHeader,
  Divider,
  Grid
} from '@mui/material';
import ErrorDisplay from '../common/ErrorDisplay';
import useApiError from '../../hooks/useApiError';
import { handleApiError } from '../../utils/errorHandling';
import axios from 'axios';

/**
 * Example component demonstrating how to use the error handling system
 * This is for educational purposes only and should not be included in production
 */
const ErrorHandlingDemo: React.FC = () => {
  const { errorMessage, errorDetails, handleError, clearError } = useApiError();
  const [basicError, setBasicError] = useState<string | null>(null);
  
  // Simulate various error scenarios
  const simulateAxiosError = async () => {
    try {
      // This will fail with a 404 error
      await axios.get('https://api.example.com/nonexistent');
    } catch (error) {
      handleError(error, 'axios-demo');
    }
  };
  
  const simulateNetworkError = async () => {
    try {
      // This will fail with a network error (invalid URL)
      await axios.get('https://nonexistentdomain12345.example');
    } catch (error) {
      handleError(error, 'network-demo');
    }
  };
  
  const simulateJsError = () => {
    try {
      // This will throw a TypeError
      const obj: any = null;
      obj.someProperty = 'test';
    } catch (error) {
      handleError(error, 'js-error-demo');
    }
  };
  
  const simulateCustomError = () => {
    const customError = new Error('This is a custom error message');
    handleError(customError, 'custom-error-demo');
  };
  
  const simulateBasicError = () => {
    setBasicError('This is a basic error message set directly in state');
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Error Handling System Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This page demonstrates the various error handling capabilities available in the application.
        Click the buttons below to simulate different error scenarios.
      </Typography>
      
      {/* Display errors from useApiError hook */}
      {errorMessage && (
        <Box sx={{ mb: 4 }}>
          <ErrorDisplay 
            error={errorDetails || errorMessage} 
            variant="box" 
            onDismiss={clearError} 
          />
        </Box>
      )}
      
      {/* Display basic error */}
      {basicError && (
        <Box sx={{ mb: 4 }}>
          <ErrorDisplay 
            error={basicError} 
            variant="alert" 
            onDismiss={() => setBasicError(null)} 
          />
        </Box>
      )}
      
      {/* Demo Cards */}
      <Grid container spacing={3}>
        {/* useApiError Hook Demo */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="useApiError Hook" />
            <Divider />
            <CardContent>
              <Typography variant="body2" paragraph>
                The <code>useApiError</code> hook provides error state management and standardized error handling.
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={simulateAxiosError}
                >
                  Simulate API Error (404)
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={simulateNetworkError}
                >
                  Simulate Network Error
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={simulateJsError}
                >
                  Simulate JavaScript Error
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={simulateCustomError}
                >
                  Simulate Custom Error
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={clearError}
                >
                  Clear Error
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* ErrorDisplay Component Demo */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="ErrorDisplay Component" />
            <Divider />
            <CardContent>
              <Typography variant="body2" paragraph>
                The <code>ErrorDisplay</code> component provides consistent error presentation with multiple variants.
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={simulateBasicError}
                >
                  Show Basic Error
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => setBasicError(null)}
                >
                  Clear Basic Error
                </Button>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Error Display Variants:
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Alert Variant:</Typography>
                  <ErrorDisplay 
                    error="This is an example alert error"
                    variant="alert"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Box Variant:</Typography>
                  <ErrorDisplay 
                    error={{
                      message: "This is an example box error with details",
                      code: "EXAMPLE_ERROR",
                      statusCode: 400,
                      context: "example"
                    }}
                    variant="box"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Inline Variant:</Typography>
                  <ErrorDisplay 
                    error="This is an inline error message"
                    variant="inline"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Minimal Variant:</Typography>
                  <ErrorDisplay 
                    error="This is a minimal error message"
                    variant="minimal"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Warning Severity:</Typography>
                  <ErrorDisplay 
                    error="This is a warning message"
                    variant="alert"
                    severity="warning"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Implementation Guide */}
      <Card sx={{ mt: 4 }}>
        <CardHeader title="Implementation Guide" />
        <Divider />
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            How to use in your components:
          </Typography>
          
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, my: 2, overflow: 'auto' }}>
            <pre style={{ margin: 0 }}>
              {`// 1. Import the hook
import useApiError from '../../hooks/useApiError';
import ErrorDisplay from '../common/ErrorDisplay';

// 2. Use the hook in your component
const YourComponent = () => {
  const { errorMessage, errorDetails, handleError, clearError } = useApiError();
  
  // 3. Use in async functions
  const fetchData = async () => {
    try {
      const response = await api.get('/endpoint');
      // Handle success
    } catch (error) {
      handleError(error, 'fetch-data');
      // No need to set error state manually
    }
  };
  
  return (
    <div>
      {/* 4. Display errors with the ErrorDisplay component */}
      {errorMessage && (
        <ErrorDisplay 
          error={errorDetails || errorMessage} 
          variant="alert" 
          onDismiss={clearError} 
          onRetry={fetchData}
        />
      )}
      
      {/* Rest of your component */}
    </div>
  );
};`}
            </pre>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ErrorHandlingDemo;
