/**
 * PetSelection - Step 3: Select pets for booking
 * Mobile-optimized pet selection with customer search
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Autocomplete,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Pets as PetsIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { customerService } from '../../../services/customerService';
import { petService, Pet } from '../../../services/petService';

interface PetSelectionProps {
  bookingData: any;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: any) => void;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

const PetSelection: React.FC<PetSelectionProps> = ({
  bookingData,
  onNext,
  onBack,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPets, setCustomerPets] = useState<Pet[]>([]);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>(bookingData.petIds || []);
  const [loadingPets, setLoadingPets] = useState(false);

  // Search customers
  const handleSearchCustomers = async (query: string) => {
    if (!query || query.length < 2) {
      setCustomers([]);
      return;
    }

    try {
      setLoading(true);
      const response = await customerService.searchCustomers(query, 1, 10);
      setCustomers(response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Error searching customers:', err);
      setError('Unable to search customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load customer's pets
  const loadCustomerPets = async (customerId: string) => {
    try {
      setLoadingPets(true);
      const response = await petService.getPetsByCustomer(customerId);
      const pets = response.data || [];
      setCustomerPets(pets.filter((pet: Pet) => pet.isActive));
      setError('');
    } catch (err: any) {
      console.error('Error loading pets:', err);
      setError('Unable to load pets. Please try again.');
      setCustomerPets([]);
    } finally {
      setLoadingPets(false);
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setSelectedPetIds([]);
    if (customer) {
      loadCustomerPets(customer.id);
      onUpdate({
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
        customerPhone: customer.phone
      });
    } else {
      setCustomerPets([]);
    }
  };

  // Toggle pet selection
  const handlePetToggle = (petId: string) => {
    setSelectedPetIds(prev => {
      const newSelection = prev.includes(petId)
        ? prev.filter(id => id !== petId)
        : [...prev, petId];
      
      onUpdate({ petIds: newSelection });
      return newSelection;
    });
  };

  const handleContinue = () => {
    if (selectedPetIds.length === 0) {
      setError('Please select at least one pet');
      return;
    }
    onNext();
  };

  const getPetTypeIcon = (type: string) => {
    return type === 'DOG' ? '🐕' : type === 'CAT' ? '🐈' : '🐾';
  };

  return (
    <Box>
      <Typography 
        variant="h5" 
        component="h2"
        gutterBottom
        sx={{
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          fontWeight: 600,
          mb: 3
        }}
      >
        Select Your Pets
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Customer Search */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Find Your Account
        </Typography>
        <Autocomplete
          options={customers}
          getOptionLabel={(option) => 
            `${option.firstName} ${option.lastName} - ${option.email}`
          }
          value={selectedCustomer}
          onChange={(_, newValue) => handleCustomerSelect(newValue)}
          onInputChange={(_, newValue) => {
            setSearchQuery(newValue);
            handleSearchCustomers(newValue);
          }}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search by name, email, or phone"
              placeholder="Start typing to search..."
              InputProps={{
                ...params.InputProps,
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body1">
                  {option.firstName} {option.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.email} • {option.phone}
                </Typography>
              </Box>
            </Box>
          )}
        />
      </Box>

      {/* Selected Customer Info */}
      {selectedCustomer && (
        <Card sx={{ mb: 3, bgcolor: 'primary.50', borderLeft: '4px solid', borderColor: 'primary.main' }}>
          <CardContent>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Booking for:
            </Typography>
            <Typography variant="h6">
              {selectedCustomer.firstName} {selectedCustomer.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedCustomer.email} • {selectedCustomer.phone}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Pet Selection */}
      {selectedCustomer && (
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Select Pets ({selectedPetIds.length} selected)
          </Typography>

          {loadingPets ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : customerPets.length === 0 ? (
            <Alert severity="info">
              No active pets found for this customer. Please add pets to the customer account first.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {customerPets.map((pet) => (
                <Grid item xs={12} sm={6} md={4} key={pet.id}>
                  <Card
                    elevation={selectedPetIds.includes(pet.id) ? 8 : 2}
                    sx={{
                      height: '100%',
                      border: selectedPetIds.includes(pet.id)
                        ? '3px solid'
                        : '1px solid',
                      borderColor: selectedPetIds.includes(pet.id)
                        ? 'primary.main'
                        : 'divider',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardActionArea
                      onClick={() => handlePetToggle(pet.id)}
                      sx={{ height: '100%' }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: 'primary.main',
                              fontSize: '2rem',
                              mr: 2
                            }}
                          >
                            {getPetTypeIcon(pet.type)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" component="h3">
                              {pet.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {pet.breed || pet.type}
                            </Typography>
                          </Box>
                          {selectedPetIds.includes(pet.id) && (
                            <CheckCircleIcon color="primary" sx={{ fontSize: 32 }} />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={pet.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {pet.gender && (
                            <Chip
                              label={pet.gender}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {pet.weight && (
                            <Chip
                              label={`${pet.weight} lbs`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        {pet.specialNeeds && (
                          <Typography
                            variant="caption"
                            color="warning.main"
                            sx={{ display: 'block', mt: 1, fontWeight: 600 }}
                          >
                            ⚠️ Special needs
                          </Typography>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* No Customer Selected State */}
      {!selectedCustomer && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary'
          }}
        >
          <PetsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom>
            Search for a customer to see their pets
          </Typography>
          <Typography variant="body2">
            Use the search box above to find a customer account
          </Typography>
        </Box>
      )}

      {/* Navigation Buttons - Fixed on mobile */}
      <Box
        sx={{
          position: { xs: 'fixed', sm: 'static' },
          bottom: { xs: 0, sm: 'auto' },
          left: { xs: 0, sm: 'auto' },
          right: { xs: 0, sm: 'auto' },
          p: { xs: 2, sm: 0 },
          mt: { xs: 0, sm: 4 },
          bgcolor: { xs: 'background.paper', sm: 'transparent' },
          boxShadow: { xs: '0 -2px 10px rgba(0,0,0,0.1)', sm: 'none' },
          zIndex: { xs: 1000, sm: 'auto' },
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Button
          variant="outlined"
          size="large"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{ py: { xs: 1.5, sm: 1.5 } }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleContinue}
          disabled={selectedPetIds.length === 0}
          endIcon={<ArrowForwardIcon />}
          sx={{ py: { xs: 1.5, sm: 1.5 } }}
        >
          Continue to Add-Ons
        </Button>
      </Box>

      {/* Spacer for fixed button on mobile */}
      {selectedCustomer && (
        <Box sx={{ display: { xs: 'block', sm: 'none' }, height: 80 }} />
      )}
    </Box>
  );
};

export default PetSelection;
