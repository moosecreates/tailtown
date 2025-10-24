/**
 * ServiceSelection - Step 1: Choose service type
 * Mobile-first design with card-based selection
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Avatar
} from '@mui/material';
import {
  Hotel as BoardingIcon,
  WbSunny as DaycareIcon,
  ContentCut as GroomingIcon,
  School as TrainingIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { serviceManagement } from '../../../services/serviceManagement';

interface Service {
  id: string;
  name: string;
  description: string;
  serviceCategory: string;
  price: number;
  duration?: number;
}

interface ServiceSelectionProps {
  bookingData: any;
  onNext: () => void;
  onUpdate: (data: any) => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  bookingData,
  onNext,
  onUpdate
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await serviceManagement.getAllServices();
      
      // Handle different response formats
      const serviceData = response.data?.data || response.data || [];
      setServices(serviceData);
      
      // Pre-select if serviceId provided
      if (bookingData.serviceId) {
        const preSelected = serviceData.find((s: Service) => s.id === bookingData.serviceId);
        if (preSelected) {
          setSelectedService(preSelected);
        }
      }
      
      setError('');
    } catch (err: any) {
      console.error('Error loading services:', err);
      setError('Unable to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    onUpdate({
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory: service.serviceCategory,
      servicePrice: service.price
    });
  };

  const handleContinue = () => {
    if (selectedService) {
      onNext();
    }
  };

  const getServiceIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case 'BOARDING':
        return <BoardingIcon sx={{ fontSize: { xs: 40, sm: 48 } }} />;
      case 'DAYCARE':
        return <DaycareIcon sx={{ fontSize: { xs: 40, sm: 48 } }} />;
      case 'GROOMING':
        return <GroomingIcon sx={{ fontSize: { xs: 40, sm: 48 } }} />;
      case 'TRAINING':
        return <TrainingIcon sx={{ fontSize: { xs: 40, sm: 48 } }} />;
      default:
        return <BoardingIcon sx={{ fontSize: { xs: 40, sm: 48 } }} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toUpperCase()) {
      case 'BOARDING':
        return '#1976d2';
      case 'DAYCARE':
        return '#ff9800';
      case 'GROOMING':
        return '#9c27b0';
      case 'TRAINING':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const groupServicesByCategory = () => {
    const grouped: { [key: string]: Service[] } = {};
    services.forEach(service => {
      const category = service.serviceCategory || 'OTHER';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });
    return grouped;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={loadServices} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  const groupedServices = groupServicesByCategory();

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
        What service would you like to book?
      </Typography>

      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ color: getCategoryColor(category), mr: 1 }}>
              {getServiceIcon(category)}
            </Box>
            <Typography 
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 600,
                textTransform: 'capitalize'
              }}
            >
              {category.toLowerCase()}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {categoryServices.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <Card
                  elevation={selectedService?.id === service.id ? 8 : 2}
                  sx={{
                    height: '100%',
                    border: selectedService?.id === service.id
                      ? '3px solid'
                      : '1px solid',
                    borderColor: selectedService?.id === service.id
                      ? 'primary.main'
                      : 'divider',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleServiceSelect(service)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography 
                        variant="h6" 
                        component="h3"
                        gutterBottom
                        sx={{
                          fontSize: { xs: '1rem', sm: '1.125rem' },
                          fontWeight: 600
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Avatar
                            sx={{
                              width: { xs: 40, sm: 48 },
                              height: { xs: 40, sm: 48 },
                              bgcolor: getCategoryColor(service.serviceCategory),
                              mr: 1.5,
                              fontSize: { xs: '1.25rem', sm: '1.5rem' }
                            }}
                          >
                            {getServiceIcon(service.serviceCategory)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="h6" 
                              component="h3"
                              sx={{ fontSize: { xs: '0.95rem', sm: '1.125rem' }, mb: 0.5 }}
                            >
                              {service.name}
                            </Typography>
                            <Chip
                              label={service.serviceCategory}
                              size="small"
                              sx={{
                                bgcolor: getCategoryColor(service.serviceCategory),
                                color: 'white',
                                fontWeight: 600,
                                height: { xs: 20, sm: 24 },
                                fontSize: { xs: '0.65rem', sm: '0.75rem' }
                              }}
                            />
                          </Box>
                          {selectedService?.id === service.id && (
                            <CheckCircleIcon color="primary" sx={{ fontSize: { xs: 24, sm: 32 } }} />
                          )}
                        </Box>
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={`$${service.price.toFixed(2)}`}
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Continue Button - Fixed on mobile */}
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
          zIndex: { xs: 1000, sm: 'auto' }
        }}
      >
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!selectedService}
          onClick={handleContinue}
          endIcon={<ArrowForwardIcon />}
          sx={{
            py: { xs: 1.5, sm: 1.5 },
            fontSize: { xs: '1rem', sm: '1rem' }
          }}
        >
          Continue to Date & Time
        </Button>
      </Box>

      {/* Spacer for fixed button on mobile */}
      {selectedService && (
        <Box sx={{ display: { xs: 'block', sm: 'none' }, height: 80 }} />
      )}
    </Box>
  );
};

export default ServiceSelection;
