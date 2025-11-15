/**
 * Report Card Controller
 * 
 * Handles pet report card operations:
 * - Creating and managing report cards
 * - Photo uploads and management
 * - Bulk report card generation
 * - Sending reports via email/SMS
 * - Customer viewing and tracking
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'MANAGER' | 'STAFF';
    tenantId?: string;
  };
  tenantId?: string;
}

/**
 * Create a new report card
 * POST /api/report-cards
 */
export const createReportCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const staffId = req.user?.id;

    if (!tenantId || !staffId) {
      return next(new AppError('Tenant ID and Staff ID are required', 400));
    }

    const {
      petId,
      customerId,
      reservationId,
      serviceType,
      templateType,
      title,
      summary,
      moodRating,
      energyRating,
      appetiteRating,
      socialRating,
      activities,
      mealsEaten,
      bathroomBreaks,
      medicationGiven,
      medicationNotes,
      behaviorNotes,
      highlights,
      concerns,
      tags,
      notes
    } = req.body;

    // Validate required fields
    if (!petId || !customerId || !serviceType) {
      return next(new AppError('Pet ID, Customer ID, and Service Type are required', 400));
    }

    // Verify pet belongs to customer
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        customerId: customerId,
        tenantId: tenantId
      }
    });

    if (!pet) {
      return next(new AppError('Pet not found or does not belong to customer', 404));
    }

    // Create report card
    const reportCard = await prisma.reportCard.create({
      data: {
        tenantId,
        petId,
        customerId,
        reservationId,
        createdByStaffId: staffId,
        serviceType,
        templateType,
        title,
        summary,
        moodRating,
        energyRating,
        appetiteRating,
        socialRating,
        activities: activities || [],
        mealsEaten: mealsEaten || [],
        bathroomBreaks,
        medicationGiven: medicationGiven || false,
        medicationNotes,
        behaviorNotes,
        highlights: highlights || [],
        concerns: concerns || [],
        tags: tags || [],
        notes
      },
      include: {
        pet: true,
        customer: true,
        createdByStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        photos: true
      }
    });

    res.status(201).json({
      success: true,
      data: reportCard
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to create report card', 500));
  }
};

/**
 * Get all report cards (staff view with filters)
 * GET /api/report-cards
 */
export const listReportCards = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return next(new AppError('Tenant ID is required', 400));
    }

    const {
      petId,
      customerId,
      reservationId,
      serviceType,
      status,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = req.query;

    const where: any = { tenantId };

    if (petId) where.petId = petId;
    if (customerId) where.customerId = customerId;
    if (reservationId) where.reservationId = reservationId;
    if (serviceType) where.serviceType = serviceType;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.reportDate = {};
      if (startDate) where.reportDate.gte = new Date(startDate as string);
      if (endDate) where.reportDate.lte = new Date(endDate as string);
    }

    const [reportCards, total] = await Promise.all([
      prisma.reportCard.findMany({
        where,
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true
            }
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          createdByStaff: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          photos: {
            orderBy: { order: 'asc' },
            take: 3
          }
        },
        orderBy: { reportDate: 'desc' },
        take: Number(limit),
        skip: Number(offset)
      }),
      prisma.reportCard.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        reportCards,
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to fetch report cards', 500));
  }
};

/**
 * Get single report card by ID
 * GET /api/report-cards/:id
 */
