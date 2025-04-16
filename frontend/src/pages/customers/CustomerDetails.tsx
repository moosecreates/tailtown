import React, { useEffect, useState, useCallback } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Paper, 
  Button,
  TextField,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useParams, useNavigate } from 'react-router-dom';
import { Customer, customerService } from '../../services/customerService';

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewCustomer = !id || id === 'new';

  console.log('Route ID:', id);
  console.log('Is New Customer:', isNewCustomer);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(isNewCustomer);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [searchQuery, setSearchQuery] = useState('');
  const [customer, setCustomer] = useState<Customer>({
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
    portalEnabled: true,
    preferredContact: 'EMAIL',
    tags: [],
    isActive: true
  });

  const loadCustomer = useCallback(async () => {
    try {
      if (id && id !== 'new') {
        console.log('Loading customer with ID:', id);
        const data = await customerService.getCustomerById(id);
        console.log('Loaded customer data:', data);
        setCustomer(data);
      } else {
        console.log('No customer to load - new customer flow');
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      setSnackbar({ open: true, message: 'Error loading customer', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isNewCustomer) {
      loadCustomer();
    } else {
      setLoading(false);
    }
  }, [isNewCustomer, loadCustomer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer((prev: Customer) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    const fieldLabels: Partial<Record<keyof Customer, string>> = {
      id: 'ID',
      email: 'Email',
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone number',
      alternatePhone: 'Alternate phone',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP code',
      notes: 'Notes',
      portalEnabled: 'Portal enabled',
      preferredContact: 'Preferred contact method',
      emergencyContact: 'Emergency contact',
      emergencyPhone: 'Emergency phone',
      vatTaxId: 'VAT/Tax ID',
      referralSource: 'Referral source',
      tags: 'Tags',
      isActive: 'Active status',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      pets: 'Pets'
    };

    // Required field validation
    const requiredFields: (keyof Customer)[] = ['firstName', 'lastName', 'email'];
    requiredFields.forEach(field => {
      if (!customer[field]?.toString().trim()) {
        errors.push(`${fieldLabels[field]} is required`);
      }
    });

    // Email validation
    if (customer.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customer.email)) {
        errors.push('Email address is not in a valid format (e.g., user@example.com)');
      }
    }

    // Phone validation
    if (customer.phone?.trim()) {
      const phoneRegex = /^[\d\s()-]+$/;
      if (!phoneRegex.test(customer.phone)) {
        errors.push('Phone number should contain only numbers, spaces, hyphens, or parentheses');
      }
    }

    // Alternate phone validation
    if (customer.alternatePhone?.trim()) {
      const phoneRegex = /^[\d\s()-]+$/;
      if (!phoneRegex.test(customer.alternatePhone)) {
        errors.push('Alternate phone number should contain only numbers, spaces, hyphens, or parentheses');
      }
    }

    // Emergency phone validation
    if (customer.emergencyPhone?.trim()) {
      const phoneRegex = /^[\d\s()-]+$/;
      if (!phoneRegex.test(customer.emergencyPhone)) {
        errors.push('Emergency phone number should contain only numbers, spaces, hyphens, or parentheses');
      }
    }

    // ZIP code validation (if provided)
    if (customer.zipCode?.trim()) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(customer.zipCode)) {
        errors.push('ZIP code should be in format: 12345 or 12345-6789');
      }
    }

    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors.join('\n'),
        severity: 'error'
      });
      return false;
    }

    return true;
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      console.log('Form submitted via onSubmit');
    } else {
      console.log('Save button clicked directly');
    }
    
    console.log('Starting save process...');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      let savedCustomer;
      console.log('Current customer data:', customer);
      console.log('isNewCustomer:', isNewCustomer);
      console.log('Route ID:', id);
      console.log('Customer state ID:', customer.id);

      // Prepare customer data
      const { id: _, ...customerData } = customer;
      console.log('Prepared customer data:', customerData);

      if (isNewCustomer) {
        console.log('Creating new customer...');
        try {
          savedCustomer = await customerService.createCustomer(customerData);
          console.log('Create API response:', savedCustomer);
        } catch (apiError: any) {
          console.error('Create API error:', apiError);
          console.error('Create API error response:', apiError.response);
          throw apiError;
        }
      } else if (id && id !== 'new') {
        // For existing customers, use the route ID
        console.log('Updating existing customer with ID:', id);
        try {
          savedCustomer = await customerService.updateCustomer(id, customerData);
          console.log('Update API response:', savedCustomer);
        } catch (apiError: any) {
          console.error('Update API error:', apiError);
          console.error('Update API error response:', apiError.response);
          throw apiError;
        }
      } else {
        console.error('Invalid state: cannot determine if new or existing customer');
        throw new Error('Invalid state: cannot determine if new or existing customer');
      }
      
      console.log('Server response:', savedCustomer);
      if (savedCustomer) {
        console.log('Save successful, updating state...');
        setCustomer(savedCustomer);
        setSnackbar({ open: true, message: 'Customer saved successfully', severity: 'success' });
        setEditing(false);
        console.log('Navigating to customer list...');
        navigate('/customers', { state: { refresh: true } });
      } else {
        console.error('No customer data in response');
        throw new Error('No customer data in response');
      }
    } catch (error: any) {
      console.error('Error saving customer:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      
      let errorMessage = 'An error occurred while saving the customer';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        console.error('Server error message:', error.response.data.message);
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid customer data. Please check all fields and try again.';
        console.error('Bad request:', error.response.data);
      } else if (error.response?.status === 404) {
        errorMessage = 'Customer not found. They may have been deleted.';
        console.error('Not found:', error.response.data);
      } else if (error.response?.status === 409) {
        errorMessage = 'A customer with this email already exists.';
        console.error('Conflict:', error.response.data);
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
        console.error('Server error:', error.response.data);
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network and try again.';
        console.error('Network error');
      } else {
        console.error('Unknown error:', error);
        errorMessage = `Error: ${error.message || 'Unknown error occurred'}`;
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isNewCustomer ? 'New Customer' : 'Customer Details'}
        </Typography>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitted');
            handleSave(e);
          }} 
          noValidate
        >
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={customer.firstName}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={customer.lastName}
                onChange={handleInputChange}
                disabled={!editing}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={customer.email}
                onChange={handleInputChange}
                disabled={!editing}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={customer.phone}
                onChange={handleInputChange}
                disabled={!editing}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={customer.address}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={customer.city}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={customer.state}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zip Code"
                name="zipCode"
                value={customer.zipCode}
                onChange={handleInputChange}
                disabled={!editing}
              />
            </Grid>
          </Grid>
        </Paper>

        {!isNewCustomer && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
              <Typography variant="h5">
                Pets
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/pets/new?customerId=${id}`)}
              >
                Add Pet
              </Button>
            </Box>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search pets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              {customer.pets && customer.pets.length > 0 ? (
                <List>
                  {customer.pets
                    .filter((pet: { name: string; breed?: string; type?: string }) => 
                      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (pet.breed || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (pet.type || '').toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((pet: { id: string; name: string; breed?: string; type?: string }) => (
                      <ListItem
                        key={pet.id}
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                      >
                        <ListItemText
                          primary={pet.name}
                          secondary={
                            <>
                              {pet.type}{pet.breed ? ` • ${pet.breed}` : ''}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => navigate(`/pets/${pet.id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary" align="center">
                  No pets found. Click "Add Pet" to add one.
                </Typography>
              )}
            </Paper>
          </>
        )}

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          {editing ? (
            <>
              <Button variant="contained" color="primary" type="submit">
                Save Customer
              </Button>
              {!isNewCustomer && (
                <Button variant="outlined" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </>
          ) : (
            <Button variant="contained" color="primary" onClick={() => setEditing(true)}>
              Edit Customer
            </Button>
          )}
          <Button variant="outlined" color="secondary" onClick={() => navigate('/customers')}>
            Back to Customers
          </Button>
        </Box>
        </form>
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

export default CustomerDetails;
