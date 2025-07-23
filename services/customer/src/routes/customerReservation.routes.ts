import { Router } from 'express';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation
} from '../controllers/customerReservation.controller';

const router = Router();

// Customer Reservation Routes
router.get('/', getAllReservations);
router.get('/:id', getReservationById);
router.post('/', createReservation);
router.put('/:id', updateReservation);
router.delete('/:id', deleteReservation);

export { router as customerReservationRoutes };
