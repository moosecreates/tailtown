import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Get all staff members
export const getAllStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const role = req.query.role as string;
    const department = req.query.department as string;
    
    // Build where condition
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (role) {
      where.role = role;
    }
    if (department) {
      // Add department to where clause using Prisma.sql for raw query
      // This is a workaround since the field isn't recognized by TypeScript yet
      (where as any).department = department;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const staff = await prisma.staff.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        role: true,
        department: true,
        position: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password and other sensitive fields
      } as any,
      orderBy: { lastName: 'asc' }
    });
    
    const total = await prisma.staff.count({ where });
    
    res.status(200).json({
      status: 'success',
      results: staff.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single staff member by ID
export const getStaffById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const staff = await prisma.staff.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        role: true,
        department: true,
        position: true,
        specialties: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password and other sensitive fields
      } as any
    });
    
    if (!staff) {
      return next(new AppError('Staff member not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new staff member
export const createStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const staffData = req.body;
    
    // Check if email already exists
    const existingStaff = await prisma.staff.findUnique({
      where: { email: staffData.email },
      select: { id: true }
    });
    
    if (existingStaff) {
      return next(new AppError('Email already in use', 400));
    }
    
    // Hash the password
    if (!staffData.password) {
      return next(new AppError('Password is required', 400));
    }
    
    const hashedPassword = await bcrypt.hash(staffData.password, 10);
    
    // Create staff member
    const newStaff = await prisma.staff.create({
      data: {
        ...staffData,
        password: hashedPassword
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        role: true,
        department: true,
        position: true,
        specialties: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password and other sensitive fields
      } as any
    });
    
    res.status(201).json({
      status: 'success',
      data: newStaff,
    });
  } catch (error) {
    next(error);
  }
};

// Update a staff member
export const updateStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const staffData = req.body;
    
    // Check if staff exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!existingStaff) {
      return next(new AppError('Staff member not found', 404));
    }
    
    // If updating email, check if it's already in use by another staff
    if (staffData.email) {
      const emailInUse = await prisma.staff.findFirst({
        where: {
          email: staffData.email,
          id: { not: id }
        },
        select: { id: true }
      });
      
      if (emailInUse) {
        return next(new AppError('Email already in use by another staff member', 400));
      }
    }
    
    // If updating password, hash it
    if (staffData.password) {
      staffData.password = await bcrypt.hash(staffData.password, 10);
    }
    
    // Update staff member
    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: staffData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        role: true,
        department: true,
        position: true,
        specialties: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password and other sensitive fields
      } as any
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a staff member
export const deleteStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if staff exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!existingStaff) {
      return next(new AppError('Staff member not found', 404));
    }
    
    // Delete staff member
    await prisma.staff.delete({
      where: { id }
    });
    
    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Authenticate staff member (login)
export const loginStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }
    
    // Find staff by email
    const staff = await prisma.staff.findUnique({
      where: { email }
    });
    
    if (!staff || !staff.isActive) {
      return next(new AppError('Invalid credentials or inactive account', 401));
    }
    
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, (staff as any).password);
    
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid credentials', 401));
    }
    
    // Update last login time
    await prisma.staff.update({
      where: { id: staff.id },
      data: { 
        // Explicitly cast the data object to any to bypass type checking
        // since we've added fields to the schema that aren't yet recognized by the Prisma client
        lastLogin: new Date() 
      } as any
    });
    
    // Create a new object without sensitive fields
    const staffData = {
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      specialties: staff.specialties,
      isActive: staff.isActive,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      // Cast to any to access fields not recognized by TypeScript yet
      position: (staff as any).position,
      department: (staff as any).department,
      hireDate: (staff as any).hireDate
    };
    
    res.status(200).json({
      status: 'success',
      data: staffData,
    });
  } catch (error) {
    next(error);
  }
};

