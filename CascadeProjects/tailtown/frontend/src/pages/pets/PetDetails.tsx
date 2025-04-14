import React from 'react';
import { Typography, Container, Box, Paper, Button, Chip, Divider } from '@mui/material';
import { useParams } from 'react-router-dom';

const PetDetails = () => {
  const { id } = useParams<{ id: string }>();

  // This would be replaced with actual API call
  const mockPet = {
    id: id || '1',
    name: 'Buddy',
    type: 'DOG',
    breed: 'Golden Retriever',
    color: 'Golden',
    birthdate: '2019-05-15',
    weight: 65.5,
    gender: 'MALE',
    isNeutered: true,
    microchipNumber: '985112345678903',
    vaccineStatus: {
      rabies: { status: 'CURRENT', expirationDate: '2024-06-10' },
      distemper: { status: 'CURRENT', expirationDate: '2024-03-22' },
      bordetella: { status: 'CURRENT', expirationDate: '2023-12-15' }
    },
    owner: {
      id: '101',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567'
    },
    specialNeeds: 'Allergic to chicken',
    behaviorNotes: 'Friendly with other dogs, but cautious around new people'
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {mockPet.name}
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle1">Type</Typography>
              <Typography variant="body1">{mockPet.type}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">Breed</Typography>
              <Typography variant="body1">{mockPet.breed}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">Color</Typography>
              <Typography variant="body1">{mockPet.color}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">Weight</Typography>
              <Typography variant="body1">{mockPet.weight} lbs</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">Birthdate</Typography>
              <Typography variant="body1">{mockPet.birthdate}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">Gender</Typography>
              <Typography variant="body1">{mockPet.gender} ({mockPet.isNeutered ? 'Neutered' : 'Not Neutered'})</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">Microchip</Typography>
              <Typography variant="body1">{mockPet.microchipNumber || 'None'}</Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Owner Information</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle1">Name</Typography>
              <Typography variant="body1">{mockPet.owner.firstName} {mockPet.owner.lastName}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">Contact</Typography>
              <Typography variant="body1">{mockPet.owner.email} | {mockPet.owner.phone}</Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Health Information</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Vaccination Status</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(mockPet.vaccineStatus).map(([vaccine, data]) => (
                <Chip 
                  key={vaccine}
                  label={`${vaccine}: ${data.status} (Exp: ${data.expirationDate})`} 
                  color={data.status === 'CURRENT' ? 'success' : 'error'}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1">Special Needs</Typography>
              <Typography variant="body1">{mockPet.specialNeeds || 'None'}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">Behavior Notes</Typography>
              <Typography variant="body1">{mockPet.behaviorNotes || 'None'}</Typography>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary">
            Edit Pet Information
          </Button>
          <Button variant="outlined">
            Add Medical Record
          </Button>
          <Button variant="outlined" color="secondary">
            Back to Pets
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PetDetails;
