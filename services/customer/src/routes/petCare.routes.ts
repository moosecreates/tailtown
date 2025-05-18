import { Router } from 'express';
import { petFeedingController, petMedicationController } from '../controllers/petCare.controller';

const router = Router();

/**
 * Pet Feeding Preferences Routes
 */
// Get all feeding preferences for a pet
router.get('/feeding/pet/:petId', petFeedingController.getFeedingPreferences);

// Get feeding preference by ID
router.get('/feeding/:id', petFeedingController.getFeedingPreferenceById);

// Create new feeding preference
router.post('/feeding', petFeedingController.createFeedingPreference);

// Update feeding preference
router.put('/feeding/:id', petFeedingController.updateFeedingPreference);

// Delete feeding preference
router.delete('/feeding/:id', petFeedingController.deleteFeedingPreference);

/**
 * Pet Medication Routes
 */
// Get all medications for a pet
router.get('/medication/pet/:petId', petMedicationController.getMedications);

// Get active medications for a pet on a specific date
router.get('/medication/pet/:petId/active', petMedicationController.getActiveMedicationsForDate);

// Get medication by ID
router.get('/medication/:id', petMedicationController.getMedicationById);

// Create new medication
router.post('/medication', petMedicationController.createMedication);

// Update medication
router.put('/medication/:id', petMedicationController.updateMedication);

// Delete medication
router.delete('/medication/:id', petMedicationController.deleteMedication);

export default router;
