import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

// Get all reservations - stub implementation
export const getAllReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract query parameters for logging purposes
    const { 
      page = '1', 
      limit = '10', 
      sortBy = 'startDate', 
      sortOrder = 'asc', 
      status, 
      customerId, 
      petId, 
      startDate, 
      endDate 
    } = req.query;
    
    console.log('Reservations requested with params:', { 
      page, limit, sortBy, sortOrder, status, customerId, petId, startDate, endDate 
    });

    // Return stub data
    const mockReservations = [
      {
        id: 'reservation-1',
        orderNumber: 'ORD-001',
        customerId: 'customer-1',
        petId: 'pet-1',
        resourceId: 'resource-1',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(), // +2 days
        status: 'CONFIRMED',
        suiteType: 'STANDARD_SUITE',
        price: 120.00,
        deposit: 60.00,
        balance: 60.00,
        notes: 'Standard boarding',
        staffNotes: 'Needs medication twice daily',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // -1 day
        updatedAt: new Date(Date.now() - 86400000).toISOString(), // -1 day
        customer: {
          id: 'customer-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567'
        },
        pet: {
          id: 'pet-1',
          name: 'Buddy',
          breed: 'Golden Retriever',
          size: 'LARGE',
          weight: 70.5
        },
        resource: {
          id: 'resource-1',
          name: 'Standard Suite 1',
          type: 'STANDARD_SUITE'
        }
      },
      {
        id: 'reservation-2',
        orderNumber: 'ORD-002',
        customerId: 'customer-2',
        petId: 'pet-2',
        resourceId: 'resource-2',
        startDate: new Date(Date.now() + 86400000).toISOString(), // +1 day
        endDate: new Date(Date.now() + 259200000).toISOString(), // +3 days
        status: 'CONFIRMED',
        suiteType: 'VIP_SUITE',
        price: 180.00,
        deposit: 90.00,
        balance: 90.00,
        notes: 'VIP boarding',
        staffNotes: 'Allergic to chicken',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // -2 days
        updatedAt: new Date(Date.now() - 172800000).toISOString(), // -2 days
        customer: {
          id: 'customer-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '555-987-6543'
        },
        pet: {
          id: 'pet-2',
          name: 'Whiskers',
          breed: 'Siamese Cat',
          size: 'MEDIUM',
          weight: 12.3
        },
        resource: {
          id: 'resource-2',
          name: 'VIP Suite 1',
          type: 'VIP_SUITE'
        }
      }
    ];

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const totalResults = mockReservations.length;
    const totalPages = Math.ceil(totalResults / limitNum);

    res.status(200).json({
      status: 'success',
      pagination: {
        totalPages,
        currentPage: pageNum,
        results: mockReservations.length
      },
      data: {
        reservations: mockReservations
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get reservation by ID - stub implementation
export const getReservationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    console.log('Reservation requested by ID:', id);

    // Return stub data for the specific reservation
    const mockReservation = {
      id,
      orderNumber: `ORD-${id.slice(-3)}`,
      customerId: 'customer-1',
      petId: 'pet-1',
      resourceId: 'resource-1',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 172800000).toISOString(), // +2 days
      status: 'CONFIRMED',
      suiteType: 'STANDARD_SUITE',
      price: 120.00,
      deposit: 60.00,
      balance: 60.00,
      notes: 'Standard boarding',
      staffNotes: 'Needs medication twice daily',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // -1 day
      updatedAt: new Date(Date.now() - 86400000).toISOString(), // -1 day
      customer: {
        id: 'customer-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567'
      },
      pet: {
        id: 'pet-1',
        name: 'Buddy',
        breed: 'Golden Retriever',
        size: 'LARGE',
        weight: 70.5
      },
      resource: {
        id: 'resource-1',
        name: 'Standard Suite 1',
        type: 'STANDARD_SUITE'
      }
    };

    res.status(200).json({
      status: 'success',
      data: mockReservation
    });
  } catch (error) {
    next(error);
  }
};

// Create reservation - stub implementation
export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reservationData = req.body;
    console.log('Creating reservation:', reservationData);

    // Return stub data
    const mockReservation = {
      id: `reservation-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      ...reservationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      status: 'success',
      data: mockReservation
    });
  } catch (error) {
    next(error);
  }
};

// Update reservation - stub implementation
export const updateReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const reservationData = req.body;
    console.log('Updating reservation:', { id, reservationData });

    // Return stub data
    const mockReservation = {
      id,
      ...reservationData,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      status: 'success',
      data: mockReservation
    });
  } catch (error) {
    next(error);
  }
};

// Delete reservation - stub implementation
export const deleteReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    console.log('Deleting reservation:', id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
