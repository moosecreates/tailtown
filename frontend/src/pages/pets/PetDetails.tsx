import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Box,
  Paper,
  Button,
  Avatar,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import VaccinationStatus from '../../components/VaccinationStatus';
import PetIconSelector from '../../components/pets/PetIconSelector';
import PetIconDisplay from '../../components/pets/PetIconDisplay';
import { SelectChangeEvent } from '@mui/material/Select';
import { Pet, petService } from '../../services/petService';
import { customerService } from '../../services/customerService';


/**
 * PetDetails component handles the creation and editing of pet profiles.
 * It manages pet data, photo uploads, and customer associations.
 */
const PetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewPet = id === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoTimestamp, setPhotoTimestamp] = useState<number>(Date.now());

  const [pet, setPet] = useState<Omit<Pet, 'id' | 'createdAt' | 'updatedAt' | 'medicalRecords'>>({
    name: '',
    type: 'DOG',
    breed: null,
    color: null,
    birthdate: null,
    weight: null,
    gender: null,
    isNeutered: false,
    microchipNumber: null,
    rabiesTagNumber: null,
    profilePhoto: null,
    specialNeeds: null,
    behaviorNotes: null,
    foodNotes: null,
    medicationNotes: null,
    allergies: null,
    vetName: null,
    vetPhone: null,
    customerId: '',
    isActive: true,
    petIcons: [],
    iconNotes: {},
    vaccinationStatus: undefined,
    vaccineExpirations: undefined
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load customers for the dropdown
        const customersData = await customerService.getAllCustomers();
        setCustomers(customersData.data || []);

        if (!isNewPet) {
          const petData = await petService.getPetById(id!);

          // Format the birthdate from ISO to YYYY-MM-DD for the input field
          if (petData.birthdate) {
            petData.birthdate = new Date(petData.birthdate).toISOString().split('T')[0];
          }
          
          // Try to load pet icons and icon notes from localStorage
          try {
            const storageKey = `pet_icons_${id}`;
            const storedIconsData = localStorage.getItem(storageKey);
            
            if (storedIconsData) {
              const parsedData = JSON.parse(storedIconsData);
              petData.petIcons = parsedData.petIcons || [];
              petData.iconNotes = parsedData.iconNotes || {};
            }
          } catch (err) {
            console.warn('Failed to load pet icons from localStorage:', err);
          }
          
          setPet(petData);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Ensure proper scrolling behavior
    const enableScrolling = () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };

    // Enable scrolling when component mounts
    enableScrolling();

    // Re-enable scrolling when component updates
    return () => {
      enableScrolling();
    };
  }, [id, isNewPet]);

  /**
 * Handles changes to text input fields, with special handling for dates and weights.
 * @param e - The change event from the input field
 */
