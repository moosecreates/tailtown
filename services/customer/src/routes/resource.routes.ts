import express from 'express';
import * as resourceController from '../controllers/resource.controller';

export const resourceRoutes = express.Router();

// Resource routes
resourceRoutes.get('/', resourceController.getAllResources);
// Specific routes must come before parameter routes
resourceRoutes.get('/available', resourceController.getAvailableResourcesByDate);
resourceRoutes.get('/:id', resourceController.getResource);
resourceRoutes.post('/', resourceController.createResource);
resourceRoutes.put('/:id', resourceController.updateResource);
resourceRoutes.delete('/:id', resourceController.deleteResource);

// Resource availability routes
resourceRoutes.post('/:resourceId/availability', resourceController.createAvailabilitySlot);
resourceRoutes.put('/availability/:id', resourceController.updateAvailabilitySlot);
resourceRoutes.delete('/availability/:id', resourceController.deleteAvailabilitySlot);
