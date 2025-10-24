/**
 * CustomerInfo - Step 4: Customer information
 * For new customers or updating contact info
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon
} from '@mui/icons-material';

interface CustomerInfoProps {
  bookingData: any;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: any) => void;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({
  bookingData,
  onNext,
  onBack,
  onUpdate
}) => {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: bookingData.customerFirstName || '',
    lastName: bookingData.customerLastName || '',
    email: bookingData.customerEmail || '',
    phone: bookingData.customerPhone || '',
    address: bookingData.customerAddress || '',
    city: bookingData.customerCity || '',
    state: bookingData.customerState || '',
    zipCode: bookingData.customerZipCode || '',
    emergencyContactName: bookingData.emergencyContactName || '',
    emergencyContactPhone: bookingData.emergencyContactPhone || '',
    agreeToTerms: false
  });

  // Check if customer already selected (coming from pet selection)
  const hasExistingCustomer = bookingData.customerId;

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    onUpdate({
      customerFirstName: formData.firstName,
      customerLastName: formData.lastName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      customerCity: formData.city,
      customerState: formData.state,
      customerZipCode: formData.zipCode,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone
    });
    onNext();
  };

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
        Your Information
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Show existing customer info if already selected */}
      {hasExistingCustomer && bookingData.customerName && (
        <Card sx={{ mb: 3, bgcolor: 'success.50', borderLeft: '4px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Typography variant="subtitle2" color="success.main" gutterBottom>
              ✓ Customer Account Found
            </Typography>
            <Typography variant="h6">
              {bookingData.customerName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {bookingData.customerEmail} • {bookingData.customerPhone}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              You can update your contact information below if needed.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Customer Information Form */}
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
            Personal Information
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="First Name"
            fullWidth
            required
            value={formData.firstName}
            onChange={handleChange('firstName')}
            placeholder="John"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Last Name"
            fullWidth
            required
            value={formData.lastName}
            onChange={handleChange('lastName')}
            placeholder="Doe"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="john.doe@example.com"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Phone Number"
            type="tel"
            fullWidth
            required
            value={formData.phone}
            onChange={handleChange('phone')}
            placeholder="(555) 123-4567"
          />
        </Grid>

        {/* Address Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 600, mt: 2 }}>
            Address (Optional)
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Street Address"
            fullWidth
            value={formData.address}
            onChange={handleChange('address')}
            placeholder="123 Main Street"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="City"
            fullWidth
            value={formData.city}
            onChange={handleChange('city')}
            placeholder="Springfield"
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            label="State"
            fullWidth
            value={formData.state}
            onChange={handleChange('state')}
            placeholder="IL"
            inputProps={{ maxLength: 2 }}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            label="ZIP Code"
            fullWidth
            value={formData.zipCode}
            onChange={handleChange('zipCode')}
            placeholder="62701"
            inputProps={{ maxLength: 10 }}
          />
        </Grid>

        {/* Emergency Contact */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.125rem', fontWeight: 600, mt: 2 }}>
            Emergency Contact (Optional)
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Emergency Contact Name"
            fullWidth
            value={formData.emergencyContactName}
            onChange={handleChange('emergencyContactName')}
            placeholder="Jane Doe"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Emergency Contact Phone"
            type="tel"
            fullWidth
            value={formData.emergencyContactPhone}
            onChange={handleChange('emergencyContactPhone')}
            placeholder="(555) 987-6543"
          />
        </Grid>

        {/* Terms and Conditions */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'grey.50', mt: 2 }}>
            <CardContent>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={handleChange('agreeToTerms')}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" style={{ color: '#1976d2' }}>
                      Terms and Conditions
                    </a>
                    {' '}and{' '}
                    <a href="/privacy" target="_blank" style={{ color: '#1976d2' }}>
                      Privacy Policy
                    </a>
                  </Typography>
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Buttons - Fixed on mobile */}
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
          zIndex: { xs: 1000, sm: 'auto' },
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Button
          variant="outlined"
          size="large"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{ py: { xs: 1.5, sm: 1.5 } }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleContinue}
          endIcon={<ArrowForwardIcon />}
          sx={{ py: { xs: 1.5, sm: 1.5 } }}
        >
          Continue to Review
        </Button>
      </Box>

      {/* Spacer for fixed button on mobile */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, height: 80 }} />
    </Box>
  );
};

export default CustomerInfo;
