import { Router } from 'express';
import { getResourceAvailability, checkResourceAvailability } from '../controllers/resourceAvailability.controller';

const router = Router();

// Resource availability routes
router.get('/', getResourceAvailability);
router.get('/:resourceId', checkResourceAvailability);

export { router as resourceAvailabilityRoutes };
