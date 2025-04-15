import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Pet, petService } from '../../services/petService';

const Pets = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    const loadPets = async () => {
      try {
        const data = await petService.getAllPets();
        setPets(data);
      } catch (err) {
        console.error('Error loading pets:', err);
        setError('Failed to load pets');
      } finally {
        setLoading(false);
      }
    };

    loadPets();
  }, []);

  const handleRowClick = (id: string) => {
    navigate(`/pets/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent row click
    if (window.confirm('Are you sure you want to permanently delete this pet? This action cannot be undone.')) {
      try {
        await petService.deletePet(id);
        
        // Refresh the pet list after deletion
        const updatedPets = await petService.getAllPets();
        setPets(updatedPets);
        
        setSnackbar({
          open: true,
          message: 'Pet permanently deleted',
          severity: 'success'
        });
      } catch (err) {
        console.error('Error deleting pet:', err);
        setSnackbar({
          open: true,
          message: 'Error deleting pet. Please try again.',
          severity: 'error'
        });
        
        // Refresh list to ensure UI is in sync with backend
        const updatedPets = await petService.getAllPets();
        setPets(updatedPets);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Pets
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/pets/new')}
          >
            Add New Pet
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Breed</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No pets registered
                    </TableCell>
                  </TableRow>
                ) : (
                  pets.map(pet => (
                    <TableRow
                      key={pet.id}
                      sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                    >
                      <TableCell onClick={() => handleRowClick(pet.id)} sx={{ cursor: 'pointer' }}>
                        {pet.name}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(pet.id)} sx={{ cursor: 'pointer' }}>
                        {pet.type}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(pet.id)} sx={{ cursor: 'pointer' }}>
                        {pet.breed || 'N/A'}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(pet.id)} sx={{ cursor: 'pointer' }}>
                        {pet.gender || 'N/A'}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(pet.id)} sx={{ cursor: 'pointer' }}>
                        {pet.weight ? `${pet.weight} lbs` : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/pets/${pet.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={(e) => handleDelete(e, pet.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Pets;
