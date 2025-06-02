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
// Import controller functions with explicit path
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

// IMPORTANT: Specific routes must come before parameterized routes

// Customer-specific reservation endpoints
router.get('/customer/:customerId', getCustomerReservations);

// Core reservation endpoints
router.get('/', getAllReservations);
router.post('/', createReservation);

// Parameterized routes must come last
router.get('/:id', getReservationById);
router.patch('/:id', updateReservation);
router.delete('/:id', deleteReservation);

export default router;
