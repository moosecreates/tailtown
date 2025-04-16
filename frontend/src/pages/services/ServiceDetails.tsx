import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { serviceManagement } from '../../services/serviceManagement';
import { Service, ServiceCategory, AddOnService } from '../../types/service';

interface AddOnFormData {
  name: string;
  description: string;
  price: number;
  duration: number;
}

/**
 * ServiceDetails component handles the creation and editing of service offerings.
 * Manages service data, pricing, capacity, and add-ons.
 */
const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewService = !id;

  const [service, setService] = useState<Partial<Service>>({
    name: '',
    description: '',
    serviceCategory: ServiceCategory.DAYCARE,
    price: 0,
    duration: 0,
    capacityLimit: 1,
    requiresStaff: false,
    isActive: true,
    notes: '',
    availableAddOns: []
  });

  const [loading, setLoading] = useState(!isNewService);
  const [saving, setSaving] = useState(false);
  const [newAddOn, setNewAddOn] = useState<AddOnFormData>({
    name: '',
    description: '',
    price: 0,
    duration: 0
  });
  const [showAddOnForm, setShowAddOnForm] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    if (!isNewService) {
      loadService();
    }
  }, [id]);

  const loadService = async () => {
    try {
      const response = await serviceManagement.getServiceById(id!);
      setService(response.data);
      setLoading(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to load service',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setService((prev: Partial<Service>) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setService((prev: Partial<Service>) => ({
      ...prev,
      [name]: checked
    }));
  };

  /**
 * Updates the service category when changed in the dropdown.
 * @param event - The select change event containing the new category
 */
const handleCategoryChange = (event: SelectChangeEvent<ServiceCategory>) => {
    setService((prev: Partial<Service>) => ({
      ...prev,
      serviceCategory: event.target.value as ServiceCategory
    }));
  };

  const handleAddOnInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewAddOn((prev: AddOnFormData) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleAddAddOn = () => {
    setService((prev: Partial<Service>) => ({
      ...prev,
      availableAddOns: [...(prev.availableAddOns || []), newAddOn]
    }));
    setNewAddOn({
      name: '',
      description: '',
      price: 0,
      duration: 0
    });
    setShowAddOnForm(false);
  };

  const handleRemoveAddOn = (index: number) => {
    setService((prev: Partial<Service>) => ({
      ...prev,
      availableAddOns: prev.availableAddOns?.filter((_: AddOnService, i: number) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving service:', service);
      if (isNewService) {
        await serviceManagement.createService(service as Service);
      } else {
        await serviceManagement.updateService(id!, {
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          color: service.color,
          serviceCategory: service.serviceCategory,
          isActive: service.isActive,
          capacityLimit: service.capacityLimit,
          requiresStaff: service.requiresStaff,
          notes: service.notes,
          availableAddOns: service.availableAddOns
        });
      }
      setSnackbar({
        open: true,
        message: `Service ${isNewService ? 'created' : 'updated'} successfully`,
        severity: 'success'
      });
      navigate('/services');
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error ${isNewService ? 'creating' : 'updating'} service`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/services');
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Loading service...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          {isNewService ? 'New Service' : 'Edit Service'}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Service Name"
                    name="name"
                    value={service.name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={service.description}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={service.serviceCategory}
                      onChange={handleCategoryChange}
                      label="Category"
                    >
                      {Object.values(ServiceCategory).map((category: ServiceCategory) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={service.price}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: '$'
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (minutes)"
                    name="duration"
                    type="number"
                    value={service.duration}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Capacity"
                    name="capacityLimit"
                    type="number"
                    value={service.capacityLimit}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={service.notes}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={service.requiresStaff}
                        onChange={handleSwitchChange}
                        name="requiresStaff"
                      />
                    }
                    label="Requires Staff"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={service.isActive}
                        onChange={handleSwitchChange}
                        name="isActive"
                      />
                    }
                    label="Active"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Add-on Services</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddOnForm(true)}
                  disabled={showAddOnForm}
                >
                  Add
                </Button>
              </Box>

              {showAddOnForm && (
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Add-on Name"
                        name="name"
                        value={newAddOn.name}
                        onChange={handleAddOnInputChange}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={newAddOn.description}
                        onChange={handleAddOnInputChange}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Price"
                        name="price"
                        type="number"
                        value={newAddOn.price}
                        onChange={handleAddOnInputChange}
                        size="small"
                        InputProps={{
                          startAdornment: '$'
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Duration"
                        name="duration"
                        type="number"
                        value={newAddOn.duration}
                        onChange={handleAddOnInputChange}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          onClick={() => setShowAddOnForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleAddAddOn}
                          disabled={!newAddOn.name}
                        >
                          Add
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {service.availableAddOns?.map((addOn: AddOnService, index: number) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    position: 'relative'
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() => handleRemoveAddOn(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Typography variant="subtitle1">{addOn.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {addOn.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      ${addOn.price} • {addOn.duration} min
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !service.name}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

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

export default ServiceDetails;
