import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all message templates
 */
export const getAllTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = (req as any).tenantId;
    const { type, category, isActive } = req.query;

    const where: any = { tenantId };
    
    if (type) where.type = type as string;
    if (category) where.category = category as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const templates = await prisma.messageTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      results: templates.length,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching message templates:', error);
    next(error);
  }
};

/**
 * Get template by ID
 */
export const getTemplateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;

    const template = await prisma.messageTemplate.findFirst({
      where: { id, tenantId }
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
    console.error('Error fetching template:', error);
    next(error);
  }
};

/**
 * Create new template
 */
export const createTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = (req as any).tenantId;
    const { name, type, category, subject, body, variables } = req.body;

    // Validate required fields
    if (!name || !type || !category || !body) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, type, category, body'
      });
    }

    // Validate type
    if (!['SMS', 'EMAIL'].includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Type must be SMS or EMAIL'
      });
    }

    // Validate category
    const validCategories = ['APPOINTMENT_REMINDER', 'MARKETING', 'CONFIRMATION', 'FOLLOW_UP', 'PROMOTIONAL'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        status: 'error',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    // Extract variables from body and subject
    const variableRegex = /\{\{(\w+)\}\}/g;
    const bodyMatches = Array.from(body.matchAll(variableRegex));
    const extractedVars = bodyMatches.map((match: RegExpMatchArray) => match[1]);
    
    if (subject) {
      const subjectMatches = Array.from(subject.matchAll(variableRegex));
      const subjectVars = subjectMatches.map((match: RegExpMatchArray) => match[1]);
      extractedVars.push(...subjectVars);
    }
    
    const uniqueVariables = Array.from(new Set(extractedVars));

    const template = await prisma.messageTemplate.create({
      data: {
        tenantId,
        name,
        type,
        category,
        subject: type === 'EMAIL' ? subject : null,
        body,
        variables: variables || uniqueVariables,
        isActive: true
      }
    });

    res.status(201).json({
      status: 'success',
      data: template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    next(error);
  }
};

/**
 * Update template
 */
export const updateTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;
    const { name, type, category, subject, body, variables, isActive } = req.body;

    // Check if template exists
    const existing = await prisma.messageTemplate.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found'
      });
    }

    // Extract variables if body is being updated
    let updatedVariables = variables;
    if (body) {
      const variableRegex = /\{\{(\w+)\}\}/g;
      const bodyMatches = Array.from(body.matchAll(variableRegex));
      const extractedVars = bodyMatches.map((match: RegExpMatchArray) => match[1]);
      
      if (subject) {
        const subjectMatches = Array.from(subject.matchAll(variableRegex));
        const subjectVars = subjectMatches.map((match: RegExpMatchArray) => match[1]);
        extractedVars.push(...subjectVars);
      }
      
      updatedVariables = Array.from(new Set(extractedVars));
    }

    const template = await prisma.messageTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(category && { category }),
        ...(subject !== undefined && { subject }),
        ...(body && { body }),
        ...(updatedVariables && { variables: updatedVariables }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      status: 'success',
      data: template
    });
  } catch (error) {
    console.error('Error updating template:', error);
    next(error);
  }
};

/**
 * Delete template
 */
export const deleteTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;

    // Check if template exists
    const existing = await prisma.messageTemplate.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found'
      });
    }

    await prisma.messageTemplate.delete({
      where: { id }
    });

    res.json({
      status: 'success',
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    next(error);
  }
};

/**
 * Duplicate template
 */
export const duplicateTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;

    // Get original template
    const original = await prisma.messageTemplate.findFirst({
      where: { id, tenantId }
    });

    if (!original) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found'
      });
    }

    // Create duplicate
    const duplicate = await prisma.messageTemplate.create({
      data: {
        tenantId,
        name: `${original.name} (Copy)`,
        type: original.type,
        category: original.category,
        subject: original.subject,
        body: original.body,
        variables: original.variables,
        isActive: true
      }
    });

    res.status(201).json({
      status: 'success',
      data: duplicate
    });
  } catch (error) {
    console.error('Error duplicating template:', error);
    next(error);
  }
};
