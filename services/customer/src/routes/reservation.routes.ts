import { Router } from 'express';
import { 
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  getReservationsByCustomer,
  getReservationsByPet,
  getReservationsByDateRange,
  getReservationsByStatus
} from '../controllers/reservation.controller';

const router = Router();

// GET all reservations
router.get('/', getAllReservations);

// GET reservations by status
router.get('/status/:status', getReservationsByStatus);

// GET reservations by date range
router.get('/dates', getReservationsByDateRange);

// GET reservations by customer
router.get('/customer/:customerId', getReservationsByCustomer);

// GET reservations by pet
router.get('/pet/:petId', getReservationsByPet);

// GET a single reservation by ID
router.get('/:id', getReservationById);

// POST create a new reservation
router.post('/', createReservation);

// PUT update a reservation
router.put('/:id', updateReservation);

// DELETE a reservation
router.delete('/:id', deleteReservation);

export { router as reservationRoutes };
