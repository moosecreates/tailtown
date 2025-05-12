import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format, parse } from 'date-fns';
import staffService, { StaffSchedule, ScheduleStatus, Staff } from '../../services/staffService';

interface StaffScheduleFormProps {
  open: boolean;
  onClose: () => void;
  staffId?: string;
  schedule?: StaffSchedule;
  onSave: (schedule: StaffSchedule) => void;
  isEditing: boolean;
  allStaff?: Staff[];
  initialDate?: Date;
}

const StaffScheduleForm: React.FC<StaffScheduleFormProps> = ({
  open,
  onClose,
  staffId,
  schedule,
  onSave,
  isEditing,
  allStaff,
  initialDate
}) => {
  const [formData, setFormData] = useState<Partial<StaffSchedule>>({
    id: schedule?.id || undefined, // Keep the ID for updates to prevent duplicates
    staffId: staffId || '',
    date: initialDate ? format(initialDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    status: ScheduleStatus.SCHEDULED,
    notes: '',
    location: '',
    startingLocation: '', // Add starting location field
    role: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (schedule) {
      setFormData({
        ...schedule,
        startingLocation: schedule.startingLocation || '', // Initialize starting location
        date: schedule.date ? schedule.date.toString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else if (staffId) {
      setFormData(prev => ({ ...prev, staffId }));
    }
  }, [schedule, staffId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear error when field is updated
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear error when field is updated
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
      if (errors.date) {
        setErrors(prev => ({ ...prev, date: '' }));
      }
    }
  };
  
  const handleTimeChange = (field: string, time: Date | null) => {
    if (time) {
      setFormData(prev => ({ ...prev, [field]: format(time, 'HH:mm') }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.staffId) {
      newErrors.staffId = 'Staff member is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    onSave(formData as StaffSchedule);
  };
  
  const parseTimeString = (timeString: string): Date => {
    return parse(timeString, 'HH:mm', new Date());
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Edit Schedule' : 'Add New Schedule'}
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {allStaff && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.staffId}>
                  <InputLabel>Staff Member</InputLabel>
                  <Select
                    name="staffId"
                    value={formData.staffId || ''}
                    onChange={handleSelectChange}
                    label="Staff Member"
                  >
                    {allStaff.map(staff => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.firstName} {staff.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.staffId && <FormHelperText>{errors.staffId}</FormHelperText>}
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date"
                value={formData.date ? new Date(formData.date) : null}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TimePicker
                label="Start Time"
                value={formData.startTime ? parseTimeString(formData.startTime) : null}
                onChange={(time) => handleTimeChange('startTime', time)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startTime,
                    helperText: errors.startTime
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TimePicker
                label="End Time"
                value={formData.endTime ? parseTimeString(formData.endTime) : null}
                onChange={(time) => handleTimeChange('endTime', time)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.endTime,
                    helperText: errors.endTime
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status || ScheduleStatus.SCHEDULED}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  {Object.values(ScheduleStatus).map(status => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                placeholder="Department or work area"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Starting Location"
                name="startingLocation"
                value={formData.startingLocation || ''}
                onChange={handleInputChange}
                placeholder="Initial assignment location"
                helperText="Where staff should report at the beginning of shift"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={formData.role || ''}
                onChange={handleInputChange}
                placeholder="Specific role for this shift"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Any additional information about this schedule"
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {isEditing ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StaffScheduleForm;
