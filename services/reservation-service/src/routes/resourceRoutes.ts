/**
 * Resource Routes
 * 
 * This file defines the API routes for resource-related operations.
 * It implements our schema alignment strategy with defensive programming
 * and graceful error handling for potential schema mismatches.
 */

import express from 'express';
import { checkResourceAvailability, batchCheckResourceAvailability } from '../controllers/resource/availability.controller';
import {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getResourceAvailability
} from '../controllers/resource/resource.controller';

const router = express.Router();

// Health check endpoint for resource routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Resource routes healthy' });
});

// Resource CRUD routes
router.get('/', getAllResources);
router.get('/:id', getResourceById);
router.post('/', createResource);
router.patch('/:id', updateResource);
router.delete('/:id', deleteResource);

// Resource availability routes
router.get('/availability', checkResourceAvailability);
router.post('/availability/batch', batchCheckResourceAvailability);
router.get('/:id/availability', getResourceAvailability);

export default router;
