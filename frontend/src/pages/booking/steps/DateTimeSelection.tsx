/**
 * DateTimeSelection - Step 2: Choose date and time
 * Mobile-optimized calendar and time picker
 */

import React, { useState, useRef } from 'react';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const [startDate, setStartDate] = useState<Date | null>(
    bookingData.startDate ? new Date(bookingData.startDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    bookingData.endDate ? new Date(bookingData.endDate) : null
  );
  const [startDateOpen, setStartDateOpen] = useState(true);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const startDatePickerRef = useRef<any>(null);

  const handleContinue = () => {
    onUpdate({ 
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0]
    });
    onNext();
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setStartDateOpen(false);
    // If end date is before new start date, clear it
    if (date && endDate && endDate < date) {
      setEndDate(null);
    }
    // Auto-open end date picker
    if (date) {
      setTimeout(() => setEndDateOpen(true), 100);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setEndDateOpen(false);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        When would you like to book?
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ '& .react-datepicker-wrapper': { width: '100%' } }}>
            <DatePicker
              ref={startDatePickerRef}
              selected={startDate}
              onChange={handleStartDateChange}
              minDate={new Date()}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select check-in date"
              customInput={
                <TextField
                  label="Start Date"
                  fullWidth
                  helperText="Select your check-in date"
                  InputLabelProps={{ shrink: true }}
                />
              }
              open={startDateOpen}
              onClickOutside={() => setStartDateOpen(false)}
              onInputClick={() => setStartDateOpen(true)}
              shouldCloseOnSelect={true}
              popperPlacement="bottom-start"
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ '& .react-datepicker-wrapper': { width: '100%' } }}>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              minDate={startDate || new Date()}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select check-out date"
              customInput={
                <TextField
                  label="End Date"
                  fullWidth
                  helperText="Select your check-out date"
                  InputLabelProps={{ shrink: true }}
                />
              }
              disabled={!startDate}
              open={endDateOpen}
              onClickOutside={() => setEndDateOpen(false)}
              onInputClick={() => setEndDateOpen(true)}
              shouldCloseOnSelect={true}
              popperPlacement="bottom-start"
            />
          </Box>
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
