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
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PetsIcon from '@mui/icons-material/Pets';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useReservationWizard } from '../ReservationWizard';
import { customerService } from '../../../../services/customerService';
import { petService } from '../../../../services/petService';
import { serviceManagement } from '../../../../services/serviceManagement';
import { Customer } from '../../../../types/customer';
import { Pet } from '../../../../types/pet';
import { Service } from '../../../../types/service';
import { LodgingPreference } from '../../../../types/petCare';

/**
 * Customer & Pet Selection Step
 * 
 * First step in the reservation wizard where the user selects a customer
 * and one or more pets for the reservation.
 */
const CustomerPetSelectionStep: React.FC = () => {
  const { formData, dispatch } = useReservationWizard();
  const { customer, pets, selectedPets, service } = formData;

  // Local state for customer search
  const [customerInput, setCustomerInput] = useState('');
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  
  // Local state for service selection
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(true); // Start with loading state
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceReady, setServiceReady] = useState<boolean>(false); // Track when services are fully ready
  
  // State for customer edit modal
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [savingCustomer, setSavingCustomer] = useState<boolean>(false);
  
  // State for room selection
  const [manualRoomSelection, setManualRoomSelection] = useState<boolean>(false);

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

  // Effect to load available services and handle service selection
  useEffect(() => {
    const loadServices = async () => {
      // Set loading state
      setLoadingServices(true);
      setServiceError(null);
      setServiceReady(false);
      
      try {
        console.log('CustomerPetSelectionStep - Fetching services...');
        const response = await serviceManagement.getAllServices();
        console.log('CustomerPetSelectionStep - API response:', response);
        
        // Handle different response formats
        let allServices: Service[] = [];
        
        if (response && response.data) {
          // If response.data is an array, use it directly
          if (Array.isArray(response.data)) {
            allServices = response.data;
          } 
          // If response.data.data is an array (nested structure), use that
          else if (response.data.data && Array.isArray(response.data.data)) {
            allServices = response.data.data;
          }
        }
        
        console.log('CustomerPetSelectionStep - All services:', allServices);
        console.log('CustomerPetSelectionStep - Using all services without filtering');
        
        // Set services first
        setServices(allServices);
        
        // Wait for next render cycle before marking services as ready
        setTimeout(() => {
          setServiceReady(true);
          setLoadingServices(false);
          
          // Only auto-select if no service is already selected
          if (!service && allServices.length > 0) {
            console.log('CustomerPetSelectionStep - Auto-selecting first service:', allServices[0]);
            dispatch({ type: 'SET_SERVICE', payload: allServices[0] });
          }
        }, 100);
      } catch (err) {
        console.error('Error loading services:', err);
        setServiceError('Failed to load available services. Please try again.');
        setLoadingServices(false);
      }
    };

    loadServices();
    // This should only run once when component mounts
  }, []);

  // Effect to load customer's pets when a customer is selected
  useEffect(() => {
    if (!customer) {
      dispatch({ type: 'SET_PETS', payload: [] });
      dispatch({ type: 'SET_SELECTED_PETS', payload: [] });
      return;
    }

    const loadPets = async () => {
      try {
        console.log('Loading pets for customer:', customer.id);
        const response = await petService.getPetsByCustomer(customer.id);
        const petData = response.data || [];
        dispatch({ type: 'SET_PETS', payload: petData });
        
        // Auto-select the only pet if there's exactly one
        if (petData.length === 1 && selectedPets.length === 0) {
          console.log('Auto-selecting the only pet:', petData[0].name);
          dispatch({ type: 'SET_SELECTED_PETS', payload: [petData[0].id] });
        }
        // If we already had selected pets, filter to keep only valid ones
        else if (selectedPets.length > 0) {
          const validPetIds = petData.map(p => p.id);
          const newSelectedPets = selectedPets.filter(id => validPetIds.includes(id));
          
          // Only dispatch if the selection actually changed
          if (JSON.stringify(newSelectedPets) !== JSON.stringify(selectedPets)) {
            dispatch({ type: 'SET_SELECTED_PETS', payload: newSelectedPets });
          }
        }
      } catch (error) {
        console.error('Error loading pets:', error);
      }
    };

    loadPets();
  // Remove selectedPets from dependency array to prevent infinite loop
  }, [customer, dispatch]);

  // Handle customer selection
  const handleCustomerChange = (event: any, newCustomer: Customer | null) => {
    dispatch({ type: 'SET_CUSTOMER', payload: newCustomer });
  };

  // Handle pet selection
  const handlePetSelection = (petId: string) => {
    const updatedSelectedPets = [...selectedPets];
    
    if (updatedSelectedPets.includes(petId)) {
      // Remove pet if already selected
      const index = updatedSelectedPets.indexOf(petId);
      updatedSelectedPets.splice(index, 1);
    } else {
      // Add pet if not already selected
      updatedSelectedPets.push(petId);
    }
    
    dispatch({ type: 'SET_SELECTED_PETS', payload: updatedSelectedPets });
  };
  
  // Handle opening the customer edit modal
  const handleOpenEditModal = () => {
    if (customer) {
      setEditCustomer({...customer});
      setEditModalOpen(true);
    }
  };
  
  // Handle closing the customer edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditCustomer(null);
  };
  
  // Handle customer field changes in the edit modal
  const handleCustomerFieldChange = (field: string, value: string) => {
    if (editCustomer) {
      setEditCustomer({
        ...editCustomer,
        [field]: value
      });
    }
  };
  
  // Handle saving the edited customer
  const handleSaveCustomer = async () => {
    if (!editCustomer || !editCustomer.id) return;
    
    try {
      setSavingCustomer(true);
      const updatedCustomer = await customerService.updateCustomer(editCustomer.id, editCustomer);
      
      // Update the customer in the form data
      dispatch({ type: 'SET_CUSTOMER', payload: updatedCustomer });
      
      // Close the modal
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setSavingCustomer(false);
    }
  };

  // Handle service selection
  const handleServiceChange = (event: SelectChangeEvent<string>) => {
    const serviceId = event.target.value;
    const selectedService = services.find(s => s.id === serviceId);
    if (selectedService) {
      dispatch({ type: 'SET_SERVICE', payload: selectedService });
    }
  };

  // Extract suite information from form data
  const { suiteId, suiteNumber, suiteType, suiteTypeDisplay } = formData;
  
  // Get suite number and type for display
  const getSuiteInfo = () => {
    if (!suiteId) return null;
    
    // Map suite types to display names
    const suiteTypes: Record<string, string> = {
      'STANDARD_SUITE': 'Standard Suite',
      'STANDARD_PLUS_SUITE': 'Standard Plus Suite',
      'VIP_SUITE': 'VIP Suite'
    };
    
    const displayType = suiteTypeDisplay || suiteTypes[suiteType || 'STANDARD_SUITE'] || 'Suite';
    const displayNumber = suiteNumber || suiteId.split('-').pop() || '';
    
    return `${displayType} ${displayNumber}`;
  };
  
  const suiteInfo = getSuiteInfo();
  
  return (
    <Box>
      {/* Service selection section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Select Service
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Choose the boarding service for this reservation
        </Typography>
        
        {serviceError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serviceError}
          </Alert>
        )}
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="service-select-label">Service</InputLabel>
          <Select
            labelId="service-select-label"
            id="service-select"
            value={serviceReady && service?.id ? service.id : ''}
            label="Service"
            onChange={handleServiceChange}
            disabled={loadingServices || !serviceReady}
            displayEmpty
          >
            {loadingServices ? (
              <MenuItem value="">
                <CircularProgress size={20} sx={{ mr: 1 }} /> Loading...
              </MenuItem>
            ) : services.length === 0 ? (
              <MenuItem value="">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Loading boarding services...
                </Box>
              </MenuItem>
            ) : [
                <MenuItem key="placeholder" value="" disabled>
                  Select a boarding service
                </MenuItem>,
                ...services.map(svc => (
                  <MenuItem key={svc.id} value={svc.id}>
                    {svc.name} - ${svc.price.toFixed(2)} {svc.duration ? `/ ${svc.duration} mins` : 'per night'}
                  </MenuItem>
                ))
              ]            
            }
          </Select>
        </FormControl>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Suite information display */}
      {suiteInfo && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Selected Suite: <strong>{suiteInfo}</strong>
        </Alert>
      )}

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
        value={customer}
        onChange={handleCustomerChange}
        onInputChange={(event, newInputValue) => {
          setCustomerInput(newInputValue);
        }}
        loading={customerLoading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search for a customer"
            variant="outlined"
            fullWidth
            margin="normal"
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
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Phone:</strong> {customer.phone || 'N/A'}
                </Typography>
                
                <Box sx={{ 
                  mt: 1, 
                  p: 0.75, 
                  border: '1px dashed', 
                  borderColor: customer.emergencyContact ? 'warning.light' : 'error.light', 
                  borderRadius: 0.5,
                  bgcolor: customer.emergencyContact ? 'transparent' : 'rgba(255, 0, 0, 0.03)'
                }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 'medium', 
                    fontSize: '0.8rem', 
                    color: customer.emergencyContact ? 'warning.dark' : 'error.main', 
                    display: 'flex', 
                    alignItems: 'center' 
                  }}>
                    <span style={{ marginRight: '4px' }}>⚠️</span> 
                    {customer.emergencyContact ? 'Emergency Contact' : 'Emergency Contact Missing'}
                  </Typography>
                  
                  {customer.emergencyContact ? (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {customer.emergencyContact}
                        {customer.emergencyContactRelationship ? ` (${customer.emergencyContactRelationship})` : ''}
                      </Typography>
                      {customer.emergencyPhone && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Phone: {customer.emergencyPhone}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Please add emergency contact information
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Address:</strong><br />
                  {customer.address
                    ? `${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode}`
                    : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              color="primary" 
              startIcon={<EditIcon />}
              onClick={handleOpenEditModal}
            >
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
          
          {/* Lodging preference option for multiple pets */}
          {selectedPets.length > 1 && (
            <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Lodging Preference
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={formData.lodgingPreference || LodgingPreference.STANDARD}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch({ 
                    type: 'SET_LODGING_PREFERENCE', 
                    payload: e.target.value as LodgingPreference 
                  })}
                >
                  <FormControlLabel 
                    value={LodgingPreference.STANDARD} 
                    control={<Radio size="small" />} 
                    label="Standard (system assigned)" 
                  />
                  <FormControlLabel 
                    value={LodgingPreference.SHARED_WITH_SIBLING} 
                    control={<Radio size="small" />} 
                    label="Place pets in the same suite when possible" 
                  />
                  <FormControlLabel 
                    value={LodgingPreference.SEPARATE_FROM_SIBLING} 
                    control={<Radio size="small" />} 
                    label="Always place pets in separate suites" 
                  />
                  
                  {formData.lodgingPreference === LodgingPreference.SEPARATE_FROM_SIBLING && (
                    <Box sx={{ ml: 4, mt: 1, display: 'flex', flexDirection: 'column' }}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={formData.manualRoomSelection || false}
                            onChange={(e) => {
                              setManualRoomSelection(e.target.checked);
                              dispatch({ 
                                type: 'SET_MANUAL_ROOM_SELECTION', 
                                payload: e.target.checked 
                              });
                            }}
                            size="small"
                          />
                        }
                        label="Allow manual room selection"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                        {formData.manualRoomSelection 
                          ? "You'll be able to select specific rooms for each pet" 
                          : "System will automatically assign the nearest available rooms"}
                      </Typography>
                    </Box>
                  )}
                </RadioGroup>
              </FormControl>
            </Box>
          )}
        </Box>
      )}
      
      {/* Customer Edit Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={handleCloseEditModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Edit Customer Information
          <IconButton
            aria-label="close"
            onClick={handleCloseEditModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {editCustomer && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="Basic Information" size="small" />
                </Divider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={editCustomer.firstName || ''}
                  onChange={(e) => handleCustomerFieldChange('firstName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={editCustomer.lastName || ''}
                  onChange={(e) => handleCustomerFieldChange('lastName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={editCustomer.email || ''}
                  onChange={(e) => handleCustomerFieldChange('email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={editCustomer.phone || ''}
                  onChange={(e) => handleCustomerFieldChange('phone', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="Address" size="small" />
                </Divider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Street Address"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={editCustomer.address || ''}
                  onChange={(e) => handleCustomerFieldChange('address', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={1}>
                  <Grid item xs={5}>
                    <TextField
                      label="City"
                      fullWidth
                      size="small"
                      margin="dense"
                      value={editCustomer.city || ''}
                      onChange={(e) => handleCustomerFieldChange('city', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="State"
                      fullWidth
                      size="small"
                      margin="dense"
                      value={editCustomer.state || ''}
                      onChange={(e) => handleCustomerFieldChange('state', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Zip"
                      fullWidth
                      size="small"
                      margin="dense"
                      value={editCustomer.zipCode || ''}
                      onChange={(e) => handleCustomerFieldChange('zipCode', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="Emergency Contact" size="small" color="warning" />
                </Divider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Emergency Contact Name"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={editCustomer.emergencyContact || ''}
                  onChange={(e) => handleCustomerFieldChange('emergencyContact', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Relationship"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={editCustomer.emergencyContactRelationship || ''}
                  onChange={(e) => handleCustomerFieldChange('emergencyContactRelationship', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Emergency Email"
                  type="email"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={editCustomer.emergencyContactEmail || ''}
                  onChange={(e) => handleCustomerFieldChange('emergencyContactEmail', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Emergency Phone"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={editCustomer.emergencyPhone || ''}
                  onChange={(e) => handleCustomerFieldChange('emergencyPhone', e.target.value)}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button 
            onClick={handleSaveCustomer} 
            variant="contained" 
            color="primary"
            disabled={savingCustomer}
          >
            {savingCustomer ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerPetSelectionStep;
