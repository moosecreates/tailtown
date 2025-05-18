import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Avatar,
  Checkbox,
  FormControlLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Alert,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PetsIcon from '@mui/icons-material/Pets';
import { useReservationWizard } from '../ReservationWizard';
import { customerService } from '../../../../services/customerService';
import { petService } from '../../../../services/petService';
import { Customer } from '../../../../types/customer';
import { Pet } from '../../../../types/pet';

/**
 * Customer & Pet Selection Step
 * 
 * First step in the reservation wizard where the user selects a customer
 * and one or more pets for the reservation.
 */
const CustomerPetSelectionStep: React.FC = () => {
  const { formData, dispatch } = useReservationWizard();
  const { customer, pets, selectedPets } = formData;

  // Local state for customer search
  const [customerInput, setCustomerInput] = useState('');
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  // Effect to search for customers when input changes
  useEffect(() => {
    if (customerInput.length < 2) {
      setCustomerOptions([]);
      return;
    }

    let active = true;
    setCustomerLoading(true);

    const searchCustomers = async () => {
      try {
        const response = await customerService.searchCustomers(customerInput);
        if (active) {
          setCustomerOptions(response.data || []);
        }
      } catch (error) {
        console.error('Error searching customers:', error);
      } finally {
        if (active) {
          setCustomerLoading(false);
        }
      }
    };

    searchCustomers();

    return () => {
      active = false;
    };
  }, [customerInput]);

  // Effect to load customer's pets when a customer is selected
  useEffect(() => {
    if (!customer) {
      dispatch({ type: 'SET_PETS', payload: [] });
      dispatch({ type: 'SET_SELECTED_PETS', payload: [] });
      return;
    }

    const loadPets = async () => {
      try {
        const response = await petService.getPetsByCustomer(customer.id);
        const petData = response.data || [];
        dispatch({ type: 'SET_PETS', payload: petData });
        
        // If we already had selected pets, filter to keep only valid ones
        if (selectedPets.length > 0) {
          const validPetIds = petData.map(p => p.id);
          const newSelectedPets = selectedPets.filter(id => validPetIds.includes(id));
          dispatch({ type: 'SET_SELECTED_PETS', payload: newSelectedPets });
        }
      } catch (error) {
        console.error('Error loading pets:', error);
      }
    };

    loadPets();
  }, [customer, dispatch, selectedPets]);

  // Handle customer selection
  const handleCustomerChange = (event: any, newCustomer: Customer | null) => {
    dispatch({ type: 'SET_CUSTOMER', payload: newCustomer });
  };

  // Handle pet selection
  const handlePetSelection = (petId: string) => {
    if (selectedPets.includes(petId)) {
      // Remove pet if already selected
      dispatch({
        type: 'SET_SELECTED_PETS',
        payload: selectedPets.filter(id => id !== petId)
      });
    } else {
      // Add pet to selection
      dispatch({
        type: 'SET_SELECTED_PETS',
        payload: [...selectedPets, petId]
      });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Customer & Pets
      </Typography>

      {/* Customer search */}
      <Autocomplete
        id="customer-search"
        options={customerOptions}
        getOptionLabel={(option: Customer) => 
          `${option.firstName} ${option.lastName} - ${option.email}`
        }
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={handleCustomerChange}
        onInputChange={(event, newInputValue) => setCustomerInput(newInputValue)}
        value={customer}
        loading={customerLoading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Customer"
            variant="outlined"
            placeholder="Start typing to search (min. 2 characters)"
            fullWidth
            required
            size="small"
            margin="normal"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {customerLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Customer details */}
      {customer && (
        <Card variant="outlined" sx={{ mt: 2, mb: 3 }}>
          <CardHeader
            avatar={
              <Avatar>
                {customer.firstName.charAt(0)}
                {customer.lastName.charAt(0)}
              </Avatar>
            }
            title={`${customer.firstName} ${customer.lastName}`}
            subheader={customer.email}
          />
          <CardContent sx={{ pt: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Phone:</strong> {customer.phone || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Address:</strong>{' '}
                  {customer.address
                    ? `${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode}`
                    : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary">
              Edit Customer Info
            </Button>
          </CardActions>
        </Card>
      )}

      {/* Pet selection */}
      {customer && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Select Pets for This Reservation
          </Typography>
          
          {pets.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No pets found for this customer. 
              <Button 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }}
              >
                Add New Pet
              </Button>
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {pets.map((pet) => (
                  <Grid item xs={12} sm={6} md={4} key={pet.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderColor: selectedPets.includes(pet.id) 
                          ? 'primary.main' 
                          : 'divider',
                        bgcolor: selectedPets.includes(pet.id) 
                          ? 'action.selected' 
                          : 'background.paper'
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <PetsIcon />
                          </Avatar>
                        }
                        action={
                          <Checkbox
                            checked={selectedPets.includes(pet.id)}
                            onChange={() => handlePetSelection(pet.id)}
                            inputProps={{ 'aria-label': `Select pet ${pet.name}` }}
                          />
                        }
                        title={pet.name}
                        subheader={`${pet.breed || 'Unknown Breed'} (${pet.type})`}
                      />
                      <CardContent sx={{ pt: 0 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Weight:</strong> {pet.weight ? `${pet.weight} lbs` : 'N/A'}
                        </Typography>
                        {pet.allergies && (
                          <Chip 
                            label={`Allergies: ${pet.allergies}`} 
                            size="small" 
                            color="warning" 
                            sx={{ mt: 1 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}

      {/* Selected pets summary */}
      {selectedPets.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Divider />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Selected Pets ({selectedPets.length})
          </Typography>
          <List dense>
            {selectedPets.map((petId) => {
              const pet = pets.find(p => p.id === petId);
              if (!pet) return null;
              
              return (
                <ListItem key={pet.id}>
                  <ListItemIcon>
                    <PetsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={pet.name} 
                    secondary={`${pet.breed || 'Unknown Breed'} (${pet.type})`} 
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default CustomerPetSelectionStep;
