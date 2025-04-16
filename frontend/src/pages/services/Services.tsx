import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { serviceManagement } from '../../services/serviceManagement';
import { Service, ServiceCategory } from '../../types/service';

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await serviceManagement.getAllServices();
      if (Array.isArray(response)) {
        setServices(response);
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        setServices(response.data.data);
      } else if (response?.data && Array.isArray(response.data)) {
        setServices(response.data);
      } else {
        console.error('Invalid services response format:', response);
        setServices([]);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading services:', err);
      if (err.response) {
        console.error('Response error:', err.response.data);
      }
      setSnackbar({
        open: true,
        message: 'Failed to load services',
        severity: 'error'
      });
      setServices([]);
      setLoading(false);
    }
  };

  const handleAddService = () => {
    navigate('/services/new');
  };

  const handleEditService = (id: string) => {
    navigate(`/services/${id}`);
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      await serviceManagement.deleteService(serviceToDelete.id);
      setSnackbar({
        open: true,
        message: 'Service deleted successfully',
        severity: 'success'
      });
      loadServices();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete service',
        severity: 'error'
      });
    }
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Loading services...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Services
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddService}
          >
            Add Service
          </Button>
        </Box>

        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2">
                    {service.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {service.serviceCategory}
                  </Typography>
                  <Typography variant="body2" component="p" sx={{ mb: 2 }}>
                    {service.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`$${service.price}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${service.duration} min`}
                      color="secondary"
                      variant="outlined"
                    />
                    {service.isActive ? (
                      <Chip label="Active" color="success" />
                    ) : (
                      <Chip label="Inactive" color="error" />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleEditService(service.id)}
                    aria-label="edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(service)}
                    aria-label="delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {serviceToDelete?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Services;
