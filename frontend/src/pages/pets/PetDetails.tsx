import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Box,
  Paper,
  Button,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material/Select';
import { Pet, petService } from '../../services/petService';
import { customerService } from '../../services/customerService';

const PetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewPet = id === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [pet, setPet] = useState<Omit<Pet, 'id' | 'createdAt' | 'updatedAt' | 'medicalRecords' | 'vaccineStatus'>>({
    name: '',
    type: 'DOG',
    breed: null,
    color: null,
    birthdate: null,
    weight: null,
    gender: null,
    isNeutered: false,
    microchipNumber: null,
    specialNeeds: null,
    behaviorNotes: null,
    customerId: '',
    isActive: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load customers for the dropdown
        const customersData = await customerService.getAllCustomers();
        setCustomers(customersData);

        if (!isNewPet) {
          const petData = await petService.getPetById(id!);
          setPet(petData);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isNewPet]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name) {
      setPet(prev => ({
        ...prev,
        [name]: name === 'weight' ? (value ? parseFloat(value) : null) : value
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setPet(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPet(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!pet.name || !pet.customerId) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error'
        });
        return;
      }

      // Clean up the data before sending
      const cleanPetData = {
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        color: pet.color,
        birthdate: pet.birthdate,
        weight: pet.weight,
        gender: pet.gender,
        isNeutered: pet.isNeutered,
        microchipNumber: pet.microchipNumber,
        specialNeeds: pet.specialNeeds,
        behaviorNotes: pet.behaviorNotes,
        customerId: pet.customerId,
        isActive: pet.isActive
      };

      if (isNewPet) {
        await petService.createPet(cleanPetData as Omit<Pet, 'id'>);
      } else {
        await petService.updatePet(id!, cleanPetData);
      }

      setSnackbar({
        open: true,
        message: `Pet ${isNewPet ? 'created' : 'updated'} successfully`,
        severity: 'success'
      });

      // Navigate back to pets list after successful save
      navigate('/pets');
    } catch (err) {
      console.error('Error saving pet:', err);
      setSnackbar({
        open: true,
        message: `Error ${isNewPet ? 'creating' : 'updating'} pet`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isNewPet ? 'New Pet' : pet.name}
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <FormControl fullWidth required>
              <TextField
                label="Name"
                name="name"
                value={pet.name || ''}
                onChange={handleTextChange}
                required
              />
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={pet.type || 'DOG'}
                label="Type"
                onChange={handleSelectChange}
              >
                <MenuItem value="DOG">Dog</MenuItem>
                <MenuItem value="CAT">Cat</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Breed"
                name="breed"
                value={pet.breed || ''}
                onChange={handleTextChange}
              />
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Color"
                name="color"
                value={pet.color || ''}
                onChange={handleTextChange}
              />
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Weight (lbs)"
                name="weight"
                type="number"
                value={pet.weight || ''}
                onChange={handleTextChange}
              />
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Birthdate"
                name="birthdate"
                type="date"
                value={pet.birthdate || ''}
                onChange={handleTextChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={pet.gender || ''}
                label="Gender"
                onChange={handleSelectChange}
              >
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Microchip Number"
                name="microchipNumber"
                value={pet.microchipNumber || ''}
                onChange={handleTextChange}
              />
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={pet.isNeutered || false}
                  onChange={handleCheckboxChange}
                  name="isNeutered"
                />
              }
              label="Neutered/Spayed"
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Owner Information</Typography>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Owner</InputLabel>
              <Select
                name="customerId"
                value={pet.customerId || ''}
                label="Owner"
                onChange={handleSelectChange}
              >
                {customers.map(customer => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {`${customer.firstName} ${customer.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Additional Information</Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <FormControl fullWidth>
              <TextField
                label="Special Needs"
                name="specialNeeds"
                value={pet.specialNeeds || ''}
                onChange={handleTextChange}
                multiline
                rows={2}
              />
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Behavior Notes"
                name="behaviorNotes"
                value={pet.behaviorNotes || ''}
                onChange={handleTextChange}
                multiline
                rows={2}
              />
            </FormControl>
          </Box>
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : (isNewPet ? 'Create Pet' : 'Save Changes')}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/pets')}
            disabled={saving}
          >
            Cancel
          </Button>
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
      </Box>
    </Container>
  );
};

export default PetDetails;