const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name) {
      if (name === 'birthdate') {
      }
      setPet(prev => {
        const newValue = name === 'weight' ? (value ? parseFloat(value) : null) :
                        name === 'birthdate' ? (value ? value : null) :
                        value;
        if (name === 'birthdate') {

        }
        return {
          ...prev,
          [name]: newValue
        };
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setPet(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPet(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = async () => {

    try {
      setSaving(true);
      
      if (!pet.name || !pet.customerId) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error'
        });
        return;
      }

      // Clean up the data before sending
      const formattedDate = pet.birthdate ? new Date(pet.birthdate).toISOString().split('T')[0] : null;
      
      const cleanPetData = {
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        color: pet.color,
        birthdate: formattedDate,
        weight: pet.weight,
        gender: pet.gender,
        isNeutered: pet.isNeutered,
        microchipNumber: pet.microchipNumber,
        specialNeeds: pet.specialNeeds,
        behaviorNotes: pet.behaviorNotes,
        foodNotes: pet.foodNotes,
        medicationNotes: pet.medicationNotes,
        allergies: pet.allergies,
        vetName: pet.vetName,
        vetPhone: pet.vetPhone,
        // Don't send pet icons and icon notes to the backend as they're not in the database schema
        // Store them in localStorage instead
        // petIcons: pet.petIcons || [],
        // iconNotes: pet.iconNotes || {},
        vaccinationStatus: pet.vaccinationStatus || {},
        vaccineExpirations: pet.vaccineExpirations || {},
        customerId: pet.customerId,
        isActive: pet.isActive
      };

      // Store pet icons and icon notes in localStorage
      if (pet.petIcons?.length || Object.keys(pet.iconNotes || {}).length) {
        try {
          // Use a namespaced key to avoid conflicts
          const storageKey = `pet_icons_${isNewPet ? 'new' : id}`;
          localStorage.setItem(storageKey, JSON.stringify({
            petIcons: pet.petIcons || [],
            iconNotes: pet.iconNotes || {}
          }));
        } catch (err) {
          console.warn('Failed to store pet icons in localStorage:', err);
        }
      }

      if (isNewPet) {
        await petService.createPet(cleanPetData as Omit<Pet, 'id'>);
      } else {
        await petService.updatePet(id!, cleanPetData);
      }

      setSnackbar({
        open: true,
        message: `Pet ${isNewPet ? 'created' : 'updated'} successfully`,
        severity: 'success'
      });

      // Navigate back to pets list after successful save
      navigate('/pets');
    } catch (err) {
      console.error('Error saving pet:', err);
      setSnackbar({
        open: true,
        message: `Error ${isNewPet ? 'creating' : 'updating'} pet`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isNewPet ? 'New Pet' : pet.name}
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>


          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar
              src={pet.profilePhoto ? 
                // Use a simple direct path to the image
                `http://localhost:3003${pet.profilePhoto}?t=${photoTimestamp}` : 
                undefined
              }
              alt={pet.name || 'Pet'}
              onError={(e) => {
                console.error('Error loading image:', e);
                // Reset image source on error and try a direct path without query parameters
                const imgElement = e.target as HTMLImageElement;
                const originalSrc = imgElement.src;
                
                // Only try the fallback once to avoid infinite loops
                if (originalSrc.includes('?')) {
                  const baseUrl = originalSrc.split('?')[0];
                  imgElement.src = baseUrl;
                } else {
                  // If fallback failed too, clear the src
                  imgElement.src = '';
                }
              }}
              sx={{
                width: 150,
                height: 150,
                border: '2px solid #e0e0e0',
                '& img': {
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }
              }}
            />
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && !isNewPet && id) {
                    // Check file size (5MB limit)
                    if (file.size > 5 * 1024 * 1024) {
                      setSnackbar({
                        open: true,
                        message: 'File size too large. Please upload an image under 5MB.',
                        severity: 'error'
                      });
                      return;
                    }

                    try {
                      setSaving(true);
                      const updatedPet = await petService.uploadPetPhoto(id, file);
                      
                      // Create a local cached URL to display immediately
                      if (updatedPet.profilePhoto) {
                        // Use a simple direct path to the image
                        const imageUrl = `http://localhost:3003${updatedPet.profilePhoto}`;
                        
                        // Preload the image to ensure it's in browser cache
                        const preloadImg = new Image();
                        preloadImg.src = imageUrl;
                        
                        setPet(prev => ({ ...prev, profilePhoto: updatedPet.profilePhoto }));
                      }
                      
                      // Update timestamp to force image refresh
                      setPhotoTimestamp(Date.now());
                      setSnackbar({
                        open: true,
                        message: 'Photo uploaded successfully',
                        severity: 'success'
                      });
                    } catch (error) {
                      console.error('Error uploading photo:', error);
                      setSnackbar({
                        open: true,
                        message: 'Error uploading photo',
                        severity: 'error'
                      });
                    } finally {
                      setSaving(false);
                    }
                  }
                }}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={saving || isNewPet}
                >
                  {pet.profilePhoto ? 'Change Photo' : 'Add Photo'}
                </Button>
              </label>
              {isNewPet && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  You can add a photo after creating the pet
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <FormControl fullWidth required>
              <TextField
                label="Name"
                name="name"
                value={pet.name || ''}
                onChange={handleTextChange}
                required
              />
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={pet.type || 'DOG'}
                label="Type"
                onChange={handleSelectChange}
              >
                <MenuItem value="DOG">Dog</MenuItem>
                <MenuItem value="CAT">Cat</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Breed"
                name="breed"
                value={pet.breed || ''}
                onChange={handleTextChange}
              />
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Color"
                name="color"
                value={pet.color || ''}
                onChange={handleTextChange}
              />
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Weight (lbs)"
                name="weight"
                type="number"
                value={pet.weight || ''}
                onChange={handleTextChange}
              />
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Birthdate"
                name="birthdate"
                type="date"
                value={pet.birthdate || ''}
                onChange={handleTextChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={pet.gender || ''}
                label="Gender"
                onChange={handleSelectChange}
              >
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <TextField
                  label="Microchip Number"
                  name="microchipNumber"
                  value={pet.microchipNumber || ''}
                  onChange={handleTextChange}
                />
              </FormControl>

              <FormControl fullWidth>
                <TextField
                  label="Rabies Tag Number"
                  name="rabiesTagNumber"
                  value={pet.rabiesTagNumber || ''}
                  onChange={handleTextChange}
                />
              </FormControl>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={pet.isNeutered || false}
                  onChange={handleCheckboxChange}
                  name="isNeutered"
                />
              }
              label="Neutered/Spayed"
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Owner Information</Typography>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Owner</InputLabel>
              <Select
                name="customerId"
                value={pet.customerId || ''}
                label="Owner"
                onChange={handleSelectChange}
              >
                {customers.map(customer => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {`${customer.firstName} ${customer.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Additional Information</Typography>

          {/* Pet Icons Selector */}
          <PetIconSelector
            selectedIcons={pet.petIcons || []}
            onChange={(selectedIcons) => {
              setPet(prev => ({
                ...prev,
                petIcons: selectedIcons
              }));
            }}
          />

          {/* Display selected icons if any */}
          {pet.petIcons && pet.petIcons.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Selected Pet Icons:</Typography>
              <PetIconDisplay 
                iconIds={pet.petIcons} 
                size="large" 
                showLabels={true} 
                customNotes={pet.iconNotes} 
              />
            </Box>
          )}

          <Box sx={{ display: 'grid', gap: 2 }}>
            {/* Medical Information */}
            <Typography variant="h6" gutterBottom>Medical Information</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <FormControl fullWidth>
                <TextField
                  label="Veterinarian Name"
                  name="vetName"
                  value={pet.vetName || ''}
                  onChange={handleTextChange}
                />
              </FormControl>

              <FormControl fullWidth>
                <TextField
                  label="Veterinarian Phone"
                  name="vetPhone"
                  value={pet.vetPhone || ''}
                  onChange={handleTextChange}
                />
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gap: 2 }}>
              <FormControl fullWidth>
                <TextField
                  label="Allergies"
                  name="allergies"
                  value={pet.allergies || ''}
                  onChange={handleTextChange}
                  multiline
                  rows={2}
                />
              </FormControl>

              <FormControl fullWidth>
                <TextField
                  label="Medication Notes"
                  name="medicationNotes"
                  value={pet.medicationNotes || ''}
                  onChange={handleTextChange}
                  multiline
                  rows={2}
                />
              </FormControl>

              <FormControl fullWidth>
                <TextField
                  label="Food Notes"
                  name="foodNotes"
                  value={pet.foodNotes || ''}
                  onChange={handleTextChange}
                  multiline
                  rows={2}
                />
              </FormControl>

              <FormControl fullWidth>
                <TextField
                  label="Special Needs"
                  name="specialNeeds"
                  value={pet.specialNeeds || ''}
                  onChange={handleTextChange}
                  multiline
                  rows={2}
                />
              </FormControl>

              <FormControl fullWidth>
                <TextField
                  label="Behavior Notes"
                  name="behaviorNotes"
                  value={pet.behaviorNotes || ''}
                  onChange={handleTextChange}
                  multiline
                  rows={2}
                />
              </FormControl>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Vaccination Status */}
          <VaccinationStatus
            vaccinationStatus={pet.vaccinationStatus}
            vaccineExpirations={pet.vaccineExpirations}
            onVaccinationStatusChange={(key, value) => {
              setPet(prev => {
                const newPet = {
                  ...prev,
                  vaccinationStatus: {
                    ...(prev.vaccinationStatus || {}),
                    [key]: value
                  }
                };
                console.log('Updated pet state:', newPet);
                return newPet;
              });
            }}
            onVaccineExpirationChange={(key, value) => {
              setPet(prev => {
                const newPet = {
                  ...prev,
                  vaccineExpirations: {
                    ...(prev.vaccineExpirations || {}),
                    [key]: value
                  }
                };
                console.log('Updated pet state:', newPet);
                return newPet;
              });
            }}
          />
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : (isNewPet ? 'Create Pet' : 'Save Changes')}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/pets')}
            disabled={saving}
          >
            Cancel
          </Button>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default PetDetails;
