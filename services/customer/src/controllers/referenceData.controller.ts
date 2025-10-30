/**
 * Reference Data Controller
 * 
 * Handles API endpoints for breeds, veterinarians, and temperaments
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all breeds, optionally filtered by species
 */
export const getBreeds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { species } = req.query;
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';

    const where: any = {
      tenantId,
      isActive: true
    };

    if (species) {
      where.species = species;
    }

    const breeds = await prisma.$queryRaw`
      SELECT id, name, species, "gingrId", "isActive"
      FROM breeds
      WHERE "tenantId" = ${tenantId}
        AND "isActive" = true
        ${species ? prisma.$queryRaw`AND species = ${species}` : prisma.$queryRaw``}
      ORDER BY name ASC
    `;

    res.status(200).json({
      status: 'success',
      data: breeds
    });
  } catch (error) {
    console.error('Error fetching breeds:', error);
    next(error);
  }
};

/**
 * Get all veterinarians
 */
export const getVeterinarians = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';

    const vets = await prisma.$queryRaw`
      SELECT id, name, phone, fax, email, 
             "address1", "address2", city, state, zip,
             notes, "isActive"
      FROM veterinarians
      WHERE "tenantId" = ${tenantId}
        AND "isActive" = true
      ORDER BY name ASC
    `;

    res.status(200).json({
      status: 'success',
      data: vets
    });
  } catch (error) {
    console.error('Error fetching veterinarians:', error);
    next(error);
  }
};

/**
 * Get all temperament types
 */
export const getTemperamentTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';

    const temperaments = await prisma.$queryRaw`
      SELECT id, name, description, "isActive"
      FROM temperament_types
      WHERE "tenantId" = ${tenantId}
        AND "isActive" = true
      ORDER BY name ASC
    `;

    res.status(200).json({
      status: 'success',
      data: temperaments
    });
  } catch (error) {
    console.error('Error fetching temperament types:', error);
    next(error);
  }
};

/**
 * Get temperaments for a specific pet
 */
export const getPetTemperaments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { petId } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';

    const temperaments = await prisma.$queryRaw`
      SELECT id, "petId", temperament
      FROM pet_temperaments
      WHERE "petId" = ${petId}
        AND "tenantId" = ${tenantId}
    `;

    res.status(200).json({
      status: 'success',
      data: temperaments
    });
  } catch (error) {
    console.error('Error fetching pet temperaments:', error);
    next(error);
  }
};

/**
 * Update temperaments for a pet
 */
export const updatePetTemperaments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { petId } = req.params;
    const { temperaments } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string || 'dev';

    // Delete existing temperaments
    await prisma.$executeRaw`
      DELETE FROM pet_temperaments
      WHERE "petId" = ${petId}
        AND "tenantId" = ${tenantId}
    `;

    // Insert new temperaments
    if (temperaments && temperaments.length > 0) {
      for (const temperament of temperaments) {
        await prisma.$executeRaw`
          INSERT INTO pet_temperaments ("petId", temperament, "tenantId")
          VALUES (${petId}, ${temperament}, ${tenantId})
        `;
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Temperaments updated successfully'
    });
  } catch (error) {
    console.error('Error updating pet temperaments:', error);
    next(error);
  }
};
