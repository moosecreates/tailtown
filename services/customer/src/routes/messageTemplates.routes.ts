import express from 'express';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate
} from '../controllers/messageTemplates.controller';

const router = express.Router();

// Get all templates
router.get('/', getAllTemplates);

// Get template by ID
router.get('/:id', getTemplateById);

// Create new template
router.post('/', createTemplate);

// Update template
router.put('/:id', updateTemplate);

// Delete template
router.delete('/:id', deleteTemplate);

// Duplicate template
router.post('/:id/duplicate', duplicateTemplate);

export default router;
