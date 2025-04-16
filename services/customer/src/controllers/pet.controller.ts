import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = 'uploads/pets';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pet-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
}).single('photo');

// Get all pets
export const getAllPets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Process get all pets request
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || '');
    const skip = (page - 1) * limit;
    
    // Only search name and breed, type is an enum and needs exact match
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { breed: { contains: search, mode: 'insensitive' as const } }
          ],
        }
      : {};
    
    const [pets, total] = await prisma.$transaction([
      prisma.pet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { owner: true },
      }),
      prisma.pet.count({ where }),
    ]);
    
    res.status(200).json({
      status: 'success',
      results: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: pets,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single pet by ID
export const getPetById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (pet?.profilePhoto) {

    }
    
    if (!pet) {
      return next(new AppError('Pet not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: pet,
    });
  } catch (error) {
    next(error);
  }
};

// Get all reservations for a pet
export const getPetReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: { reservations: true },
    });
    
    if (!pet) {
      return next(new AppError('Pet not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      results: pet.reservations.length,
      data: pet.reservations,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new pet
export const createPet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let petData = { ...req.body };
    
    // Handle empty date strings
    if (petData.birthdate === '') {
      petData.birthdate = null;
    } else if (petData.birthdate) {
      petData.birthdate = new Date(petData.birthdate);
    }

    // Handle vaccine data
    if (petData.vaccineExpirations) {
      try {
        if (typeof petData.vaccineExpirations === 'string') {
          petData.vaccineExpirations = JSON.parse(petData.vaccineExpirations);
        }
        // Convert date strings to Date objects
        for (const key in petData.vaccineExpirations) {
          if (petData.vaccineExpirations[key]) {
            petData.vaccineExpirations[key] = new Date(petData.vaccineExpirations[key]);
          }
        }
      } catch (e) {
        return next(new AppError('Invalid vaccine expiration data', 400));
      }
    }

    // Handle vaccination status
    if (petData.vaccinationStatus) {
      try {
        if (typeof petData.vaccinationStatus === 'string') {
          petData.vaccinationStatus = JSON.parse(petData.vaccinationStatus);
        }
      } catch (e) {
        return next(new AppError('Invalid vaccination status data', 400));
      }
    }
    
    // Check if the customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: petData.customerId },
    });
    
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    const newPet = await prisma.pet.create({
      data: petData,
    });
    
    res.status(201).json({
      status: 'success',
      data: newPet,
    });
  } catch (error) {
    next(error);
  }
};

// Update a pet
export const updatePet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    let petData = { ...req.body };
    
    // Handle empty date strings
    if (petData.birthdate === '') {
      petData.birthdate = null;
    } else if (petData.birthdate) {
      petData.birthdate = new Date(petData.birthdate);
    }

    // Handle vaccine data
    if (petData.vaccineExpirations) {
      try {
        if (typeof petData.vaccineExpirations === 'string') {
          petData.vaccineExpirations = JSON.parse(petData.vaccineExpirations);
        }
        // Convert date strings to Date objects
        for (const key in petData.vaccineExpirations) {
          if (petData.vaccineExpirations[key]) {
            petData.vaccineExpirations[key] = new Date(petData.vaccineExpirations[key]);
          }
        }
      } catch (e) {
        return next(new AppError('Invalid vaccine expiration data', 400));
      }
    }

    // Handle vaccination status
    if (petData.vaccinationStatus) {
      try {
        if (typeof petData.vaccinationStatus === 'string') {
          petData.vaccinationStatus = JSON.parse(petData.vaccinationStatus);
        }
      } catch (e) {
        return next(new AppError('Invalid vaccination status data', 400));
      }
    }
    
    // If customerId is being updated, check if the customer exists
    if (petData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: petData.customerId },
      });
      
      if (!customer) {
        return next(new AppError('Customer not found', 404));
      }
    }
    
    const updatedPet = await prisma.pet.update({
      where: { id },
      data: petData,
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedPet,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a pet
// Upload a pet's photo
export const uploadPetPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if pet exists
    const pet = await prisma.pet.findUnique({
      where: { id },
    });

    if (!pet) {
      return next(new AppError('Pet not found', 404));
    }

    // Handle file upload
    upload(req, res, async (err: any) => {
      if (err instanceof multer.MulterError) {
        return next(new AppError(`Upload error: ${err.message}`, 400));
      } else if (err) {
        return next(new AppError(err.message, 400));
      }

      if (!req.file) {
        return next(new AppError('No file uploaded', 400));
      }

      // Delete old photo if it exists
      if (pet.profilePhoto) {
        const oldPhotoPath = path.join(process.cwd(), pet.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      // Update pet with new photo URL
      const photoUrl = `/api/uploads/pets/${path.basename(req.file.path)}`;
      // Photo upload successful
      const updatedPet = await prisma.pet.update({
        where: { id },
        data: { profilePhoto: photoUrl },
      });

      res.status(200).json({
        status: 'success',
        data: updatedPet,
      });
    });
  } catch (error) {
    next(error);
  }
};

// Get all pets for a customer
export const getPetsByCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { customerId } = req.params;
    
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    const pets = await prisma.pet.findMany({
      where: { customerId },
      orderBy: { name: 'asc' },
    });
    
    res.status(200).json({
      status: 'success',
      results: pets.length,
      totalPages: 1,
      currentPage: 1,
      data: pets,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    await prisma.pet.delete({
      where: { id },
    });
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