// Request password reset
export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next(new AppError('Please provide email', 400));
    }
    
    // Find staff by email
    const staff = await prisma.staff.findUnique({
      where: { email }
    });
    
    if (!staff || !staff.isActive) {
      // For security reasons, don't reveal if the email exists or not
      return res.status(200).json({
        status: 'success',
        message: 'If your email is registered, you will receive a password reset link'
      });
    }
    
    // Generate reset token (random string)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    
    // Set token expiry to 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    
    // Save token to database
    await prisma.staff.update({
      where: { id: staff.id },
      data: {
        // Explicitly cast the data object to any to bypass type checking
        // since we've added fields to the schema that aren't yet recognized by the Prisma client
        resetToken,
        resetTokenExpiry
      } as any
    });
    
    // In a real application, you would send an email with the reset link
    // For now, we'll just return the token in the response
    res.status(200).json({
      status: 'success',
      message: 'If your email is registered, you will receive a password reset link',
      // Only for development purposes
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return next(new AppError('Please provide token and new password', 400));
    }
    
    // Find staff by reset token and check if token is still valid
    const staff = await prisma.staff.findFirst({
      where: {
        // Explicitly cast the where object to any to bypass type checking
        // since we've added fields to the schema that aren't yet recognized by the Prisma client
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      } as any
    });
    
    if (!staff) {
      return next(new AppError('Invalid or expired token', 400));
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password and clear reset token
    await prisma.staff.update({
      where: { id: staff.id },
      data: {
        // Explicitly cast the data object to any to bypass type checking
        // since we've added fields to the schema that aren't yet recognized by the Prisma client
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      } as any
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Staff Availability Management

// Get availability for a staff member
export const getStaffAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { staffId } = req.params;
    
    const availability = await prisma.staffAvailability.findMany({
      where: { staffId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });
    
    res.status(200).json({
      status: 'success',
      results: availability.length,
      data: availability
    });
  } catch (error) {
    next(error);
  }
};

// Create availability for a staff member
export const createStaffAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { staffId } = req.params;
    const availabilityData = req.body;
    
    // Validate required fields
    if (availabilityData.dayOfWeek === undefined || !availabilityData.startTime || !availabilityData.endTime) {
      return next(new AppError('Day of week, start time, and end time are required', 400));
    }
    
    // Prepare data for creation
    const createData: any = {
      staffId,
      dayOfWeek: Number(availabilityData.dayOfWeek),
      startTime: availabilityData.startTime,
      endTime: availabilityData.endTime,
      isAvailable: availabilityData.isAvailable !== undefined ? Boolean(availabilityData.isAvailable) : true,
      isRecurring: availabilityData.isRecurring !== undefined ? Boolean(availabilityData.isRecurring) : true
      // Note: 'notes' field is not in the Prisma schema
    };
    
    // Handle date fields if present
    if (availabilityData.effectiveFrom) {
      createData.effectiveFrom = new Date(availabilityData.effectiveFrom);
    }
    
    if (availabilityData.effectiveUntil) {
      createData.effectiveUntil = new Date(availabilityData.effectiveUntil);
    }
    
    console.log('Creating staff availability with data:', createData);
    
    // Create availability record
    const newAvailability = await prisma.staffAvailability.create({
      data: createData
    });
    
    res.status(201).json({
      status: 'success',
      data: newAvailability
    });
  } catch (error) {
    console.error('Error creating staff availability:', error);
    next(error);
  }
};

// Update staff availability
export const updateStaffAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const availabilityData = req.body;
    
    // Check if availability exists
    const existingAvailability = await prisma.staffAvailability.findUnique({
      where: { id }
    });
    
    if (!existingAvailability) {
      return next(new AppError('Availability record not found', 404));
    }
    
    // Prepare data for update
    const updateData: any = {};
    
    // Handle basic fields
    if (availabilityData.dayOfWeek !== undefined) {
      updateData.dayOfWeek = Number(availabilityData.dayOfWeek);
    }
    
    if (availabilityData.startTime) {
      updateData.startTime = availabilityData.startTime;
    }
    
    if (availabilityData.endTime) {
      updateData.endTime = availabilityData.endTime;
    }
    
    if (availabilityData.isAvailable !== undefined) {
      updateData.isAvailable = Boolean(availabilityData.isAvailable);
    }
    
    if (availabilityData.isRecurring !== undefined) {
      updateData.isRecurring = Boolean(availabilityData.isRecurring);
    }
    
    // Note: 'notes' field is not in the Prisma schema
    // Removed notes field handling
    
    // Handle date fields
    if (availabilityData.effectiveFrom !== undefined) {
      updateData.effectiveFrom = availabilityData.effectiveFrom ? new Date(availabilityData.effectiveFrom) : null;
    }
    
    if (availabilityData.effectiveUntil !== undefined) {
      updateData.effectiveUntil = availabilityData.effectiveUntil ? new Date(availabilityData.effectiveUntil) : null;
    }
    
    console.log('Updating staff availability with data:', updateData);
    
    // Update availability
    const updatedAvailability = await prisma.staffAvailability.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedAvailability
    });
  } catch (error) {
    console.error('Error updating staff availability:', error);
    next(error);
  }
};

// Delete staff availability
export const deleteStaffAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if availability exists
    const existingAvailability = await prisma.staffAvailability.findUnique({
      where: { id }
    });
    
    if (!existingAvailability) {
      return next(new AppError('Availability record not found', 404));
    }
    
    // Delete availability
    await prisma.staffAvailability.delete({
      where: { id }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Availability record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Staff Time Off Management

// Get time off for a staff member
export const getStaffTimeOff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { staffId } = req.params;
    const status = req.query.status as string;
    
    // Build where condition
    const where: any = { staffId };
    if (status) {
      where.status = status;
    }
    
    const timeOff = await prisma.staffTimeOff.findMany({
      where,
      orderBy: { startDate: 'asc' }
    });
    
    res.status(200).json({
      status: 'success',
      results: timeOff.length,
      data: timeOff
    });
  } catch (error) {
    next(error);
  }
};

