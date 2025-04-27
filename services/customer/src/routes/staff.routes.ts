import { Router } from 'express';
import { 
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  loginStaff,
  requestPasswordReset,
  resetPassword
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

export { router as staffRoutes };
