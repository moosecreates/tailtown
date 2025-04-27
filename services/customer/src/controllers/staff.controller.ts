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
