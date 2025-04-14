import React from 'react';
import { Typography, Container, Box, Paper, Button } from '@mui/material';
import { useParams } from 'react-router-dom';

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();

  // This would be replaced with actual API call
  const mockCustomer = {
    id: id || '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    pets: []
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Customer Details
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle1">Name</Typography>
                <Typography variant="body1">{mockCustomer.firstName} {mockCustomer.lastName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1">Email</Typography>
                <Typography variant="body1">{mockCustomer.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1">Phone</Typography>
                <Typography variant="body1">{mockCustomer.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1">Address</Typography>
                <Typography variant="body1">
                  {mockCustomer.address}, {mockCustomer.city}, {mockCustomer.state} {mockCustomer.zipCode}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Typography variant="h5" gutterBottom>
          Pets
        </Typography>
        {mockCustomer.pets.length === 0 ? (
          <Typography variant="body1">No pets registered</Typography>
        ) : (
          <Paper elevation={3} sx={{ p: 3 }}>
            {/* Pet list would go here */}
            <Typography variant="body1">Pet list will be displayed here</Typography>
          </Paper>
        )}

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary">
            Edit Customer
          </Button>
          <Button variant="outlined" color="secondary">
            Back to Customers
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CustomerDetails;
