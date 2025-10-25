/**
 * DateTimeSelection - Step 2: Choose date and time
 * Mobile-optimized calendar and time picker
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  TextField
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

interface DateTimeSelectionProps {
  bookingData: any;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: any) => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  bookingData,
  onNext,
  onBack,
  onUpdate
}) => {
  const [startDate, setStartDate] = useState(bookingData.startDate || '');
  const [endDate, setEndDate] = useState(bookingData.endDate || '');
  const startDateRef = useRef<HTMLInputElement>(null);

  // Auto-open calendar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (startDateRef.current) {
        startDateRef.current.focus();
        // Use showPicker() if available (modern browsers)
        try {
          if ('showPicker' in startDateRef.current) {
            (startDateRef.current as any).showPicker();
          } else {
            // Fallback to click for older browsers
            startDateRef.current.click();
          }
        } catch (error) {
          // Silently fail if showPicker is not supported
          console.log('Date picker auto-open not supported in this browser');
        }
      }
    }, 300); // Increased delay for better reliability
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    onUpdate({ startDate, endDate });
    onNext();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        When would you like to book?
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: new Date().toISOString().split('T')[0], // Disable past dates
            }}
            inputRef={startDateRef}
            helperText="Select your check-in date"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="End Date"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: startDate || new Date().toISOString().split('T')[0], // Disable dates before start date
            }}
            helperText="Select your check-out date"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={!startDate || !endDate}
          endIcon={<ArrowForwardIcon />}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default DateTimeSelection;
