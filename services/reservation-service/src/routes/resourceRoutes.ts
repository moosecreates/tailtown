import express from 'express';
import { checkResourceAvailability, batchCheckResourceAvailability } from '../controllers/resource/availability.controller';

const router = express.Router();

// Resource availability routes
router.get('/availability', checkResourceAvailability);
router.post('/availability/batch', batchCheckResourceAvailability);

export default router;
