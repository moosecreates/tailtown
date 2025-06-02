/**
 * Reservation Routes
 * 
 * This file defines the API routes for reservation-related operations.
 * It's referenced by the main application index.ts file.
 * 
 * Implements the schema alignment strategy with defensive programming and
 * graceful error handling for potential schema mismatches between environments.
 */

import { Router } from 'express';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  getCustomerReservations
} from '../controllers/reservation/reservation.controller';

const router = Router();

// Health check endpoint for reservation routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Reservation routes healthy' });
});

// Core reservation endpoints
router.get('/', getAllReservations);
router.get('/:id', getReservationById);
router.post('/', createReservation);
router.patch('/:id', updateReservation);
router.delete('/:id', deleteReservation);

// Customer-specific reservation endpoints
router.get('/customer/:customerId', getCustomerReservations);

export default router;
