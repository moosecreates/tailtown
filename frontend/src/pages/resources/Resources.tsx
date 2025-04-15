import React, { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import * as resourceManagement from '../../services/resourceManagement';
import { Resource, ResourceType, getResourceTypeName, getResourceTypeCategory } from '../../types/resource';

const Resources: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedFilter = useMemo(
    () => debounce((term: string, type: string) => {
      const filtered = resources.filter(resource => {
        const matchesType = type === 'all' || getResourceTypeCategory(resource.type) === type;
        const matchesSearch = resource.name.toLowerCase().includes(term.toLowerCase()) ||
                            resource.description?.toLowerCase().includes(term.toLowerCase()) ||
                            resource.location?.toLowerCase().includes(term.toLowerCase());
        return matchesType && matchesSearch;
      });
      setFilteredResources(filtered);
    }, 300),
    [resources]
  );

  useEffect(() => {
    debouncedFilter(searchTerm, filterType);
    return () => {
      debouncedFilter.cancel();
    };
  }, [searchTerm, filterType, debouncedFilter]);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      console.log('Loading resources...');
      const resources = await resourceManagement.getAllResources();
      console.log('Resources loaded:', resources);
      setResources(resources || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading resources:', err.response?.data || err.message);
      setSnackbar({
        open: true,
        message: 'Failed to load resources',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceManagement.deleteResource(id);
        setSnackbar({
          open: true,
          message: 'Resource deleted successfully',
          severity: 'success'
        });
        loadResources();
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete resource',
          severity: 'error'
        });
      }
    }
  }, [loadResources, setSnackbar]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);

  useEffect(() => {
    setFilteredResources(resources);
  }, [resources]);

  const resourceCategories = ['all', 'Housing', 'Play Areas', 'Grooming', 'Training', 'Staff', 'Other'];

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Resources</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              console.log('Navigating to new resource form');
              navigate('/resources/new');
            }}
          >
            Add Resource
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search resources"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Filter by type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              size="small"
            >
              {resourceCategories.map((category) => (
                <MenuItem key={category} value={category.toLowerCase()}>
                  {category === 'all' ? 'All Types' : category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>{resource.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getResourceTypeName(resource.type)}
                      color={resource.isActive ? 'primary' : 'default'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{resource.location || '-'}</TableCell>
                  <TableCell>{resource.capacity || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={resource.isActive ? 'Active' : 'Inactive'}
                      color={resource.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/resources/${resource.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

export default Resources;
