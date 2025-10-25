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
  TextField,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DateTimeSelection.css';

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
    // If end date is before new start date, clear it
    if (date && endDate && endDate < date) {
      setEndDate(null);
    }
    // Close start date and open end date picker
    if (date) {
      setStartDateOpen(false);
      setTimeout(() => setEndDateOpen(true), 200);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    if (date) {
      setEndDateOpen(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        When would you like to book?
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box className="date-picker-container">
              <DatePicker
                ref={startDatePickerRef}
                selected={startDate}
                onChange={handleStartDateChange}
                minDate={new Date()}
                dateFormat="MM/dd/yyyy"
                placeholderText="Click to select check-in date"
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
                inline={false}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box className="date-picker-container">
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                minDate={startDate || new Date()}
                dateFormat="MM/dd/yyyy"
                placeholderText="Click to select check-out date"
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
                inline={false}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

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
