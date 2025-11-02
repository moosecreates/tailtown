/**
 * Super Admin Routes
 * 
 * Routes for super admin authentication and management.
 * All routes except login require authentication.
 */

import express from 'express';
import {
  login,
  logout,
  getCurrentUser,
  refreshToken
} from '../controllers/super-admin/auth.controller';
import { requireSuperAdmin } from '../middleware/require-super-admin.middleware';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes (require authentication)
router.post('/logout', requireSuperAdmin, logout);
router.get('/me', requireSuperAdmin, getCurrentUser);

export default router;
