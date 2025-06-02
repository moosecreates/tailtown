import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Checkbox, FormControlLabel, Alert, CircularProgress } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Service, AddOnService } from '../../../../types/service';
import { serviceManagement } from '../../../../services/serviceManagement';
import { useReservationWizard } from '../ReservationWizard';

// Helper function to format price as currency
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const AddOnsStep: React.FC = () => {
  const { formData, dispatch } = useReservationWizard();
  const { service, addOns } = formData;
  
  const [availableAddOns, setAvailableAddOns] = useState<AddOnService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddOns = async () => {
      if (!service?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('AddOnsStep: Fetching suggested add-ons for service:', service.id);
        
        // Get the add-ons specifically for this service
        const addOnServices = await serviceManagement.getServiceAddOns(service.id);
        
        console.log('AddOnsStep: Found suggested add-ons:', addOnServices);
        setAvailableAddOns(addOnServices || []);
        setLoading(false);
      } catch (err) {
        console.error('AddOnsStep: Error fetching add-ons:', err);
        setError('Failed to load suggested add-ons');
        setLoading(false);
      }
    };
    
    fetchAddOns();
  }, [service?.id]);

  // Check if an add-on is selected
  const isAddOnSelected = (addOnId: string): boolean => {
    return addOns.some((addon: any) => addon.id === addOnId);
  };

  // Toggle add-on selection
  const toggleAddOn = (addOn: AddOnService) => {
    if (isAddOnSelected(addOn.id || '')) {
      // Remove the add-on
      const updatedAddOns = addOns.filter((a: any) => a.id !== addOn.id);
      dispatch({ type: 'SET_ADDONS', payload: updatedAddOns });
    } else {
      // Add the add-on
      const updatedAddOns = [...addOns, {
        id: addOn.id,
        name: addOn.name,
        price: addOn.price,
        quantity: 1,
        description: addOn.description
      }];
      dispatch({ type: 'SET_ADDONS', payload: updatedAddOns });
    }
  };

  const { goToNextStep, goToPreviousStep } = useReservationWizard();
  
  const handleNext = () => {
    goToNextStep();
  };

  const handleBack = () => {
    goToPreviousStep();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (availableAddOns.length === 0) {
    return (
      <Box>
        <Alert severity="info" sx={{ my: 2 }}>
          No suggested add-ons available for this service.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Suggested Add-On Services
      </Typography>
      <Typography variant="body1" gutterBottom>
        Select any additional services you would like to add to your reservation.
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {availableAddOns.map((addOn) => (
          <Grid item xs={12} sm={6} md={4} key={addOn.id}>
            <Card 
              variant={isAddOnSelected(addOn.id || '') ? "outlined" : "elevation"} 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: isAddOnSelected(addOn.id || '') ? 'primary.main' : 'transparent',
                bgcolor: isAddOnSelected(addOn.id || '') ? 'primary.lighter' : 'background.paper',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {addOn.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {addOn.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatPrice(addOn.price)}
                </Typography>
              </CardContent>
              <CardActions>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={isAddOnSelected(addOn.id || '')}
                      onChange={() => toggleAddOn(addOn)}
                      color="primary"
                    />
                  }
                  label={isAddOnSelected(addOn.id || '') ? "Selected" : "Select"}
                />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          Selected Add-Ons: {addOns.length}
        </Typography>
        {addOns.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {addOns.map((addon: any) => (
              <Typography key={addon.id} variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <AddShoppingCartIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                {addon.name} - {formatPrice(addon.price)}
              </Typography>
            ))}
          </Box>
        )}
        </Box>
        
        {/* Navigation buttons removed to avoid duplication with parent component */}
      </Box>
    </Box>
  );
};

export default AddOnsStep;
