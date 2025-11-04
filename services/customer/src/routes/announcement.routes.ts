import { Router } from 'express';
import * as announcementController from '../controllers/announcement.controller';

const router = Router();

// Get active announcements for current user (excludes dismissed)
router.get('/announcements', announcementController.getActiveAnnouncements);

// Get all announcements (admin view)
router.get('/announcements/all', announcementController.getAllAnnouncements);

// Create new announcement
router.post('/announcements', announcementController.createAnnouncement);

// Update announcement
router.put('/announcements/:id', announcementController.updateAnnouncement);

// Delete announcement
router.delete('/announcements/:id', announcementController.deleteAnnouncement);

// Dismiss announcement for current user
router.post('/announcements/:id/dismiss', announcementController.dismissAnnouncement);

export default router;
