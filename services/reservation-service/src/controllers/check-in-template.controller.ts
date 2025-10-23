import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Check-In Template Controller
 * Manages customizable check-in questionnaire templates
 */

/**
 * Get all check-in templates for a tenant
 * GET /api/check-in-templates
 */
export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';
    const { active } = req.query;

    const where: any = { tenantId };
    if (active === 'true') {
      where.isActive = true;
    }

    const templates = await prisma.checkInTemplate.findMany({
      where,
      include: {
        sections: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      status: 'success',
      results: templates.length,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching check-in templates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch check-in templates'
    });
  }
};

/**
 * Get a single check-in template by ID
 * GET /api/check-in-templates/:id
 */
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';

    const template = await prisma.checkInTemplate.findFirst({
      where: { id, tenantId },
      include: {
        sections: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found'
      });
    }

    res.json({
      status: 'success',
      data: template
    });
  } catch (error) {
    console.error('Error fetching check-in template:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch check-in template'
    });
  }
};

/**
 * Get the default template for a tenant
 * GET /api/check-in-templates/default
 */
export const getDefaultTemplate = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';

    const template = await prisma.checkInTemplate.findFirst({
      where: { 
        tenantId,
        isDefault: true,
        isActive: true
      },
      include: {
        sections: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'No default template found'
      });
    }

    res.json({
      status: 'success',
      data: template
    });
  } catch (error) {
    console.error('Error fetching default template:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch default template'
    });
  }
};

/**
 * Create a new check-in template
 * POST /api/check-in-templates
 */
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';
    const { name, description, isDefault, sections } = req.body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.checkInTemplate.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.checkInTemplate.create({
      data: {
        tenantId,
        name,
        description,
        isDefault: isDefault || false,
        isActive: true,
        sections: {
          create: sections?.map((section: any, sectionIndex: number) => ({
            title: section.title,
            description: section.description,
            order: section.order || sectionIndex + 1,
            questions: {
              create: section.questions?.map((question: any, questionIndex: number) => ({
                questionText: question.questionText,
                questionType: question.questionType,
                options: question.options,
                isRequired: question.isRequired || false,
                order: question.order || questionIndex + 1,
                placeholder: question.placeholder,
                helpText: question.helpText
              }))
            }
          }))
        }
      },
      include: {
        sections: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: template
    });
  } catch (error) {
    console.error('Error creating check-in template:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create check-in template'
    });
  }
};

/**
 * Update a check-in template
 * PUT /api/check-in-templates/:id
 */
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';
    const { name, description, isActive, isDefault } = req.body;

    // Verify template exists and belongs to tenant
    const existing = await prisma.checkInTemplate.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found'
      });
    }

    // If setting as default, unset other defaults
    if (isDefault && !existing.isDefault) {
      await prisma.checkInTemplate.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.checkInTemplate.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
        isDefault
      },
      include: {
        sections: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json({
      status: 'success',
      data: template
    });
  } catch (error) {
    console.error('Error updating check-in template:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update check-in template'
    });
  }
};

/**
 * Delete a check-in template
 * DELETE /api/check-in-templates/:id
 */
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';

    // Verify template exists and belongs to tenant
    const existing = await prisma.checkInTemplate.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found'
      });
    }

    // Check if template is in use
    const checkInsUsingTemplate = await prisma.checkIn.count({
      where: { templateId: id }
    });

    if (checkInsUsingTemplate > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete template. It is being used by ${checkInsUsingTemplate} check-in(s). Consider deactivating instead.`
      });
    }

    await prisma.checkInTemplate.delete({
      where: { id }
    });

    res.json({
      status: 'success',
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting check-in template:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete check-in template'
    });
  }
};

/**
 * Clone a check-in template
 * POST /api/check-in-templates/:id/clone
 */
export const cloneTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';
    const { name } = req.body;

    // Get the template to clone
    const sourceTemplate = await prisma.checkInTemplate.findFirst({
      where: { id, tenantId },
      include: {
        sections: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!sourceTemplate) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found'
      });
    }

    // Create the clone
    const clonedTemplate = await prisma.checkInTemplate.create({
      data: {
        tenantId,
        name: name || `${sourceTemplate.name} (Copy)`,
        description: sourceTemplate.description,
        isActive: true,
        isDefault: false,
        sections: {
          create: sourceTemplate.sections.map(section => ({
            title: section.title,
            description: section.description,
            order: section.order,
            questions: {
              create: section.questions.map(question => ({
                questionText: question.questionText,
                questionType: question.questionType,
                options: question.options,
                isRequired: question.isRequired,
                order: question.order,
                placeholder: question.placeholder,
                helpText: question.helpText
              }))
            }
          }))
        }
      },
      include: {
        sections: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: clonedTemplate
    });
  } catch (error) {
    console.error('Error cloning check-in template:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clone check-in template'
    });
  }
};