// Create time off for a staff member
export const createStaffTimeOff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { staffId } = req.params;
    const timeOffData = req.body;
    
    // Validate required fields
    if (!timeOffData.startDate || !timeOffData.endDate || !timeOffData.type) {
      return next(new AppError('Start date, end date, and type are required', 400));
    }
    
    // Prepare data for creation
    const createData: any = {
      staffId,
      startDate: new Date(timeOffData.startDate),
      endDate: new Date(timeOffData.endDate),
      type: timeOffData.type,
      status: timeOffData.status || 'PENDING',
      reason: timeOffData.reason || null
    };
    
    // Handle optional fields
    if (timeOffData.notes) {
      createData.notes = timeOffData.notes;
    }
    
    if (timeOffData.approvedById) {
      createData.approvedById = timeOffData.approvedById;
    }
    
    if (timeOffData.approvedDate) {
      createData.approvedDate = new Date(timeOffData.approvedDate);
    }
    
    console.log('Creating staff time off with data:', createData);
    
    // Create time off record
    const newTimeOff = await prisma.staffTimeOff.create({
      data: createData
    });
    
    res.status(201).json({
      status: 'success',
      data: newTimeOff
    });
  } catch (error) {
    console.error('Error creating staff time off:', error);
    next(error);
  }
};

// Update staff time off
export const updateStaffTimeOff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const timeOffData = req.body;
    
    // Check if time off exists
    const existingTimeOff = await prisma.staffTimeOff.findUnique({
      where: { id }
    });
    
    if (!existingTimeOff) {
      return next(new AppError('Time off record not found', 404));
    }
    
    // Prepare data for update
    const updateData: any = {};
    
    // Handle basic fields
    if (timeOffData.type !== undefined) {
      updateData.type = timeOffData.type;
    }
    
    if (timeOffData.status !== undefined) {
      updateData.status = timeOffData.status;
    }
    
    if (timeOffData.reason !== undefined) {
      updateData.reason = timeOffData.reason;
    }
    
    if (timeOffData.notes !== undefined) {
      updateData.notes = timeOffData.notes;
    }
    
    // Handle date fields
    if (timeOffData.startDate) {
      updateData.startDate = new Date(timeOffData.startDate);
    }
    
    if (timeOffData.endDate) {
      updateData.endDate = new Date(timeOffData.endDate);
    }
    
    // Handle approval fields
    if (timeOffData.approvedById !== undefined) {
      updateData.approvedById = timeOffData.approvedById;
    }
    
    if (timeOffData.approvedDate !== undefined) {
      updateData.approvedDate = timeOffData.approvedDate ? new Date(timeOffData.approvedDate) : null;
    }
    
    console.log('Updating staff time off with data:', updateData);
    
    // Update time off
    const updatedTimeOff = await prisma.staffTimeOff.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedTimeOff
    });
  } catch (error) {
    console.error('Error updating staff time off:', error);
    next(error);
  }
};

// Delete staff time off
export const deleteStaffTimeOff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if time off exists
    const existingTimeOff = await prisma.staffTimeOff.findUnique({
      where: { id }
    });
    
    if (!existingTimeOff) {
      return next(new AppError('Time off record not found', 404));
    }
    
    // Delete time off
    await prisma.staffTimeOff.delete({
      where: { id }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Time off record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get available staff for scheduling
export const getAvailableStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date, startTime, endTime, specialties } = req.query;
    
    if (!date || !startTime || !endTime) {
      return next(new AppError('Date, start time, and end time are required', 400));
    }
    
    const searchDate = new Date(date as string);
    const dayOfWeek = searchDate.getDay(); // 0-6 for Sunday-Saturday
    
    // Process specialties parameter
    let specialtiesArray: string[] = [];
    if (specialties) {
      if (Array.isArray(specialties)) {
        specialtiesArray = specialties.map(s => String(s));
      } else {
        specialtiesArray = [String(specialties)];
      }
    }

    // Find staff who are available on this day and time
    const availableStaff = await prisma.staff.findMany({
      where: {
        isActive: true,
        // Include staff with matching specialties if provided
        ...(specialtiesArray.length > 0 ? {
          specialties: {
            hasSome: specialtiesArray
          }
        } : {}),
        // Include staff who have availability for this day and time
        availability: {
          some: {
            dayOfWeek,
            isAvailable: true,
            startTime: {
              lte: startTime as string
            },
            endTime: {
              gte: endTime as string
            },
            // Use AND condition with nested OR conditions for date ranges
            AND: [
              {
                OR: [
                  { effectiveFrom: null },
                  { effectiveFrom: { lte: searchDate } }
                ]
              },
              {
                OR: [
                  { effectiveUntil: null },
                  { effectiveUntil: { gte: searchDate } }
                ]
              }
            ]
          }
        },
        // Exclude staff who have time off on this day
        NOT: {
          timeOff: {
            some: {
              status: 'APPROVED',
              startDate: { lte: searchDate },
              endDate: { gte: searchDate }
            }
          }
        }
      },
      include: {
        availability: true
      }
    });
    
    res.status(200).json({
      status: 'success',
      results: availableStaff.length,
      data: availableStaff
    });
  } catch (error) {
    next(error);
  }
};
