/**
 * BookingPortal - Customer-facing booking interface
 * 
 * Features:
 * - Mobile-first responsive design
 * - SEO optimized
 * - Embeddable widget support
 * - Multi-step booking flow
 * - Real-time availability
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ServiceSelection from './steps/ServiceSelection';
import DateTimeSelection from './steps/DateTimeSelection';
import PetSelection from './steps/PetSelection';
import AddOnsSelection from './steps/AddOnsSelection';
import CustomerInfo from './steps/CustomerInfo';
import ReviewBooking from './steps/ReviewBooking';
import BookingConfirmation from './steps/BookingConfirmation';

// Booking steps
const steps = [
  'Select Service',
  'Choose Date & Time',
  'Select Pets',
  'Add-Ons',
  'Your Information',
  'Review & Pay'
];

interface BookingData {
  serviceId?: string;
  serviceName?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  petIds?: string[];
  addOns?: string[];
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  totalPrice?: number;
}

const BookingPortal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Check if running in embedded mode
    const embedded = searchParams.get('embedded') === 'true';
    setIsEmbedded(embedded);

    // Pre-fill service if provided in URL
    const serviceId = searchParams.get('serviceId');
    if (serviceId) {
      setBookingData(prev => ({ ...prev, serviceId }));
    }
  }, [searchParams]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    // Scroll to top on mobile
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <ServiceSelection
            bookingData={bookingData}
            onNext={handleNext}
            onUpdate={updateBookingData}
          />
        );
      case 1:
        return (
          <DateTimeSelection
            bookingData={bookingData}
            onNext={handleNext}
            onBack={handleBack}
            onUpdate={updateBookingData}
          />
        );
      case 2:
        return (
          <PetSelection
            bookingData={bookingData}
            onNext={handleNext}
            onBack={handleBack}
            onUpdate={updateBookingData}
          />
        );
      case 3:
        return (
          <AddOnsSelection
            bookingData={bookingData}
            onNext={handleNext}
            onBack={handleBack}
            onUpdate={updateBookingData}
          />
        );
      case 4:
        return (
          <CustomerInfo
            bookingData={bookingData}
            onNext={handleNext}
            onBack={handleBack}
            onUpdate={updateBookingData}
          />
        );
      case 5:
        return (
          <ReviewBooking
            bookingData={bookingData}
            onNext={handleNext}
            onBack={handleBack}
            onUpdate={updateBookingData}
          />
        );
      case 6:
        return (
          <BookingConfirmation
            bookingData={bookingData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Book Your Pet's Stay | Tailtown Pet Resort</title>
        <meta 
          name="description" 
          content="Book boarding, daycare, grooming, and training services for your pet. Easy online booking with real-time availability." 
        />
        <meta name="keywords" content="pet boarding, dog daycare, pet grooming, dog training, pet resort booking" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:title" content="Book Your Pet's Stay | Tailtown Pet Resort" />
        <meta property="og:description" content="Book boarding, daycare, grooming, and training services for your pet." />
        <meta property="og:type" content="website" />
        
        {/* Mobile Web App */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Helmet>

      <Box
        sx={{
          minHeight: isEmbedded ? 'auto' : '100vh',
          bgcolor: isEmbedded ? 'transparent' : 'background.default',
          py: isEmbedded ? 2 : { xs: 2, sm: 4 }
        }}
      >
        <Container 
          maxWidth="lg"
          sx={{
            px: { xs: 2, sm: 3 }
          }}
        >
          {/* Header - Hide in embedded mode */}
          {!isEmbedded && (
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Box
                component="h1"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.5rem' },
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1
                }}
              >
                Book Your Pet's Stay
              </Box>
              <Box
                component="p"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'text.secondary',
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Reserve boarding, daycare, grooming, or training services in just a few easy steps
              </Box>
            </Box>
          )}

          {/* Progress Stepper - Horizontal on desktop, compact on mobile */}
          {activeStep < 6 && (
            <Paper 
              elevation={isEmbedded ? 0 : 2}
              sx={{ 
                p: { xs: 2, sm: 3 },
                mb: 3,
                bgcolor: isEmbedded ? 'transparent' : 'background.paper'
              }}
            >
              <Stepper 
                activeStep={activeStep}
                orientation={isMobile ? 'vertical' : 'horizontal'}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{isMobile && index !== activeStep ? '' : label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Paper 
            elevation={isEmbedded ? 0 : 3}
            sx={{ 
              p: { xs: 2, sm: 4 },
              bgcolor: isEmbedded ? 'transparent' : 'background.paper',
              borderRadius: 2
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              renderStep()
            )}
          </Paper>

          {/* Footer - Hide in embedded mode */}
          {!isEmbedded && (
            <Box 
              sx={{ 
                mt: 4, 
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'text.secondary'
              }}
            >
              Need help? Call us at (555) 123-4567 or email info@tailtown.com
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default BookingPortal;
