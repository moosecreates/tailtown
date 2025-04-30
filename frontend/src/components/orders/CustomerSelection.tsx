import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Autocomplete,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PetsIcon from '@mui/icons-material/Pets';
import { customerService, Customer } from '../../services/customerService';
import { petService, Pet } from '../../services/petService';
import { useNavigate } from 'react-router-dom';

interface CustomerSelectionProps {
  onContinue: (customer: Customer, pet: Pet) => void;
  initialCustomer: Customer | null;
  initialPet: Pet | null;
}

const CustomerSelection: React.FC<CustomerSelectionProps> = ({
  onContinue,
  initialCustomer,
  initialPet,
}) => {
  const navigate = useNavigate();
  
  // State for customer selection
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomer);
  const [loading, setLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  
  // State for pet selection
  const [customerPets, setCustomerPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(initialPet);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petError, setPetError] = useState<string | null>(null);

  // Load customers when search query changes
  useEffect(() => {
    const loadCustomers = async () => {
      if (searchQuery.length < 2) {
        setCustomers([]);
        return;
      }
      
      try {
        setLoading(true);
        setCustomerError(null);
        const response = await customerService.searchCustomers(searchQuery);
        setCustomers(response.data || []);
      } catch (error) {
        console.error('Error loading customers:', error);
        setCustomerError('Failed to load customers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [searchQuery]);

  // Load pets when customer is selected
  useEffect(() => {
    const loadPets = async () => {
      if (!selectedCustomer) {
        setCustomerPets([]);
        setSelectedPet(null);
        return;
      }
      
      try {
        setPetsLoading(true);
        setPetError(null);
        const response = await petService.getPetsByCustomer(selectedCustomer.id);
        setCustomerPets(response.data || []);
        
        // If there's only one pet, select it automatically
        if (response.data?.length === 1) {
          setSelectedPet(response.data[0]);
        } else if (initialPet && response.data?.some(pet => pet.id === initialPet.id)) {
          setSelectedPet(initialPet);
        } else {
          setSelectedPet(null);
        }
      } catch (error) {
        console.error('Error loading pets:', error);
        setPetError('Failed to load pets. Please try again.');
      } finally {
        setPetsLoading(false);
      }
    };

    loadPets();
  }, [selectedCustomer, initialPet]);

  // Handle customer selection
  const handleCustomerChange = (event: React.SyntheticEvent, value: Customer | null) => {
    setSelectedCustomer(value);
  };

  // Handle pet selection
  const handlePetChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const petId = event.target.value as string;
    const pet = customerPets.find(p => p.id === petId) || null;
    setSelectedPet(pet);
  };

  // Handle continuing to next step
  const handleContinue = () => {
    if (selectedCustomer && selectedPet) {
      onContinue(selectedCustomer, selectedPet);
    } else {
      if (!selectedCustomer) {
        setCustomerError('Please select a customer');
      }
      if (!selectedPet) {
        setPetError('Please select a pet');
      }
    }
  };

  // Handle creating a new customer
  const handleCreateCustomer = () => {
    navigate('/customers/new?redirect=/orders/new');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Customer & Pet Information
      </Typography>
      
      {customerError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {customerError}
        </Alert>
      )}
      
      {petError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {petError}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Customer
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <Autocomplete
              id="customer-select"
              options={customers}
              value={selectedCustomer}
              onChange={handleCustomerChange}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Search Customers" 
                  variant="outlined"
                  size="small"
                  fullWidth
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  helperText="Search by name, email, or phone"
                />
              )}
              loading={loading}
              loadingText="Searching customers..."
              noOptionsText="No customers found"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={handleCreateCustomer}
              fullWidth
            >
              New Customer
            </Button>
          </Grid>
        </Grid>
        
        {selectedCustomer && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2">
              {selectedCustomer.firstName} {selectedCustomer.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: {selectedCustomer.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: {selectedCustomer.phone || 'N/A'}
            </Typography>
            {selectedCustomer.address && (
              <Typography variant="body2" color="text.secondary">
                Address: {selectedCustomer.address}, {selectedCustomer.city || ''} {selectedCustomer.state || ''} {selectedCustomer.zipCode || ''}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Pet
        </Typography>
        
        <FormControl fullWidth size="small" disabled={!selectedCustomer || petsLoading}>
          <InputLabel id="pet-select-label">Select Pet</InputLabel>
          <Select
            labelId="pet-select-label"
            id="pet-select"
            value={selectedPet?.id || ''}
            label="Select Pet"
            onChange={handlePetChange as any}
            startAdornment={
              <InputAdornment position="start">
                <PetsIcon />
              </InputAdornment>
            }
            endAdornment={
              petsLoading ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : null
            }
          >
            {customerPets.map((pet) => (
              <MenuItem key={pet.id} value={pet.id}>
                {pet.name} ({pet.type.toLowerCase()})
                {pet.breed ? ` - ${pet.breed}` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {selectedPet && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2">
              {selectedPet.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Type: {selectedPet.type}
              {selectedPet.breed ? `, Breed: ${selectedPet.breed}` : ''}
            </Typography>
            {selectedPet.gender && (
              <Typography variant="body2" color="text.secondary">
                Gender: {selectedPet.gender}
                {selectedPet.isNeutered ? ' (Neutered/Spayed)' : ''}
              </Typography>
            )}
            {selectedPet.specialNeeds && (
              <Typography variant="body2" color="text.secondary">
                Special Needs: {selectedPet.specialNeeds}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleContinue}
          disabled={!selectedCustomer || !selectedPet}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default CustomerSelection;
