import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MedicationIcon from '@mui/icons-material/Medication';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { format } from 'date-fns';

import { useReservationWizard } from '../ReservationWizard';
import { LodgingPreference } from '../../../../types/petCare';

/**
 * Notes & Confirmation Step
 * 
 * Final step in the reservation wizard where the user adds notes
 * and reviews all details before submitting.
 */
const NotesConfirmationStep: React.FC = () => {
  const { formData, dispatch } = useReservationWizard();
  const { 
    customer,
    pets,
    selectedPets,
    feedingPreferences,
    medications,
    service,
    lodgingPreference,
    suiteId,
    startDate,
    endDate,
    isRecurring,
    recurringPattern,
    staffNotes,
    customerNotes,
    status
  } = formData;

  // Handle staff notes change
  const handleStaffNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_STAFF_NOTES', payload: event.target.value });
  };

  // Handle customer notes change
  const handleCustomerNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_CUSTOMER_NOTES', payload: event.target.value });
  };

  // Handle status change
  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement> | any) => {
    dispatch({ type: 'SET_STATUS', payload: event.target.value as string });
  };

  // Format date & time
  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Not set';
    return format(date, 'MMMM d, yyyy h:mm a');
  };

  // Ensure we have selected pets
  const selectedPetObjects = pets.filter(pet => selectedPets.includes(pet.id));

  // Find selected suite details
  const getSelectedSuite = () => {
    // If no suite ID is available, return null
    if (!suiteId) return null;
    
    // Map suite types to display names
    const suiteTypes: Record<string, string> = {
      'STANDARD_SUITE': 'Standard Suite',
      'STANDARD_PLUS_SUITE': 'Standard Plus Suite',
      'VIP_SUITE': 'VIP Suite'
    };
    
    // Use the provided suite information if available, otherwise extract from ID and other properties
    const displayNumber = formData.suiteNumber || suiteId.split('-').pop() || '';
    const displayType = formData.suiteTypeDisplay || 
                        (formData.suiteType ? suiteTypes[formData.suiteType] || 'Standard Suite' : 
                        (lodgingPreference ? suiteTypes[lodgingPreference] || 'Standard Suite' : 'Standard Suite'));
    
    return {
      id: suiteId,
      name: `Suite ${displayNumber}`,
      number: displayNumber,
      type: displayType
    };
  };
  
  // Get the suite information
  const suiteInfo = getSelectedSuite();

  // Get recurrence text
  const getRecurrenceText = () => {
    if (!isRecurring || !recurringPattern) return 'One-time reservation';
    
    let text = '';
    
    switch (recurringPattern.frequency) {
      case 'DAILY':
        text = `Every ${recurringPattern.interval || 1} day(s)`;
        break;
      case 'WEEKLY':
        text = `Every ${recurringPattern.interval || 1} week(s) on `;
        text += (recurringPattern.daysOfWeek || [])
          .map(day => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day])
          .join(', ');
        break;
      case 'MONTHLY':
        text = `Every ${recurringPattern.interval || 1} month(s)`;
        break;
      default:
        text = 'Custom recurrence';
    }
    
    if (recurringPattern.endDate) {
      text += ` until ${format(new Date(recurringPattern.endDate), 'MMMM d, yyyy')}`;
    } else if (recurringPattern.maxOccurrences) {
      text += ` for ${recurringPattern.maxOccurrences} occurrences`;
    }
    
    return text;
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Suite Information Banner */}
      {suiteInfo && (
        <Box 
          sx={{ 
            mb: 3, 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <MeetingRoomIcon fontSize="large" sx={{ color: 'primary.contrastText' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {suiteInfo.type} {suiteInfo.number ? suiteInfo.number : ''}
              </Typography>
              <Typography variant="body2">
                {service?.name || 'No Service Selected'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Notes Section - More Compact */}
      <Paper elevation={0} variant="outlined" sx={{ p: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Notes & Status
        </Typography>
        
        <Grid container spacing={1}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Staff Notes"
              placeholder="Staff only"
              fullWidth
              multiline
              rows={2}
              size="small"
              value={staffNotes}
              onChange={handleStaffNotesChange}
              variant="outlined"
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Customer Notes"
              placeholder="Visible to customer"
              fullWidth
              multiline
              rows={2}
              size="small"
              value={customerNotes}
              onChange={handleCustomerNotesChange}
              variant="outlined"
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel id="reservation-status-label">Status</InputLabel>
              <Select
                labelId="reservation-status-label"
                id="reservation-status"
                value={status}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="CHECKED_IN">Checked In</MenuItem>
                <MenuItem value="CHECKED_OUT">Checked Out</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="NO_SHOW">No Show</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Reservation Summary - Compact Version */}
      <Paper elevation={0} variant="outlined" sx={{ p: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Reservation Summary
        </Typography>
        
        {/* Customer & Pets Summary */}
        <Box sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            Customer & Pets
          </Typography>
          
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Customer:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customer
                  ? `${customer?.firstName || ''} ${customer?.lastName || ''} ${customer?.email ? `(${customer.email})` : ''}`
                  : 'No customer selected'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Pets ({selectedPetObjects.length}):
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPetObjects.length
                  ? selectedPetObjects.map(pet => pet.name).join(', ')
                  : 'No pets selected'}
              </Typography>
              
              {selectedPetObjects.length > 1 && (
                <Typography variant="body2" color="text.secondary">
                  Lodging: {lodgingPreference === LodgingPreference.STANDARD
                    ? 'Separate accommodations'
                    : lodgingPreference === LodgingPreference.SHARED_WITH_SIBLING
                    ? 'Shared accommodations'
                    : 'Explicitly separate'}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
        
        {/* Schedule Summary */}
        <Box sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            Schedule
          </Typography>
          
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Service:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {service?.name || 'No service selected'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Start:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDateTime(startDate)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                End:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDateTime(endDate)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                <EventRepeatIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom', color: 'primary.main' }} />
                Recurrence:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getRecurrenceText()}
              </Typography>
            </Grid>
            
            {suiteId && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <MeetingRoomIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                  Suite:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getSelectedSuite()?.name || `Suite ${suiteId.split('-').pop()}`} ({getSelectedSuite()?.type || 'Standard'})
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
        
        {/* Feeding Preferences Summary */}
        <Box sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FastfoodIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            Feeding Preferences
          </Typography>
          
          {selectedPetObjects.length > 0 ? (
            <Grid container spacing={1}>
              {selectedPetObjects.map(pet => {
                const petFeedingPref = feedingPreferences[pet.id];
                
                return (
                  <Grid item xs={12} key={pet.id}>
                    <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#ffffff' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {pet.name}
                      </Typography>
                      
                      {petFeedingPref ? (
                        <Grid container spacing={1}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                              Feeding Times: {petFeedingPref.feedingSchedule.length
                                ? petFeedingPref.feedingSchedule.join(', ')
                                : 'None'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                              Use House Food: {petFeedingPref.useHouseFood ? 'Yes' : 'No'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                              Allow Add-ins: {petFeedingPref.allowAddIns ? 'Yes' : 'No'}
                            </Typography>
                          </Grid>
                          
                          {petFeedingPref.probioticDetails && (
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                                Probiotic: {`${petFeedingPref.probioticDetails.quantity} (${petFeedingPref.probioticDetails.timing.join(', ')})`}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          No feeding preferences specified
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No pets selected
            </Typography>
          )}
        </Box>
        
        {/* Medications Summary */}
        <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <MedicationIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            Medications
          </Typography>
          
          {selectedPetObjects.length > 0 ? (
            <Grid container spacing={1}>
              {selectedPetObjects.map(pet => {
                const petMeds = medications[pet.id] || [];
                
                return (
                  <Grid item xs={12} key={pet.id}>
                    <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#ffffff' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {pet.name}
                      </Typography>
                      
                      {petMeds.length > 0 ? (
                        <Grid container spacing={1}>
                          {petMeds.map((med, index) => (
                            <Grid item xs={12} key={med.id || index}>
                              <Box sx={{ mb: index < petMeds.length - 1 ? 1 : 0 }}>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'medium' }}>
                                  {med.name} - {med.dosage} ({med.frequency.replace(/_/g, ' ')})
                                </Typography>
                                
                                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                                  Times: {med.timingSchedule.map(t => t.replace(/_/g, ' ')).join(', ')}
                                </Typography>
                                
                                {med.administrationMethod && (
                                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                                    Method: {med.administrationMethod}
                                  </Typography>
                                )}
                              </Box>
                              {index < petMeds.length - 1 && <Divider sx={{ my: 0.5 }} />}
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          No medications specified
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No pets selected
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default NotesConfirmationStep;
