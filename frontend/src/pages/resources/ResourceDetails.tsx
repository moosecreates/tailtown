import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Resource, ResourceType, AvailabilityStatus } from '../../types/resource';
import * as resourceManagement from '../../services/resourceManagement';

const initialResource: Partial<Resource> = {
  name: '',
  type: ResourceType.OTHER,
  description: '',
  capacity: 1,
  location: '',
  attributes: {},
  isActive: true,
  notes: ''
};

const ResourceDetails: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Partial<Resource>>(initialResource);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isNew = id === 'new';
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (!id) {
          navigate('/resources');
          return;
        }

        if (id === 'new') {
          setResource(initialResource);
          setLoading(false);
          return;
        }

        await loadResource();
      } catch (error) {
        console.error('Error initializing resource:', error);
        setSnackbar({
          open: true,
          message: 'Failed to initialize resource',
          severity: 'error'
        });
        navigate('/resources');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [id, navigate]);

  const loadResource = async () => {
    if (!id || id === 'new') {
      return;
    }

    try {
      const loadedResource = await resourceManagement.getResourceById(id);
      if (loadedResource) {
        setResource(loadedResource);
      } else {
        throw new Error('Resource not found');
      }
    } catch (err) {
      console.error('Failed to load resource:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load resource',
        severity: 'error'
      });
      navigate('/resources');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!id) {
        throw new Error('Resource ID is required');
      }

      if (id === 'new') {
        const { maintenanceSchedule, ...cleanResource } = resource;
        const resourceToCreate = {
          ...cleanResource,
          capacity: typeof cleanResource.capacity === 'string' ? parseInt(cleanResource.capacity, 10) : cleanResource.capacity,
          isActive: true,
          type: resource.type || ResourceType.OTHER,
          attributes: resource.attributes || {}
        } as Resource;

        const createdResource = await resourceManagement.createResource(resourceToCreate);
        setSnackbar({
          open: true,
          message: 'Resource created successfully',
          severity: 'success'
        });
        setTimeout(() => navigate('/resources'), 1500);
      } else {
        console.log('Updating resource:', id);
        await resourceManagement.updateResource(id, {
          name: resource.name,
          type: resource.type,
          description: resource.description,
          capacity: resource.capacity,
          location: resource.location,
          maintenanceSchedule: resource.maintenanceSchedule,
          attributes: resource.attributes,
          isActive: resource.isActive,
          notes: resource.notes
        });
      }

      setSnackbar({
        open: true,
        message: `Resource ${id === 'new' ? 'created' : 'updated'} successfully`,
        severity: 'success'
      });

      // Navigate back after successful save
      setTimeout(() => navigate('/resources'), 1500);
    } catch (err: any) {
      console.error('Error submitting resource:', err);
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${id === 'new' ? 'create' : 'update'} resource`;
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setResource(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/resources')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">
            {id === 'new' ? 'New Resource' : 'Edit Resource'}
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Name"
                  name="name"
                  value={resource.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Type"
                  name="type"
                  value={resource.type}
                  onChange={handleChange}
                >
                  {Object.entries(ResourceType).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ')}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={resource.description || ''}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={resource.location || ''}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Capacity"
                  name="capacity"
                  value={resource.capacity || ''}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  name="notes"
                  value={resource.notes || ''}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={resource.isActive}
                      onChange={handleChange}
                      name="isActive"
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/resources')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                  >
                    {saving ? (
                      <CircularProgress size={24} />
                    ) : id === 'new' ? (
                      'Create Resource'
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
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

export default ResourceDetails;
