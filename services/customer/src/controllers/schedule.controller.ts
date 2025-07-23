import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import AppError from '../utils/appError';

const prisma = new PrismaClient() as DynamicPrisma;

// Use dynamic access to handle different model names
type DynamicPrisma = PrismaClient & Record<string, any>;

// Get all schedules with real database implementation
export const getAllSchedules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract query parameters
    const { startDate, endDate, staffId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    console.log('Schedules requested with params:', { startDate, endDate, staffId, page, limit });

    // Build where condition
    const where: any = {};
    
    if (staffId) {
      where.staffId = staffId as string;
    }
    
    if (startDate) {
      where.startTime = {
        gte: new Date(startDate as string)
      };
    }
    
    if (endDate) {
      where.endTime = {
        lte: new Date(endDate as string)
      };
    }
    
    // Determine which table to use (schedules or Schedule)
    let schedulesTable;
    try {
      // First try with 'schedules' table
      const testCount = await prisma.schedules.count();
      schedulesTable = 'schedules';
      console.log(`Found ${testCount} schedules in 'schedules' table`);
    } catch (err) {
      // If that fails, try with 'Schedule' table
      try {
        const testCount = await prisma.Schedule.count();
        schedulesTable = 'Schedule';
        console.log(`Found ${testCount} schedules in 'Schedule' table`);
      } catch (innerErr) {
        console.error('Error querying both schedule tables:', innerErr);
        return res.status(500).json({
          status: 'error',
          message: 'Schedule data is not available'
        });
      }
    }
    
    // Query the correct table
    let schedules, total;
    if (schedulesTable === 'schedules') {
      schedules = await prisma.schedules.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          staff: true
        }
      });
      
      total = await prisma.schedules.count({ where });
    } else {
      schedules = await prisma.Schedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          Staff: true
        }
      });
      
      total = await prisma.Schedule.count({ where });
      
      // Normalize the response to match expected format
      schedules = schedules.map((schedule: any) => ({
        ...schedule,
        staff: schedule.Staff
      }));
    }

    console.log(`Found ${schedules.length} schedules`);
    
    res.status(200).json({
      status: 'success',
      results: schedules.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: schedules
    });
  } catch (error) {
    console.error('Error in getAllSchedules:', error);
    next(error);
  }
};

// Get staff schedules with real database implementation
export const getStaffSchedules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { staffId } = req.params;
    const { startDate, endDate } = req.query;
    
    console.log('Staff schedules requested for:', { staffId, startDate, endDate });

    // Build where condition
    const where: any = { staffId };
    
    if (startDate) {
      where.startTime = {
        gte: new Date(startDate as string)
      };
    }
    
    if (endDate) {
      where.endTime = {
        lte: new Date(endDate as string)
      };
    }
    
    // Determine which table to use (schedules or Schedule)
    let schedulesTable;
    try {
      // First try with 'schedules' table
      const testCount = await prisma.schedules.count({ where: { staffId } });
      schedulesTable = 'schedules';
      console.log(`Found ${testCount} schedules for staff ${staffId} in 'schedules' table`);
    } catch (err) {
      // If that fails, try with 'Schedule' table
      try {
        const testCount = await prisma.Schedule.count({ where: { staffId } });
        schedulesTable = 'Schedule';
        console.log(`Found ${testCount} schedules for staff ${staffId} in 'Schedule' table`);
      } catch (innerErr) {
        console.error('Error querying both schedule tables:', innerErr);
        return res.status(500).json({
          status: 'error',
          message: 'Schedule data is not available'
        });
      }
    }
    
    // Query the correct table
    let schedules;
    if (schedulesTable === 'schedules') {
      schedules = await prisma.schedules.findMany({
        where,
        orderBy: { startTime: 'asc' }
      });
    } else {
      schedules = await prisma.Schedule.findMany({
        where,
        orderBy: { startTime: 'asc' }
      });
    }

    console.log(`Found ${schedules.length} schedules for staff ${staffId}`);
    
    res.status(200).json({
      status: 'success',
      results: schedules.length,
      data: schedules
    });
  } catch (error) {
    console.error(`Error in getStaffSchedules for staffId ${req.params.staffId}:`, error);
    next(error);
  }
};

// Create staff schedule with real database implementation
export const createStaffSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { staffId } = req.params;
    const scheduleData = req.body;
    
    console.log('Creating staff schedule:', { staffId, scheduleData });

    // Validate required fields
    if (!scheduleData.startTime || !scheduleData.endTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Start time and end time are required'
      });
    }

    // Determine which table to use (schedules or Schedule)
    let schedulesTable;
    try {
      // First try with 'schedules' table
      await prisma.schedules.count();
      schedulesTable = 'schedules';
    } catch (err) {
      // If that fails, try with 'Schedule' table
      try {
        await prisma.Schedule.count();
        schedulesTable = 'Schedule';
      } catch (innerErr) {
        console.error('Error querying both schedule tables:', innerErr);
        return res.status(500).json({
          status: 'error',
          message: 'Schedule data is not available'
        });
      }
    }
    
    // Create in the correct table
    let newSchedule;
    if (schedulesTable === 'schedules') {
      newSchedule = await prisma.schedules.create({
        data: {
          staffId,
          startTime: new Date(scheduleData.startTime),
          endTime: new Date(scheduleData.endTime),
          status: scheduleData.status || 'CONFIRMED',
          notes: scheduleData.notes || null
        }
      });
    } else {
      newSchedule = await prisma.Schedule.create({
        data: {
          staffId,
          startTime: new Date(scheduleData.startTime),
          endTime: new Date(scheduleData.endTime),
          status: scheduleData.status || 'CONFIRMED',
          notes: scheduleData.notes || null
        }
      });
    }

    console.log('Created new schedule:', newSchedule);
    
    res.status(201).json({
      status: 'success',
      data: newSchedule
    });
  } catch (error) {
    console.error('Error creating staff schedule:', error);
    next(error);
  }
};

