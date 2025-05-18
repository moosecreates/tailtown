import React, { useEffect, useState } from 'react';
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
  InputAdornment,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useParams, useNavigate } from 'react-router-dom';
import { Customer, customerService } from '../../services/customerService';
import AccountHistory from '../../components/customers/AccountHistory';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Default empty customer state
const emptyCustomer: Customer = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  emergencyContact: '',
  emergencyPhone: '',
  emergencyContactRelationship: '',
  emergencyContactEmail: '',
  emergencyContactNotes: '',
  pets: []
};

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewCustomer = !id || id === 'new';
  
  // State management
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(isNewCustomer);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tabValue, setTabValue] = useState<number>(0);
  
  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      if (isNewCustomer) {
        setCustomer(emptyCustomer);
        setLoading(false);
        return;
      }
      
      try {
        const data = await customerService.getCustomerById(id || '');
        setCustomer(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customer:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load customer data',
          severity: 'error'
        });
        setLoading(false);
      }
    };
    
    fetchCustomer();
  }, [id, isNewCustomer]);
  
  // Handle tab changes
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const inputType = e.target.type;
    const elementId = e.target.id;
    
    // Update the customer state
    setCustomer(prev => ({
      ...prev,
      [name]: value
    }));
    
    // For all input types, maintain focus after state update
    requestAnimationFrame(() => {
      const element = document.getElementById(elementId);
      if (element) {
        // For textarea and text inputs, try to maintain cursor position
        if ((inputType === 'text' || inputType === 'textarea') && 'selectionStart' in e.target) {
          try {
            const input = element as HTMLInputElement | HTMLTextAreaElement;
            const selectionStart = e.target.selectionStart;
            const selectionEnd = e.target.selectionEnd;
            
            // Only attempt to set selection range for supported input types
            if (input.type !== 'email' && input.type !== 'number') {
              input.setSelectionRange(selectionStart, selectionEnd);
            }
          } catch (error) {
            // Silently fail if setSelectionRange is not supported
            console.log(`Selection range not supported for ${inputType}`);
          }
        }
        
        // Always focus the element
        element.focus();
      }
    });
  };
  
  // Handle customer save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isNewCustomer) {
        // Create the customer
        const newCustomer = await customerService.createCustomer(customer);
        setSnackbar({
          open: true,
          message: 'Customer created successfully',
          severity: 'success'
        });
        
        // Check for redirect parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('redirect');
        
        if (redirectPath) {
          // If there's a redirect parameter, navigate there
          navigate(redirectPath);
        } else {
          // Otherwise, go back to customers list
          navigate('/customers');
        }
      } else {
        await customerService.updateCustomer(id || '', customer);
        setSnackbar({
          open: true,
          message: 'Customer updated successfully',
          severity: 'success'
        });
        setEditing(false);
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      let errorMessage = 'Failed to save customer';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Customer Form Component
  const CustomerForm = () => (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2}>
        {/* Customer Personal Information */}
        <Grid item xs={12}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 2 }}>
            Customer Information
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="customer-firstName"
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
            id="customer-lastName"
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
            id="customer-email"
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
            id="customer-phone"
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
            id="customer-address"
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
            id="customer-city"
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
            id="customer-state"
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
            id="customer-zipCode"
            label="Zip Code"
            name="zipCode"
            value={customer.zipCode}
            onChange={handleInputChange}
            disabled={!editing}
          />
        </Grid>

        {/* Emergency Contact Information */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Typography variant="h6" color="error" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 2 }}>
            Emergency Contact Information
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="customer-emergencyContact"
            label="Emergency Contact Name"
            name="emergencyContact"
            value={customer.emergencyContact || ''}
            onChange={handleInputChange}
            disabled={!editing}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="error" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="customer-emergencyContactRelationship"
            label="Relationship to Customer"
            name="emergencyContactRelationship"
            value={customer.emergencyContactRelationship || ''}
            onChange={handleInputChange}
            disabled={!editing}
            placeholder="e.g., Spouse, Parent, Friend"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="customer-emergencyPhone"
            label="Emergency Contact Phone"
            name="emergencyPhone"
            value={customer.emergencyPhone || ''}
            onChange={handleInputChange}
            disabled={!editing}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography color="error" variant="caption" fontWeight="bold">
                    !
                  </Typography>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="customer-emergencyContactEmail"
            label="Emergency Contact Email"
            name="emergencyContactEmail"
            type="email"
            value={customer.emergencyContactEmail || ''}
            onChange={handleInputChange}
            disabled={!editing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="customer-emergencyContactNotes"
            label="Emergency Contact Notes"
            name="emergencyContactNotes"
            multiline
            minRows={4}
            value={customer.emergencyContactNotes || ''}
            onChange={handleInputChange}
            disabled={!editing}
            placeholder="Special instructions or additional emergency contact details"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
                '& .MuiInputBase-input': {
                  direction: 'ltr',
                  textAlign: 'left',
                }
              },
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  // Pet List Component
  const PetsList = () => (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" color="textSecondary">
          {customer.pets?.length || 0} {customer.pets?.length === 1 ? 'pet' : 'pets'} associated with this customer
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
              .filter((pet: any) => 
                pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (pet.breed || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (pet.type || '').toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((pet: any) => (
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
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isNewCustomer ? 'New Customer' : `${customer.firstName} ${customer.lastName}`}
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {editing ? (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  if (isNewCustomer) {
                    navigate('/customers');
                  } else {
                    setEditing(false);
                  }
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setEditing(true)}
              >
                Edit Customer
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/customers')}
              >
                Back to Customers
              </Button>
            </>
          )}
        </Box>

        {/* Tabs - only show when not editing */}
        {!isNewCustomer && !editing && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="customer tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<PersonIcon />} iconPosition="start" label="Customer Info" />
              <Tab icon={<PetsIcon />} iconPosition="start" label="Pets" />
              <Tab icon={<AccountBalanceWalletIcon />} iconPosition="start" label="Account History" />
            </Tabs>
          </Box>
        )}

        {/* Main content based on editing status or tab selection */}
        {editing ? (
          <form onSubmit={handleSave}>
            <CustomerForm />
          </form>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <CustomerForm />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <PetsList />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Account History & Balance
                </Typography>
                <AccountHistory customerId={id || ''} />
              </Box>
            </TabPanel>
          </>
        )}

        {/* Snackbar for notifications */}
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

export default CustomerDetails;
