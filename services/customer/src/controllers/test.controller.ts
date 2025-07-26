import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const testResources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Testing basic resource query...');
    
    // Try raw SQL first to bypass Prisma completely
    const rawResult = await prisma.$queryRaw`SELECT id, name, type FROM resources LIMIT 5`;
    console.log('Raw SQL result:', rawResult);
    
    res.status(200).json({
      status: 'success',
      method: 'raw_sql',
      count: Array.isArray(rawResult) ? rawResult.length : 0,
      data: rawResult
    });
  } catch (error) {
    console.error('Test resource query failed:', error);
    
    // Return error details for debugging
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      meta: (error as any)?.meta
    });
  }
};