// Update staff schedule with real database implementation
export const updateStaffSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { scheduleId } = req.params;
    const scheduleData = req.body;
    
    console.log('Updating staff schedule:', { scheduleId, scheduleData });

    // Determine which table to use (schedules or Schedule)
    let schedulesTable;
    try {
      // First try with 'schedules' table
      const schedule = await prisma.schedules.findUnique({ where: { id: scheduleId } });
      if (schedule) {
        schedulesTable = 'schedules';
      } else {
        // If not found, try with 'Schedule' table
        const scheduleAlt = await prisma.Schedule.findUnique({ where: { id: scheduleId } });
        if (scheduleAlt) {
          schedulesTable = 'Schedule';
        } else {
          return res.status(404).json({
            status: 'error',
            message: `Schedule with ID ${scheduleId} not found`
          });
        }
      }
    } catch (err) {
      console.error('Error finding schedule:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Error finding schedule'
      });
    }
    
    // Update in the correct table
    let updatedSchedule;
    const updateData: any = {};
    
    // Only update fields that are provided
    if (scheduleData.startTime) updateData.startTime = new Date(scheduleData.startTime);
    if (scheduleData.endTime) updateData.endTime = new Date(scheduleData.endTime);
    if (scheduleData.status) updateData.status = scheduleData.status;
    if (scheduleData.notes !== undefined) updateData.notes = scheduleData.notes;
    
    if (schedulesTable === 'schedules') {
      updatedSchedule = await prisma.schedules.update({
        where: { id: scheduleId },
        data: updateData
      });
    } else {
      updatedSchedule = await prisma.Schedule.update({
        where: { id: scheduleId },
        data: updateData
      });
    }

    console.log('Updated schedule:', updatedSchedule);
    
    res.status(200).json({
      status: 'success',
      data: updatedSchedule
    });
  } catch (error) {
    console.error(`Error updating schedule ${req.params.scheduleId}:`, error);
    next(error);
  }
};

// Delete staff schedule with real database implementation
export const deleteStaffSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { scheduleId } = req.params;
    
    console.log('Deleting staff schedule:', { scheduleId });

    // Determine which table to use (schedules or Schedule)
    let schedulesTable;
    try {
      // First try with 'schedules' table
      const schedule = await prisma.schedules.findUnique({ where: { id: scheduleId } });
      if (schedule) {
        schedulesTable = 'schedules';
      } else {
        // If not found, try with 'Schedule' table
        const scheduleAlt = await prisma.Schedule.findUnique({ where: { id: scheduleId } });
        if (scheduleAlt) {
          schedulesTable = 'Schedule';
        } else {
          return res.status(404).json({
            status: 'error',
            message: `Schedule with ID ${scheduleId} not found`
          });
        }
      }
    } catch (err) {
      console.error('Error finding schedule:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Error finding schedule'
      });
    }
    
    // Delete from the correct table
    if (schedulesTable === 'schedules') {
      await prisma.schedules.delete({
        where: { id: scheduleId }
      });
    } else {
      await prisma.Schedule.delete({
        where: { id: scheduleId }
      });
    }

    console.log(`Schedule ${scheduleId} deleted successfully`);
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting schedule ${req.params.scheduleId}:`, error);
    next(error);
  }
};

// Bulk create schedules with real database implementation
export const bulkCreateSchedules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schedulesData = req.body;
    
    if (!Array.isArray(schedulesData) || schedulesData.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Request body must be a non-empty array of schedules'
      });
    }
    
    console.log('Bulk creating schedules:', { count: schedulesData.length });

    // Determine which table to use (schedules or Schedule)
    let schedulesTable;
    try {
      // First try with 'schedules' table
      await prisma.schedules.count();
      schedulesTable = 'schedules';
    } catch (err) {
      // If that fails, try with 'Schedule' table
      try {
        await prisma.Schedule.count();
        schedulesTable = 'Schedule';
      } catch (innerErr) {
        console.error('Error querying both schedule tables:', innerErr);
        return res.status(500).json({
          status: 'error',
          message: 'Schedule data is not available'
        });
      }
    }
    
    // Process each schedule
    const createdSchedules: any[] = [];
    
    // Use a transaction for bulk operations
    await prisma.$transaction(async (prismaClient) => {
      for (const scheduleData of schedulesData) {
        // Validate required fields
        if (!scheduleData.staffId || !scheduleData.startTime || !scheduleData.endTime) {
          throw new Error('Staff ID, start time, and end time are required for all schedules');
        }
        
        // Create in the correct table
        let newSchedule;
        if (schedulesTable === 'schedules') {
          newSchedule = await prismaClient.schedules.create({
            data: {
              staffId: scheduleData.staffId,
              startTime: new Date(scheduleData.startTime),
              endTime: new Date(scheduleData.endTime),
              status: scheduleData.status || 'CONFIRMED',
              notes: scheduleData.notes || null
            }
          });
        } else {
          newSchedule = await prismaClient.Schedule.create({
            data: {
              staffId: scheduleData.staffId,
              startTime: new Date(scheduleData.startTime),
              endTime: new Date(scheduleData.endTime),
              status: scheduleData.status || 'CONFIRMED',
              notes: scheduleData.notes || null
            }
          });
        }
        
        createdSchedules.push(newSchedule);
      }
    });

    console.log(`Created ${createdSchedules.length} schedules successfully`);
    
    res.status(201).json({
      status: 'success',
      results: createdSchedules.length,
      data: createdSchedules
    });
  } catch (error) {
    console.error('Error in bulk creating schedules:', error);
    next(error);
  }
};
