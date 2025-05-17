/**
 * Authentication Middleware
 * 
 * This middleware handles JWT authentication and role-based authorization.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload {
  id: string;
  role: string;
}

/**
 * Protect routes - requires authentication
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get token from headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret') as JwtPayload;

    // 3) Check if user still exists
    // Using type assertion since we might be using mock data in development
    const currentUser = await (prisma as any).user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      return next(new AppError('The user associated with this token no longer exists.', 401));
    }

    // 4) Add user to request object
    req.body.userId = decoded.id;
    req.body.userRole = decoded.role;
    next();
  } catch (error) {
    return next(new AppError('Authentication failed. Please log in again.', 401));
  }
};

/**
 * Restrict to specific roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.body.userRole)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};
