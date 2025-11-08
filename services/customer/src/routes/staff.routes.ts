import { Router } from 'express';
import { 
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  loginStaff,
  refreshAccessToken,
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
  getAvailableStaff,
  // Staff schedule endpoints
  getStaffSchedules,
  getAllSchedules,
  createStaffSchedule,
  updateStaffSchedule,
  deleteStaffSchedule,
  bulkCreateSchedules,
  // Test endpoint
  testSchedulesEndpoint,
  // Profile photo endpoints
  uploadProfilePhoto,
  deleteProfilePhoto
} from '../controllers/staff.controller';
import { loginRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimiter.middleware';
import { uploadProfilePhoto as uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// IMPORTANT: Specific routes must come BEFORE generic :id routes!

// Authentication routes (no :id parameter)
// POST login (with rate limiting to prevent brute force attacks)
router.post('/login', loginRateLimiter, loginStaff);

// POST refresh token (no rate limiting needed as tokens are already time-limited)
router.post('/refresh', refreshAccessToken);

// POST request password reset (with rate limiting)
router.post('/request-reset', passwordResetRateLimiter, requestPasswordReset);

// POST reset password
router.post('/reset-password', resetPassword);

// Profile photo routes (must be before /:id routes!)
// Add error handling for multer errors
router.post('/:id/photo', (req, res, next) => {
  uploadMiddleware(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          status: 'error',
          message: 'File too large. Maximum size is 10MB. Please compress your image and try again.',
        });
      }
      if (err.message) {
        return res.status(400).json({
          status: 'error',
          message: err.message,
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Error uploading file',
      });
    }
    next();
  });
}, uploadProfilePhoto);
router.delete('/:id/photo', deleteProfilePhoto);

// GET all staff members
router.get('/', getAllStaff);

// POST create a new staff member
router.post('/', createStaff);

// Generic :id routes (must be AFTER specific routes)
// GET a single staff member by ID
router.get('/:id', getStaffById);

// PUT update a staff member
router.put('/:id', updateStaff);

// DELETE a staff member
router.delete('/:id', deleteStaff);

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

// Test endpoint for debugging
router.get('/test-schedules', testSchedulesEndpoint);

// Staff Schedule Routes
// Important: Order matters! More specific routes (with fixed paths) must come before
// routes with path parameters (like :staffId) to ensure correct matching
router.get('/schedules', getAllSchedules);
router.post('/schedules/bulk', bulkCreateSchedules);
router.put('/schedules/:scheduleId', updateStaffSchedule);
router.delete('/schedules/:scheduleId', deleteStaffSchedule);

// Staff member specific schedule routes
router.get('/:staffId/schedules', getStaffSchedules);
router.post('/:staffId/schedules', createStaffSchedule);

export { router as staffRoutes };
