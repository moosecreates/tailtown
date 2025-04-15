import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { Customer, customerService } from '../../services/customerService';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customerService.getAllCustomers();
        console.log('Loaded customers:', data);
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (err) {
        console.error('Error loading customers:', err);
        setError('Failed to load customers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const handleAddNew = () => {
    navigate('/customers/new');
  };

  const handleRowClick = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent row click
    if (window.confirm('Are you sure you want to permanently delete this customer? This action cannot be undone.')) {
      try {
        await customerService.deleteCustomer(id);
        
        // Refresh the customer list after deletion
        const updatedCustomers = await customerService.getAllCustomers();
        setCustomers(updatedCustomers);
        
        setSnackbar({
          open: true,
          message: 'Customer permanently deleted',
          severity: 'success'
        });
      } catch (err) {
        console.error('Error deleting customer:', err);
        setSnackbar({
          open: true,
          message: 'Error deleting customer. Please try again.',
          severity: 'error'
        });
        
        // Refresh list to ensure UI is in sync with backend
        const updatedCustomers = await customerService.getAllCustomers();
        setCustomers(updatedCustomers);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Customers
          </Typography>
          <Button variant="contained" color="primary" onClick={handleAddNew}>
            Add New Customer
          </Button>
          </Box>

          <TextField
            fullWidth
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => {
              const query = e.target.value.toLowerCase();
              setSearchQuery(query);
              const filtered = customers.filter(customer => 
                `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query) ||
                (customer.email || '').toLowerCase().includes(query) ||
                (customer.phone || '').toLowerCase().includes(query)
              );
              setFilteredCustomers(filtered);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                  >
                    <TableCell 
                      onClick={() => handleRowClick(customer.id)}
                      sx={{ cursor: 'pointer' }}
                    >{`${customer.firstName} ${customer.lastName}`}</TableCell>
                    <TableCell onClick={() => handleRowClick(customer.id)} sx={{ cursor: 'pointer' }}>{customer.email}</TableCell>
                    <TableCell onClick={() => handleRowClick(customer.id)} sx={{ cursor: 'pointer' }}>{customer.phone}</TableCell>
                    <TableCell onClick={() => handleRowClick(customer.id)} sx={{ cursor: 'pointer' }}>{customer.city}</TableCell>
                    <TableCell onClick={() => handleRowClick(customer.id)} sx={{ cursor: 'pointer' }}>{customer.state}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={(e) => handleDelete(e, customer.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No customers found
                    </TableCell>
                  </TableRow>
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

export default Customers;
