import React from 'react';
import { Typography, Container, Box, Button, Paper } from '@mui/material';

const Pets = () => {
  // Mock data for display purposes
  const mockPets = [
    { id: '1', name: 'Buddy', type: 'DOG', breed: 'Golden Retriever', owner: 'John Doe' },
    { id: '2', name: 'Whiskers', type: 'CAT', breed: 'Siamese', owner: 'Jane Smith' }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Pets
          </Typography>
          <Button variant="contained" color="primary">
            Add New Pet
          </Button>
        </Box>
        
        <Paper elevation={3}>
          <Box sx={{ p: 2 }}>
            {mockPets.length === 0 ? (
              <Typography variant="body1">No pets registered</Typography>
            ) : (
              <Box sx={{ display: 'grid', gap: 2 }}>
                {mockPets.map(pet => (
                  <Paper key={pet.id} elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6">{pet.name}</Typography>
                    <Typography variant="body1">Type: {pet.type}</Typography>
                    <Typography variant="body1">Breed: {pet.breed}</Typography>
                    <Typography variant="body1">Owner: {pet.owner}</Typography>
                    <Button variant="text" color="primary" sx={{ mt: 1 }}>
                      View Details
                    </Button>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Pets;
