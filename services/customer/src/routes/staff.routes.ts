import { Router } from 'express';
import { 
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  loginStaff,
  requestPasswordReset,
  resetPassword,
  // Staff availability endpoints
  getStaffAvailability,
  createStaffAvailability,
  updateStaffAvailability,
  deleteStaffAvailability,
  // Staff time off endpoints
  getStaffTimeOff,
  createStaffTimeOff,
  updateStaffTimeOff,
  deleteStaffTimeOff,
  // Staff scheduling
  getAvailableStaff
} from '../controllers/staff.controller';

const router = Router();

// GET all staff members
router.get('/', getAllStaff);

// GET a single staff member by ID
router.get('/:id', getStaffById);

// POST create a new staff member
router.post('/', createStaff);

// PUT update a staff member
router.put('/:id', updateStaff);

// DELETE a staff member
router.delete('/:id', deleteStaff);

// POST login
router.post('/login', loginStaff);

// POST request password reset
router.post('/request-reset', requestPasswordReset);

// POST reset password
router.post('/reset-password', resetPassword);

// Staff Availability Routes
router.get('/:staffId/availability', getStaffAvailability);
router.post('/:staffId/availability', createStaffAvailability);
router.put('/availability/:id', updateStaffAvailability);
router.delete('/availability/:id', deleteStaffAvailability);

// Staff Time Off Routes
router.get('/:staffId/time-off', getStaffTimeOff);
router.post('/:staffId/time-off', createStaffTimeOff);
router.put('/time-off/:id', updateStaffTimeOff);
router.delete('/time-off/:id', deleteStaffTimeOff);

// Staff Scheduling Routes
router.get('/available', getAvailableStaff);

export { router as staffRoutes };
