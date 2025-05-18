import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MedicationIcon from '@mui/icons-material/Medication';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import NoteIcon from '@mui/icons-material/Note';
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
    // This would typically come from your state or be passed as a prop
    // For now, we'll just return a placeholder
    if (!suiteId) return null;
    
    return {
      id: suiteId,
      name: 'Selected Suite', // This would be replaced with actual suite data
      type: 'Standard'
    };
  };

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
        text = `Every ${recurringPattern.interval || 1} month(s) on day ${startDate?.getDate() || '?'}`;
        break;
      default:
        text = 'Custom recurrence';
    }
    
    if (recurringPattern.endDate) {
      text += ` until ${format(recurringPattern.endDate, 'MMMM d, yyyy')}`;
    }
    
    return text;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Notes & Confirmation
      </Typography>
      
      {/* Notes Section */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          <NoteIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
          Reservation Notes
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Staff Notes"
              placeholder="Internal notes for staff only"
              fullWidth
              multiline
              rows={3}
              value={staffNotes}
              onChange={handleStaffNotesChange}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Customer Notes"
              placeholder="Notes visible to the customer"
              fullWidth
              multiline
              rows={3}
              value={customerNotes}
              onChange={handleCustomerNotesChange}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
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
      
      {/* Reservation Summary */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
          Reservation Summary
        </Typography>
        
        {/* Customer & Pets Summary */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography>Customer & Pets</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Customer" 
                  secondary={
                    customer
                      ? `${customer.firstName} ${customer.lastName} (${customer.email})`
                      : 'No customer selected'
                  } 
                />
              </ListItem>
              
              <Divider component="li" sx={{ my: 1 }} />
              
              <ListItem>
                <ListItemIcon>
                  <PetsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`Pets (${selectedPetObjects.length})`} 
                  secondary={
                    selectedPetObjects.length
                      ? selectedPetObjects.map(pet => pet.name).join(', ')
                      : 'No pets selected'
                  } 
                />
              </ListItem>
              
              {selectedPetObjects.length > 1 && (
                <ListItem>
                  <ListItemText
                    primary="Lodging Preference"
                    secondary={
                      lodgingPreference === LodgingPreference.STANDARD
                        ? 'Standard (separate accommodations)'
                        : lodgingPreference === LodgingPreference.SHARED_WITH_SIBLING
                        ? 'Shared accommodations (pets together)'
                        : 'Explicitly separate accommodations'
                    }
                    primaryTypographyProps={{ variant: 'body2' }}
                    sx={{ pl: 4 }}
                  />
                </ListItem>
              )}
            </List>
          </AccordionDetails>
        </Accordion>
        
        {/* Schedule Summary */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ mr: 1 }} />
              <Typography>Schedule</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              <ListItem>
                <ListItemText 
                  primary="Service" 
                  secondary={service ? service.name : 'No service selected'} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Start Date & Time" 
                  secondary={formatDateTime(startDate)} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="End Date & Time" 
                  secondary={formatDateTime(endDate)} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <EventRepeatIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Recurrence" 
                  secondary={getRecurrenceText()} 
                />
              </ListItem>
              
              {suiteId && (
                <ListItem>
                  <ListItemIcon>
                    <MeetingRoomIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Selected Suite" 
                    secondary={getSelectedSuite()?.name || suiteId} 
                  />
                </ListItem>
              )}
            </List>
          </AccordionDetails>
        </Accordion>
        
        {/* Feeding Preferences Summary */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FastfoodIcon sx={{ mr: 1 }} />
              <Typography>Feeding Preferences</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {selectedPetObjects.length > 0 ? (
              <Grid container spacing={2}>
                {selectedPetObjects.map(pet => {
                  const petFeedingPref = feedingPreferences[pet.id];
                  
                  return (
                    <Grid item xs={12} key={pet.id}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2">
                          {pet.name}
                        </Typography>
                        
                        {petFeedingPref ? (
                          <List dense disablePadding>
                            <ListItem>
                              <ListItemText 
                                primary="Feeding Times" 
                                secondary={
                                  petFeedingPref.feedingSchedule.length
                                    ? petFeedingPref.feedingSchedule.join(', ')
                                    : 'None specified'
                                } 
                              />
                            </ListItem>
                            
                            <ListItem>
                              <ListItemText 
                                primary="Use House Food" 
                                secondary={petFeedingPref.useHouseFood ? 'Yes' : 'No'} 
                              />
                            </ListItem>
                            
                            <ListItem>
                              <ListItemText 
                                primary="Allow Food Add-ins" 
                                secondary={petFeedingPref.allowAddIns ? 'Yes' : 'No'} 
                              />
                            </ListItem>
                            
                            {petFeedingPref.probioticDetails && (
                              <ListItem>
                                <ListItemText 
                                  primary="Probiotics" 
                                  secondary={`${petFeedingPref.probioticDetails.quantity} ${
                                    petFeedingPref.probioticDetails.timing.length
                                      ? `(${petFeedingPref.probioticDetails.timing.join(', ')})`
                                      : ''
                                  }`} 
                                />
                              </ListItem>
                            )}
                            
                            {petFeedingPref.specialInstructions && (
                              <ListItem>
                                <ListItemText 
                                  primary="Special Instructions" 
                                  secondary={petFeedingPref.specialInstructions} 
                                />
                              </ListItem>
                            )}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No feeding preferences specified
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No pets selected
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
        
        {/* Medications Summary */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MedicationIcon sx={{ mr: 1 }} />
              <Typography>Medications</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {selectedPetObjects.length > 0 ? (
              <Grid container spacing={2}>
                {selectedPetObjects.map(pet => {
                  const petMeds = medications[pet.id] || [];
                  
                  return (
                    <Grid item xs={12} key={pet.id}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2">
                          {pet.name}
                        </Typography>
                        
                        {petMeds.length > 0 ? (
                          <List dense disablePadding>
                            {petMeds.map((med, index) => (
                              <React.Fragment key={med.id || index}>
                                <ListItem>
                                  <ListItemText 
                                    primary={med.name} 
                                    secondary={`${med.dosage} (${med.frequency.replace(/_/g, ' ')})`} 
                                  />
                                </ListItem>
                                
                                <ListItem>
                                  <ListItemText 
                                    primary="Timing Schedule" 
                                    secondary={med.timingSchedule.map(t => t.replace(/_/g, ' ')).join(', ')} 
                                    sx={{ pl: 2 }}
                                  />
                                </ListItem>
                                
                                {med.administrationMethod && (
                                  <ListItem>
                                    <ListItemText 
                                      primary="Administration Method" 
                                      secondary={med.administrationMethod} 
                                      sx={{ pl: 2 }}
                                    />
                                  </ListItem>
                                )}
                                
                                {med.specialInstructions && (
                                  <ListItem>
                                    <ListItemText 
                                      primary="Special Instructions" 
                                      secondary={med.specialInstructions} 
                                      sx={{ pl: 2 }}
                                    />
                                  </ListItem>
                                )}
                                
                                {index < petMeds.length - 1 && (
                                  <Divider component="li" sx={{ my: 1 }} />
                                )}
                              </React.Fragment>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No medications specified
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No pets selected
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};

export default NotesConfirmationStep;
