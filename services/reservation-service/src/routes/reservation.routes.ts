import { Router } from 'express';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  getReservationsByDateRange,
  getReservationsByStatus,
  getTodayRevenue,
  addAddOnsToReservation,
  getReservationsByCustomer,
  getReservationsByPet
} from '../controllers/reservation.controller';

const router = Router();

// Base routes with /:id parameter need to come after specific routes
// to avoid route conflicts

// Specialized routes
router.get('/date-range', getReservationsByDateRange);
router.get('/status/:status', getReservationsByStatus);
router.get('/revenue/today', getTodayRevenue);
router.get('/customer/:customerId', getReservationsByCustomer);
router.get('/pet/:petId', getReservationsByPet);

// Core reservation routes
router.get('/', getAllReservations);
router.get('/:id', getReservationById);
router.post('/', createReservation);
router.put('/:id', updateReservation);
router.delete('/:id', deleteReservation);

// Add-on management
router.post('/:id/add-ons', addAddOnsToReservation);

export default router;
