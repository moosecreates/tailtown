import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VillaIcon from '@mui/icons-material/Villa';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

import { useReservationWizard } from '../ReservationWizard';
import { LodgingPreference } from '../../../../types/petCare';
import { serviceManagement } from '../../../../services/serviceManagement';
import { resourceService } from '../../../../services/resourceService';
import { Service } from '../../../../types/service';

/**
 * Lodging & Services Step
 * 
 * Third step in the reservation wizard where the user selects
 * the service, lodging preferences, and suite/room.
 */
const LodgingServicesStep: React.FC = () => {
  const { formData, dispatch } = useReservationWizard();
  const { 
    selectedPets,
    service, 
    lodgingPreference, 
    suiteId,
    pets,
    startDate,
    endDate
  } = formData;

  // Local state for available services and resources
  const [services, setServices] = useState<Service[]>([]);
  const [availableSuites, setAvailableSuites] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSuites, setLoadingSuites] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available services and auto-select the first boarding service if none is selected
  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true);
      setError(null);
      try {
        const response = await serviceManagement.getAllServices();
        // Filter only boarding/lodging services
        const boardingServices = response.data.filter(
          (svc: Service) => svc.serviceCategory === 'BOARDING'
        );
        setServices(boardingServices);
        
        // Auto-select the first boarding service if none is selected
        if (!service && boardingServices.length > 0) {
          dispatch({ type: 'SET_SERVICE', payload: boardingServices[0] });
        }
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Failed to load available services. Please try again.');
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [service, dispatch]);

  // Load available suites when service changes or dates change
  useEffect(() => {
    if (!service || !startDate || !endDate) {
      setAvailableSuites([]);
      return;
    }

    const loadSuites = async () => {
      setLoadingSuites(true);
      setError(null);
      try {
        // Fetch available suites for the selected dates
        // Fetch available suites for the selected dates
        const response = await resourceService.getAvailableResourcesByDate(
          startDate.toISOString(),
          endDate.toISOString(),
          service?.id
        );
        
        setAvailableSuites(response.data || []);
        
        // If currently selected suite is not available, clear it
        if (suiteId && !response.data.some((suite: { id: string }) => suite.id === suiteId)) {
          dispatch({ type: 'SET_SUITE_ID', payload: null });
        }
      } catch (err) {
        console.error('Error loading available suites:', err);
        setError('Failed to load available suites. Please try again.');
      } finally {
        setLoadingSuites(false);
      }
    };

    loadSuites();
  }, [service, startDate, endDate, dispatch, suiteId]);

  // Handle service selection
  const handleServiceChange = (selectedService: Service) => {
    dispatch({ type: 'SET_SERVICE', payload: selectedService });
  };

  // Handle lodging preference change
  const handleLodgingPreferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_LODGING_PREFERENCE',
      payload: event.target.value as LodgingPreference
    });
  };

  // Handle suite selection
  const handleSuiteChange = (suiteId: string) => {
    dispatch({ type: 'SET_SUITE_ID', payload: suiteId });
  };

  // Get selected pets' names
  const getSelectedPetNames = () => {
    return selectedPets
      .map(petId => {
        const pet = pets.find(p => p.id === petId);
        return pet ? pet.name : '';
      })
      .filter(Boolean);
  };

  // Render service selection cards
  const renderServiceCards = () => {
    if (loadingServices) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (services.length === 0) {
      return (
        <Alert severity="info">
          No boarding services available. Please check back later or contact an administrator.
        </Alert>
      );
    }

    return (
      <Grid container spacing={2}>
        {services.map(svc => (
          <Grid item xs={12} sm={6} md={4} key={svc.id}>
            <Card 
              raised={service?.id === svc.id}
              sx={{
                transition: 'all 0.2s ease',
                borderColor: service?.id === svc.id ? 'primary.main' : 'transparent',
                borderWidth: 2,
                borderStyle: service?.id === svc.id ? 'solid' : 'none',
                height: '100%'
              }}
            >
              <CardActionArea 
                onClick={() => handleServiceChange(svc)}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {svc.name}
                    </Typography>
                    {service?.id === svc.id && (
                      <CheckCircleIcon color="primary" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {svc.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AttachMoneyIcon fontSize="small" color="primary" />
                    <Typography variant="body1" component="span" sx={{ ml: 0.5 }}>
                      ${svc.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {svc.duration ? `/ ${svc.duration} mins` : 'per night'}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render lodging preference section
  const renderLodgingPreference = () => {
    // Only show lodging preference if multiple pets are selected
    if (selectedPets.length <= 1) {
      return null;
    }

    const petNames = getSelectedPetNames();

    return (
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lodging Preference
        </Typography>
        <FormControl component="fieldset">
          <FormLabel component="legend">
            How would you like to lodge the pets?
          </FormLabel>
          <RadioGroup
            value={lodgingPreference}
            onChange={handleLodgingPreferenceChange}
          >
            <FormControlLabel
              value={LodgingPreference.STANDARD}
              control={<Radio />}
              label="Standard (separate accommodations)"
            />
            <FormControlLabel
              value={LodgingPreference.SHARED_WITH_SIBLING}
              control={<Radio />}
              label={`Shared accommodations (${petNames.join(' & ')} together)`}
            />
            <FormControlLabel
              value={LodgingPreference.SEPARATE_FROM_SIBLING}
              control={<Radio />}
              label="Separate accommodations (explicitly not together)"
            />
          </RadioGroup>
        </FormControl>
      </Paper>
    );
  };

  // Render suite selection
  const renderSuiteSelection = () => {
    if (!service) {
      return null;
    }

    if (loadingSuites) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (availableSuites.length === 0) {
      return (
        <Alert severity="warning" sx={{ mt: 3 }}>
          No available suites found for the selected dates. Please try different dates or contact staff for assistance.
        </Alert>
      );
    }

    // Group suites by type for better organization
    const suitesByType: Record<string, any[]> = {};
    availableSuites.forEach(suite => {
      const type = suite.type || 'Standard';
      if (!suitesByType[type]) {
        suitesByType[type] = [];
      }
      suitesByType[type].push(suite);
    });

    return (
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Suite Type
        </Typography>
        
        {Object.entries(suitesByType).map(([type, suites]) => (
          <Box key={type} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {type} Suites ({suites.length} available)
            </Typography>
            <Grid container spacing={2}>
              {suites.map(suite => (
                <Grid item xs={12} sm={6} md={4} key={suite.id}>
                  <Card 
                    variant="outlined"
                    sx={{
                      borderColor: suiteId === suite.id ? 'primary.main' : 'divider',
                      backgroundColor: suiteId === suite.id ? 'action.selected' : 'background.paper'
                    }}
                  >
                    <CardActionArea onClick={() => handleSuiteChange(suite.id)}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MeetingRoomIcon sx={{ mr: 1 }} />
                          <Typography variant="h6" component="div">
                            {suite.name || `Suite ${suite.suiteNumber || ''}`}
                          </Typography>
                          {suiteId === suite.id && (
                            <CheckCircleIcon color="primary" sx={{ ml: 'auto' }} />
                          )}
                        </Box>
                        {suite.location && (
                          <Typography variant="body2" color="text.secondary">
                            Location: {suite.location}
                          </Typography>
                        )}
                        {suite.attributes && suite.attributes.size && (
                          <Typography variant="body2" color="text.secondary">
                            Size: {suite.attributes.size}
                          </Typography>
                        )}
                        {suite.attributes && suite.attributes.features && (
                          <Box sx={{ mt: 1 }}>
                            {suite.attributes.features.map((feature: string) => (
                              <Chip 
                                key={feature} 
                                label={feature} 
                                size="small" 
                                sx={{ mr: 0.5, mb: 0.5 }} 
                              />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Paper>
    );
  };

  // Render selected options summary
  const renderSummary = () => {
    if (!service) {
      return null;
    }

    return (
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <VillaIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Service" 
              secondary={service.name} 
            />
          </ListItem>
          
          {selectedPets.length > 1 && (
            <ListItem>
              <ListItemIcon>
                <PetsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Lodging Preference" 
                secondary={
                  lodgingPreference === LodgingPreference.STANDARD
                    ? 'Standard (separate accommodations)'
                    : lodgingPreference === LodgingPreference.SHARED_WITH_SIBLING
                    ? 'Shared accommodations'
                    : 'Explicitly separate accommodations'
                } 
              />
            </ListItem>
          )}
          
          {suiteId && (
            <ListItem>
              <ListItemIcon>
                <MeetingRoomIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Selected Suite" 
                secondary={
                  availableSuites.find(suite => suite.id === suiteId)?.name ||
                  `Suite ${availableSuites.find(suite => suite.id === suiteId)?.suiteNumber || ''}`
                } 
              />
            </ListItem>
          )}
        </List>
      </Paper>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Lodging & Services
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!service && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading boarding service information...
        </Alert>
      )}
      
      {/* Lodging preference for multiple pets */}
      {service && renderLodgingPreference()}
      
      {/* Suite selection */}
      {service && renderSuiteSelection()}
      
      {/* Summary */}
      {renderSummary()}
    </Box>
  );
};

export default LodgingServicesStep;
