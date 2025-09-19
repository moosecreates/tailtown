import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Alert, Grid } from '@mui/material';
import { reservationApi as api } from '../../services/api';
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';

/**
 * Simple component to test suite availability API
 */
const SuiteAvailabilityTester: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suites, setSuites] = useState<any[]>([]);
  const [apiUrl, setApiUrl] = useState<string>(process.env.REACT_APP_RESERVATION_API_URL || 'http://localhost:4003');
  const [date] = useState<Date>(new Date());

  const fetchSuiteAvailability = async () => {
    setLoading(true);
    setError(null);
    setSuites([]);
    
    try {
      console.log('Fetching suite availability...');
      console.log('API URL:', apiUrl);
      console.log('Date:', formatDateToYYYYMMDD(date));
      
      // Make direct API request with detailed logging
      const response = await api.get('/api/resources/availability', {
        params: {
          resourceType: 'suite',
          date: formatDateToYYYYMMDD(date),
        }
      });
      
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
      
      if (response?.data?.status === 'success' && Array.isArray(response?.data?.data)) {
        // Sort suites by type and number
        const sortedSuites = [...response.data.data].sort((a, b) => {
          // First sort by type
          const typeOrder: Record<string, number> = {
            'VIP_SUITE': 1,
            'STANDARD_PLUS_SUITE': 2,
            'STANDARD_SUITE': 3
          };
          
          const typeA = a.attributes?.suiteType || '';
          const typeB = b.attributes?.suiteType || '';
          
          const typeComparison = (typeOrder[typeA] || 999) - (typeOrder[typeB] || 999);
          
          if (typeComparison !== 0) {
            return typeComparison;
          }
          
          // Then sort by suite number
          return (a.suiteNumber || 0) - (b.suiteNumber || 0);
        });
        
        console.log('Sorted suites:', sortedSuites.length);
        setSuites(sortedSuites);
      } else if (response?.data?.resources && Array.isArray(response?.data?.resources)) {
        // Alternative response format
        console.log('Using alternative response format');
        setSuites(response.data.resources);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Failed to load suites: Invalid response format');
      }
    } catch (err: any) {
      console.error('API request failed:', err.message);
      console.error('API error response:', err.response?.data);
      console.error('API error status:', err.response?.status);
      setError(`Failed to load suites: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suite availability on component mount
  useEffect(() => {
    fetchSuiteAvailability();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Suite Availability Tester</Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          Testing suite availability for date: <strong>{formatDateToYYYYMMDD(date)}</strong>
        </Typography>
        <Typography variant="body2">
          API URL: <strong>{apiUrl}</strong>
        </Typography>
      </Box>
      
      <Button 
        variant="contained" 
        onClick={fetchSuiteAvailability} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Refresh Suite Availability'}
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {!loading && suites.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Found {suites.length} suites
          </Typography>
          
          <Grid container spacing={2}>
            {suites.map((suite, index) => (
              <Grid item xs={12} sm={6} md={4} key={suite.id || index}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    {suite.name || suite.resourceName || `Suite ${index + 1}`}
                  </Typography>
                  <Typography variant="body2">
                    Type: {suite.type || suite.resourceType || 'Unknown'}
                  </Typography>
                  <Typography variant="body2">
                    Available: {(suite.isAvailable === true || suite.isAvailable === undefined) ? 'Yes' : 'No'}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {!loading && suites.length === 0 && !error && (
        <Alert severity="info">No suites found. Try refreshing or check the API configuration.</Alert>
      )}
    </Box>
  );
};

export default SuiteAvailabilityTester;
