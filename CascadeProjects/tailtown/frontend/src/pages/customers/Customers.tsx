import React from 'react';
import { Typography, Container, Box, Button } from '@mui/material';

const Customers = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Customers
        </Typography>
        <Typography variant="body1">
          This page will list all customers at Tailtown Pet Resort.
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Add New Customer
        </Button>
      </Box>
    </Container>
  );
};

export default Customers;
