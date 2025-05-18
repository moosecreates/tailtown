import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import MedicationIcon from '@mui/icons-material/Medication';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useReservationWizard } from '../ReservationWizard';
import { Pet } from '../../../../types/pet';
import {
  FeedingTime,
  MedicationFrequency,
  MedicationTiming,
  PetFeedingPreference,
  PetMedication,
  ProbioticDetails
} from '../../../../types/petCare';

/**
 * Interface for medication form data
 */
interface MedicationFormData {
  id?: string;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  timingSchedule: MedicationTiming[];
  administrationMethod: string;
  specialInstructions: string;
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * Care Requirements Step
 * 
 * Second step in the reservation wizard where the user specifies
 * feeding preferences, medications, and other care needs for each pet.
 */
const CareRequirementsStep: React.FC = () => {
  const { formData, dispatch } = useReservationWizard();
  const { pets, selectedPets, feedingPreferences, medications } = formData;

  // Track which pet is currently being edited
  const [activePet, setActivePet] = useState<string | null>(
    selectedPets.length > 0 ? selectedPets[0] : null
  );

  // Track active tab (feeding vs medications)
  const [activeTab, setActiveTab] = useState(0);

  // State for medication form
  const [medicationForm, setMedicationForm] = useState<MedicationFormData>({
    name: '',
    dosage: '',
    frequency: MedicationFrequency.ONCE_DAILY,
    timingSchedule: [MedicationTiming.MORNING],
    administrationMethod: '',
    specialInstructions: '',
    startDate: null,
    endDate: null
  });
  
  // State for editing a medication
  const [editingMedicationId, setEditingMedicationId] = useState<string | null | undefined>(null);

  // Handler for changing the active pet tab
  const handlePetChange = (petId: string) => {
    setActivePet(petId);
    setActiveTab(0); // Reset to feeding tab when switching pets
  };

  // Handler for changing the active tab (feeding vs medications)
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Get the active pet object
  const activePetObj = pets.find(pet => pet.id === activePet);

  // Get the feeding preference for the active pet
  const activeFeedingPreference = activePet ? feedingPreferences[activePet] : undefined;

  // Get medications for the active pet
  const activeMedications = activePet && medications[activePet] ? medications[activePet] : [];

  // Handler for updating feeding preferences
  const updateFeedingPreference = (updates: Partial<PetFeedingPreference>) => {
    if (!activePet) return;

    const currentPreference = feedingPreferences[activePet] || {
      petId: activePet,
      feedingSchedule: [],
      useHouseFood: false,
      allowAddIns: false
    };

    dispatch({
      type: 'SET_FEEDING_PREFERENCE',
      payload: {
        petId: activePet,
        preference: {
          ...currentPreference,
          ...updates
        } as PetFeedingPreference
      }
    });
  };

  // Handler for toggling feeding time
  const toggleFeedingTime = (time: FeedingTime) => {
    if (!activePet) return;

    const currentPreference = feedingPreferences[activePet] || {
      petId: activePet,
      feedingSchedule: [],
      useHouseFood: false,
      allowAddIns: false
    };

    let newSchedule: FeedingTime[];
    if (currentPreference.feedingSchedule.includes(time)) {
      newSchedule = currentPreference.feedingSchedule.filter(t => t !== time);
    } else {
      newSchedule = [...currentPreference.feedingSchedule, time];
    }

    updateFeedingPreference({ feedingSchedule: newSchedule });
  };

  // Handler for updating probiotic details
  const updateProbioticDetails = (updates: Partial<ProbioticDetails>) => {
    if (!activePet) return;

    const currentPreference = feedingPreferences[activePet] || {
      petId: activePet,
      feedingSchedule: [],
      useHouseFood: false,
      allowAddIns: false
    };

    const currentProbiotics = currentPreference.probioticDetails || {
      quantity: '',
      timing: []
    };

    updateFeedingPreference({
      probioticDetails: {
        ...currentProbiotics,
        ...updates
      }
    });
  };

  // Handler for adding a new medication
  const handleAddMedication = () => {
    if (!activePet) return;

    if (editingMedicationId) {
      // Update existing medication
      const updatedMedications = activeMedications.map(med => 
        med.id === editingMedicationId
          ? {
              ...med,
              name: medicationForm.name,
              dosage: medicationForm.dosage,
              frequency: medicationForm.frequency,
              timingSchedule: medicationForm.timingSchedule,
              administrationMethod: medicationForm.administrationMethod,
              specialInstructions: medicationForm.specialInstructions,
              startDate: medicationForm.startDate ? medicationForm.startDate.toISOString() : undefined,
              endDate: medicationForm.endDate ? medicationForm.endDate.toISOString() : undefined
            }
          : med
      );

      dispatch({
        type: 'SET_MEDICATIONS',
        payload: {
          petId: activePet,
          medications: updatedMedications
        }
      });
    } else {
      // Add new medication
      const newMedication: PetMedication = {
        id: `temp-${Date.now()}`, // Temporary ID until saved to backend
        petId: activePet,
        name: medicationForm.name,
        dosage: medicationForm.dosage,
        frequency: medicationForm.frequency,
        timingSchedule: medicationForm.timingSchedule,
        administrationMethod: medicationForm.administrationMethod || undefined,
        specialInstructions: medicationForm.specialInstructions || undefined,
        startDate: medicationForm.startDate || undefined,
        endDate: medicationForm.endDate || undefined,
        isActive: true
      };

      dispatch({
        type: 'SET_MEDICATIONS',
        payload: {
          petId: activePet,
          medications: [...activeMedications, newMedication]
        }
      });
    }

    // Reset form and editing state
    setMedicationForm({
      name: '',
      dosage: '',
      frequency: MedicationFrequency.ONCE_DAILY,
      timingSchedule: [MedicationTiming.MORNING],
      administrationMethod: '',
      specialInstructions: '',
      startDate: null,
      endDate: null
    });
    setEditingMedicationId(null);
  };

  // Handler for editing a medication
  const handleEditMedication = (medication: PetMedication) => {
    setMedicationForm({
      id: medication.id,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      timingSchedule: medication.timingSchedule,
      administrationMethod: medication.administrationMethod || '',
      specialInstructions: medication.specialInstructions || '',
      startDate: medication.startDate ? new Date(medication.startDate) : null,
      endDate: medication.endDate ? new Date(medication.endDate) : null
    });
    setEditingMedicationId(medication.id);
  };

  // Handler for deleting a medication
  const handleDeleteMedication = (medicationId: string) => {
    if (!activePet) return;

    const updatedMedications = activeMedications.filter(med => med.id !== medicationId);

    dispatch({
      type: 'SET_MEDICATIONS',
      payload: {
        petId: activePet,
        medications: updatedMedications
      }
    });

    // If editing this medication, reset the form
    if (editingMedicationId === medicationId) {
      setMedicationForm({
        name: '',
        dosage: '',
        frequency: MedicationFrequency.ONCE_DAILY,
        timingSchedule: [MedicationTiming.MORNING],
        administrationMethod: '',
        specialInstructions: '',
        startDate: null,
        endDate: null
      });
      setEditingMedicationId(null);
    }
  };

  // Helper to get pet by ID
  const getPetById = (petId: string): Pet | undefined => {
    return pets.find(pet => pet.id === petId);
  };

  // Helper to check if a pet has complete care requirements
  const isPetComplete = (petId: string): boolean => {
    const hasFeedingPreference = !!feedingPreferences[petId];
    return hasFeedingPreference;
  };

  // Render pet tab buttons
  const renderPetTabs = () => {
    return (
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activePet}
          onChange={(e, value) => handlePetChange(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {selectedPets.map(petId => {
            const pet = getPetById(petId);
            if (!pet) return null;

            return (
              <Tab
                key={pet.id}
                label={pet.name}
                value={pet.id}
                icon={
                  isPetComplete(pet.id) ? (
                    <Chip size="small" color="success" label="Complete" sx={{ ml: 1 }} />
                  ) : (
                    <Chip size="small" color="warning" label="Incomplete" sx={{ ml: 1 }} />
                  )
                }
                iconPosition="end"
              />
            );
          })}
        </Tabs>
      </Box>
    );
  };

  // Render feeding and medication tabs
  const renderCareTabs = () => {
    return (
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab 
            icon={<FastfoodIcon />} 
            label="Feeding" 
            iconPosition="start" 
          />
          <Tab 
            icon={<MedicationIcon />} 
            label="Medications" 
            iconPosition="start" 
          />
        </Tabs>
      </Box>
    );
  };

  // Render feeding preferences form
  const renderFeedingPreferences = () => {
    if (!activePetObj) return null;

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Feeding Schedule for {activePetObj.name}
        </Typography>

        {/* Existing feeding notes from pet profile */}
        {activePetObj.foodNotes && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Existing Feeding Notes</Typography>
            {activePetObj.foodNotes}
          </Alert>
        )}

        {/* Feeding times */}
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Feeding Times</FormLabel>
          <FormGroup row>
            {Object.values(FeedingTime).map(time => (
              <FormControlLabel
                key={time}
                control={
                  <Checkbox
                    checked={activeFeedingPreference?.feedingSchedule.includes(time) || false}
                    onChange={() => toggleFeedingTime(time)}
                  />
                }
                label={time}
              />
            ))}
          </FormGroup>
        </FormControl>

        <Grid container spacing={2}>
          {/* House food option */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Switch
                    checked={activeFeedingPreference?.useHouseFood || false}
                    onChange={(e) => updateFeedingPreference({ useHouseFood: e.target.checked })}
                  />
                }
                label="Use House Food"
              />
            </FormControl>
          </Grid>

          {/* Add-ins permission */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Switch
                    checked={activeFeedingPreference?.allowAddIns || false}
                    onChange={(e) => updateFeedingPreference({ allowAddIns: e.target.checked })}
                  />
                }
                label="Allow Food Add-ins (cheese, toppers, etc.)"
              />
            </FormControl>
          </Grid>
        </Grid>

        {/* Probiotics section */}
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Probiotics</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Probiotic Quantity"
                  placeholder="e.g., 1 scoop, 1 tablet"
                  fullWidth
                  size="small"
                  value={activeFeedingPreference?.probioticDetails?.quantity || ''}
                  onChange={(e) => updateProbioticDetails({ quantity: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="probiotic-timing-label">Timing</InputLabel>
                  <Select
                    labelId="probiotic-timing-label"
                    multiple
                    value={activeFeedingPreference?.probioticDetails?.timing || []}
                    onChange={(e) => updateProbioticDetails({ 
                      timing: e.target.value as FeedingTime[] 
                    })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as FeedingTime[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(FeedingTime).map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Probiotic Instructions"
                  placeholder="Special instructions for probiotics"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  value={activeFeedingPreference?.probioticDetails?.notes || ''}
                  onChange={(e) => updateProbioticDetails({ notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Special feeding instructions */}
        <TextField
          label="Special Feeding Instructions"
          placeholder="Any special instructions for feeding this pet"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={activeFeedingPreference?.specialInstructions || ''}
          onChange={(e) => updateFeedingPreference({ specialInstructions: e.target.value })}
        />
      </Box>
    );
  };

  // Render medications form
  const renderMedications = () => {
    if (!activePetObj) return null;

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Medications for {activePetObj.name}
        </Typography>

        {/* Existing medication notes from pet profile */}
        {activePetObj.medicationNotes && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Existing Medication Notes</Typography>
            {activePetObj.medicationNotes}
          </Alert>
        )}

        {/* List of medications */}
        {activeMedications.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Current Medications
            </Typography>
            <Grid container spacing={2}>
              {activeMedications.map((medication) => (
                <Grid item xs={12} sm={6} key={medication.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {medication.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Dosage:</strong> {medication.dosage}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Frequency:</strong> {medication.frequency.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Timing:</strong>{' '}
                        {medication.timingSchedule.map((time) => time.replace(/_/g, ' ')).join(', ')}
                      </Typography>
                      {medication.administrationMethod && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Method:</strong> {medication.administrationMethod}
                        </Typography>
                      )}
                      {medication.specialInstructions && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Instructions:</strong> {medication.specialInstructions}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditMedication(medication)}
                        aria-label="Edit medication"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteMedication(medication.id || '')}
                        aria-label="Delete medication"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Add/Edit medication form */}
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle1" gutterBottom>
            {editingMedicationId ? 'Edit Medication' : 'Add Medication'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Medication Name"
                fullWidth
                required
                size="small"
                value={medicationForm.name}
                onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dosage"
                fullWidth
                required
                size="small"
                placeholder="e.g., 1 tablet, 5ml"
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="medication-frequency-label">Frequency</InputLabel>
                <Select
                  labelId="medication-frequency-label"
                  value={medicationForm.frequency}
                  label="Frequency"
                  onChange={(e) => setMedicationForm({ 
                    ...medicationForm, 
                    frequency: e.target.value as MedicationFrequency 
                  })}
                >
                  {Object.values(MedicationFrequency).map((freq) => (
                    <MenuItem key={freq} value={freq}>
                      {freq.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="medication-timing-label">Timing</InputLabel>
                <Select
                  labelId="medication-timing-label"
                  multiple
                  value={medicationForm.timingSchedule}
                  label="Timing"
                  onChange={(e) => setMedicationForm({ 
                    ...medicationForm, 
                    timingSchedule: e.target.value as MedicationTiming[] 
                  })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as MedicationTiming[]).map((value) => (
                        <Chip key={value} label={value.replace(/_/g, ' ')} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(MedicationTiming).map((time) => (
                    <MenuItem key={time} value={time}>
                      {time.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Administration Method"
                fullWidth
                size="small"
                placeholder="e.g., Oral, Topical, Injection"
                value={medicationForm.administrationMethod}
                onChange={(e) => setMedicationForm({ 
                  ...medicationForm, 
                  administrationMethod: e.target.value 
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Special Instructions"
                fullWidth
                multiline
                rows={2}
                size="small"
                placeholder="Any special instructions for administering this medication"
                value={medicationForm.specialInstructions}
                onChange={(e) => setMedicationForm({ 
                  ...medicationForm, 
                  specialInstructions: e.target.value 
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                {editingMedicationId && (
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={() => {
                      setMedicationForm({
                        name: '',
                        dosage: '',
                        frequency: MedicationFrequency.ONCE_DAILY,
                        timingSchedule: [MedicationTiming.MORNING],
                        administrationMethod: '',
                        specialInstructions: '',
                        startDate: null,
                        endDate: null
                      });
                      setEditingMedicationId(null);
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddMedication}
                  disabled={!medicationForm.name || !medicationForm.dosage}
                >
                  {editingMedicationId ? 'Update Medication' : 'Add Medication'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };

  // No pets selected message
  if (selectedPets.length === 0) {
    return (
      <Alert severity="warning">
        Please select at least one pet in the previous step before continuing.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pet Care Requirements
      </Typography>
      
      {/* Pet tabs */}
      {renderPetTabs()}
      
      {activePet && (
        <Paper variant="outlined">
          {/* Care type tabs (feeding vs medications) */}
          {renderCareTabs()}
          
          {/* Tab content */}
          <Box sx={{ p: 0 }}>
            {activeTab === 0 ? renderFeedingPreferences() : renderMedications()}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CareRequirementsStep;