export const getReportCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const reportCard = await prisma.reportCard.findFirst({
      where: {
        id,
        tenantId: tenantId!
      },
      include: {
        pet: true,
        customer: true,
        reservation: true,
        createdByStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        photos: {
          orderBy: { order: 'asc' },
          include: {
            uploadedByStaff: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!reportCard) {
      return next(new AppError('Report card not found', 404));
    }

    // Track view
    await prisma.reportCard.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
        viewedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: reportCard
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to fetch report card', 500));
  }
};

/**
 * Update report card
 * PATCH /api/report-cards/:id
 */
export const updateReportCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const reportCard = await prisma.reportCard.findFirst({
      where: {
        id,
        tenantId: tenantId!
      }
    });

    if (!reportCard) {
      return next(new AppError('Report card not found', 404));
    }

    const updateData: any = {};
    const allowedFields = [
      'title', 'summary', 'moodRating', 'energyRating', 'appetiteRating', 'socialRating',
      'activities', 'mealsEaten', 'bathroomBreaks', 'medicationGiven', 'medicationNotes',
      'behaviorNotes', 'highlights', 'concerns', 'status', 'tags', 'notes'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updated = await prisma.reportCard.update({
      where: { id },
      data: updateData,
      include: {
        pet: true,
        customer: true,
        createdByStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        photos: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to update report card', 500));
  }
};

/**
 * Delete report card
 * DELETE /api/report-cards/:id
 */
export const deleteReportCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const reportCard = await prisma.reportCard.findFirst({
      where: {
        id,
        tenantId: tenantId!
      }
    });

    if (!reportCard) {
      return next(new AppError('Report card not found', 404));
    }

    // Photos will be deleted automatically via CASCADE
    await prisma.reportCard.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Report card deleted successfully'
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to delete report card', 500));
  }
};

/**
 * Upload photo to report card
 * POST /api/report-cards/:id/photos
 */
export const uploadPhoto = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const staffId = req.user?.id;

    const { url, thumbnailUrl, caption, order, fileSize, width, height, mimeType } = req.body;

    if (!url) {
      return next(new AppError('Photo URL is required', 400));
    }

    // Verify report card exists
    const reportCard = await prisma.reportCard.findFirst({
      where: {
        id,
        tenantId: tenantId!
      }
    });

    if (!reportCard) {
      return next(new AppError('Report card not found', 404));
    }

    // Create photo
    const photo = await prisma.reportCardPhoto.create({
      data: {
        reportCardId: id,
        url,
        thumbnailUrl,
        caption,
        order: order || 0,
        uploadedByStaffId: staffId,
        fileSize,
        width,
        height,
        mimeType
      },
      include: {
        uploadedByStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: photo
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to upload photo', 500));
  }
};

/**
 * Delete photo from report card
 * DELETE /api/report-cards/:id/photos/:photoId
 */
export const deletePhoto = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, photoId } = req.params;
    const tenantId = req.tenantId;

    // Verify report card exists and belongs to tenant
    const reportCard = await prisma.reportCard.findFirst({
      where: {
        id,
        tenantId: tenantId!
      }
    });

    if (!reportCard) {
      return next(new AppError('Report card not found', 404));
    }

    // Verify photo exists and belongs to this report card
    const photo = await prisma.reportCardPhoto.findFirst({
      where: {
        id: photoId,
        reportCardId: id
      }
    });

    if (!photo) {
      return next(new AppError('Photo not found', 404));
    }

    await prisma.reportCardPhoto.delete({
      where: { id: photoId }
    });

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to delete photo', 500));
  }
};

/**
 * Update photo (caption, order)
 * PATCH /api/report-cards/:id/photos/:photoId
 */
export const updatePhoto = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, photoId } = req.params;
    const tenantId = req.tenantId;
    const { caption, order } = req.body;

    // Verify report card exists
    const reportCard = await prisma.reportCard.findFirst({
      where: {
        id,
        tenantId: tenantId!
      }
    });

    if (!reportCard) {
      return next(new AppError('Report card not found', 404));
    }

    const photo = await prisma.reportCardPhoto.update({
      where: { id: photoId },
      data: {
        ...(caption !== undefined && { caption }),
        ...(order !== undefined && { order })
      }
    });

    res.json({
      success: true,
      data: photo
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to update photo', 500));
  }
};

/**
 * Send report card via email/SMS
 * POST /api/report-cards/:id/send
 */
export const sendReportCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const { sendEmail = true, sendSMS = true } = req.body;

    const reportCard = await prisma.reportCard.findFirst({
      where: {
        id,
        tenantId: tenantId!
      },
      include: {
        customer: true,
        pet: true,
        photos: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!reportCard) {
      return next(new AppError('Report card not found', 404));
    }

    // TODO: Implement actual email/SMS sending
    // For now, just update the status

    const updateData: any = {
      status: 'SENT',
      sentAt: new Date()
    };

    if (sendEmail) {
      updateData.sentViaEmail = true;
      updateData.emailDeliveredAt = new Date();
      // TODO: Send email via SendGrid
      console.log(`[EMAIL] Sending report card to ${reportCard.customer.email}`);
    }

    if (sendSMS && reportCard.customer.phone) {
      updateData.sentViaSMS = true;
      updateData.smsDeliveredAt = new Date();
      // TODO: Send SMS via Twilio
      console.log(`[SMS] Sending report card to ${reportCard.customer.phone}`);
    }

    const updated = await prisma.reportCard.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        pet: true,
        photos: true
      }
    });

    res.json({
      success: true,
      data: updated,
      message: 'Report card sent successfully'
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to send report card', 500));
  }
};

