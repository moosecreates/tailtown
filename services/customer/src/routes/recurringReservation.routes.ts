import { Router } from 'express';
import { recurringReservationController } from '../controllers/recurringReservation.controller';

const router = Router();

/**
 * Recurring Reservation Pattern Routes
 */
// Get recurring pattern for a reservation
router.get('/pattern/reservation/:reservationId', recurringReservationController.getRecurringPattern);

// Create recurring pattern
router.post('/pattern', recurringReservationController.createRecurringPattern);

// Update recurring pattern
router.put('/pattern/reservation/:reservationId', recurringReservationController.updateRecurringPattern);

// Delete recurring pattern
router.delete('/pattern/reservation/:reservationId', recurringReservationController.deleteRecurringPattern);

// Generate instances based on recurring pattern
router.post('/pattern/reservation/:reservationId/generate', recurringReservationController.generateRecurringInstances);

export default router;