/**
 * Bulk create report cards
 * POST /api/report-cards/bulk
 */
export const bulkCreateReportCards = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const staffId = req.user?.id;

    if (!tenantId || !staffId) {
      return next(new AppError('Tenant ID and Staff ID are required', 400));
    }

    const { reportCards } = req.body;

    if (!Array.isArray(reportCards) || reportCards.length === 0) {
      return next(new AppError('Report cards array is required', 400));
    }

    // Create all report cards
    const created = await Promise.all(
      reportCards.map(async (card: any) => {
        return prisma.reportCard.create({
          data: {
            tenantId,
            petId: card.petId,
            customerId: card.customerId,
            reservationId: card.reservationId,
            createdByStaffId: staffId,
            serviceType: card.serviceType,
            templateType: card.templateType,
            title: card.title,
            summary: card.summary,
            moodRating: card.moodRating,
            energyRating: card.energyRating,
            appetiteRating: card.appetiteRating,
            socialRating: card.socialRating,
            activities: card.activities || [],
            mealsEaten: card.mealsEaten || [],
            bathroomBreaks: card.bathroomBreaks,
            medicationGiven: card.medicationGiven || false,
            medicationNotes: card.medicationNotes,
            behaviorNotes: card.behaviorNotes,
            highlights: card.highlights || [],
            concerns: card.concerns || [],
            tags: card.tags || [],
            notes: card.notes
          },
          include: {
            pet: {
              select: {
                id: true,
                name: true
              }
            },
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });
      })
    );

    res.status(201).json({
      success: true,
      data: {
        created: created.length,
        reportCards: created
      }
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to create bulk report cards', 500));
  }
};

/**
 * Bulk send report cards
 * POST /api/report-cards/bulk/send
 */
export const bulkSendReportCards = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const { reportCardIds, sendEmail = true, sendSMS = true } = req.body;

    if (!Array.isArray(reportCardIds) || reportCardIds.length === 0) {
      return next(new AppError('Report card IDs array is required', 400));
    }

    const updateData: any = {
      status: 'SENT',
      sentAt: new Date()
    };

    if (sendEmail) {
      updateData.sentViaEmail = true;
      updateData.emailDeliveredAt = new Date();
    }

    if (sendSMS) {
      updateData.sentViaSMS = true;
      updateData.smsDeliveredAt = new Date();
    }

    // Update all report cards
    const result = await prisma.reportCard.updateMany({
      where: {
        id: { in: reportCardIds },
        tenantId: tenantId!
      },
      data: updateData
    });

    // TODO: Actually send emails/SMS in background job

    res.json({
      success: true,
      data: {
        sent: result.count
      },
      message: `${result.count} report cards sent successfully`
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to send bulk report cards', 500));
  }
};

/**
 * Get customer's report cards
 * GET /api/customers/:customerId/report-cards
 */
export const getCustomerReportCards = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const tenantId = req.tenantId;

    const reportCards = await prisma.reportCard.findMany({
      where: {
        customerId,
        tenantId: tenantId!,
        status: { in: ['SENT', 'VIEWED'] } // Only show sent reports to customers
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            type: true,
            breed: true
          }
        },
        photos: {
          orderBy: { order: 'asc' }
        },
        createdByStaff: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { reportDate: 'desc' }
    });

    res.json({
      success: true,
      data: reportCards
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to fetch customer report cards', 500));
  }
};

/**
 * Get pet's report cards
 * GET /api/pets/:petId/report-cards
 */
export const getPetReportCards = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { petId } = req.params;
    const tenantId = req.tenantId;

    const reportCards = await prisma.reportCard.findMany({
      where: {
        petId,
        tenantId: tenantId!
      },
      include: {
        photos: {
          orderBy: { order: 'asc' },
          take: 3
        },
        createdByStaff: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { reportDate: 'desc' }
    });

    res.json({
      success: true,
      data: reportCards
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to fetch pet report cards', 500));
  }
};

/**
 * Get reservation's report cards
 * GET /api/reservations/:reservationId/report-cards
 */
export const getReservationReportCards = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reservationId } = req.params;
    const tenantId = req.tenantId;

    const reportCards = await prisma.reportCard.findMany({
      where: {
        reservationId,
        tenantId: tenantId!
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true
          }
        },
        photos: {
          orderBy: { order: 'asc' }
        },
        createdByStaff: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { reportDate: 'asc' }
    });

    res.json({
      success: true,
      data: reportCards
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Failed to fetch reservation report cards', 500));
  }
};
