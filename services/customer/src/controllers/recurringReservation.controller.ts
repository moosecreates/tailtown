import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

/**
 * Recurring Reservation Pattern Controller
 * Handles CRUD operations for recurring reservation patterns
 */
export const recurringReservationController = {
  /**
   * Get recurring pattern for a reservation
   */
  getRecurringPattern: async (req: Request, res: Response): Promise<void> => {
    try {
      const { reservationId } = req.params;
      
      const pattern = await prisma.recurringReservationPattern.findUnique({
        where: { reservationId }
      });
      
      if (!pattern) {
        res.status(404).json({ message: 'Recurring pattern not found' });
        return;
      }
      
      res.status(200).json(pattern);
    } catch (error) {
      handleError(error, req, res);
    }
  },
  
  /**
   * Create a recurring pattern for a reservation
   */
  createRecurringPattern: async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        reservationId, 
        frequency, 
        daysOfWeek, 
        interval, 
        endDate, 
        occurrenceLimit 
      } = req.body;
      
      // Validate required fields
      if (!reservationId || !frequency) {
        res.status(400).json({ message: 'Reservation ID and frequency are required' });
        return;
      }
      
      // Check if reservation exists
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId }
      });
      
      if (!reservation) {
        res.status(404).json({ message: 'Reservation not found' });
        return;
      }
      
      // Check if pattern already exists for this reservation
      const existingPattern = await prisma.recurringReservationPattern.findUnique({
        where: { reservationId }
      });
      
      if (existingPattern) {
        res.status(409).json({ message: 'Recurring pattern already exists for this reservation' });
        return;
      }
      
      // Create new recurring pattern
      const newPattern = await prisma.recurringReservationPattern.create({
        data: {
          reservationId,
          frequency,
          daysOfWeek: daysOfWeek || [],
          interval: interval || 1,
          endDate: endDate ? new Date(endDate) : null,
          occurrenceLimit
        }
      });
      
      // Update the reservation to mark it as recurring
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { isRecurring: true }
      });
      
      res.status(201).json(newPattern);
    } catch (error) {
      handleError(error, req, res);
    }
  },
  
  /**
   * Update an existing recurring pattern
   */
  updateRecurringPattern: async (req: Request, res: Response): Promise<void> => {
    try {
      const { reservationId } = req.params;
      const { 
        frequency, 
        daysOfWeek, 
        interval, 
        endDate, 
        occurrenceLimit 
      } = req.body;
      
      // Check if pattern exists
      const existingPattern = await prisma.recurringReservationPattern.findUnique({
        where: { reservationId }
      });
      
      if (!existingPattern) {
        res.status(404).json({ message: 'Recurring pattern not found' });
        return;
      }
      
      // Update the pattern
      const updatedPattern = await prisma.recurringReservationPattern.update({
        where: { reservationId },
        data: {
          frequency: frequency !== undefined ? frequency : undefined,
          daysOfWeek: daysOfWeek !== undefined ? daysOfWeek : undefined,
          interval: interval !== undefined ? interval : undefined,
          endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
          occurrenceLimit: occurrenceLimit !== undefined ? occurrenceLimit : undefined
        }
      });
      
      res.status(200).json(updatedPattern);
    } catch (error) {
      handleError(error, req, res);
    }
  },
  
  /**
   * Delete a recurring pattern
   */
  deleteRecurringPattern: async (req: Request, res: Response): Promise<void> => {
    try {
      const { reservationId } = req.params;
      
      // Check if pattern exists
      const existingPattern = await prisma.recurringReservationPattern.findUnique({
        where: { reservationId }
      });
      
      if (!existingPattern) {
        res.status(404).json({ message: 'Recurring pattern not found' });
        return;
      }
      
      // Delete the pattern
      await prisma.recurringReservationPattern.delete({
        where: { reservationId }
      });
      
      // Update the reservation to mark it as non-recurring
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { isRecurring: false }
      });
      
      res.status(200).json({ message: 'Recurring pattern deleted successfully' });
    } catch (error) {
      handleError(error, req, res);
    }
  },
  
  /**
   * Generate instances of recurring reservations
   * Creates actual reservation records based on the recurring pattern
   */
  generateRecurringInstances: async (req: Request, res: Response): Promise<void> => {
    try {
      const { reservationId } = req.params;
      const { previewOnly, maxInstances } = req.query;
      
      // Check if reservation and pattern exist
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          recurringPatternDetails: true
        }
      });
      
      if (!reservation) {
        res.status(404).json({ message: 'Reservation not found' });
        return;
      }
      
      if (!reservation.recurringPatternDetails) {
        res.status(404).json({ message: 'No recurring pattern found for this reservation' });
        return;
      }
      
      const pattern = reservation.recurringPatternDetails;
      const startDate = new Date(reservation.startDate);
      const baseEndDate = new Date(reservation.endDate);
      const duration = baseEndDate.getTime() - startDate.getTime(); // Duration in milliseconds
      
      // Determine end of recurrence
      let recurrenceEndDate: Date | null = null;
      if (pattern.endDate) {
        recurrenceEndDate = new Date(pattern.endDate);
      } else if (pattern.occurrenceLimit) {
        // If there's an occurrence limit but no end date, we'll calculate dates
        // to determine the projected end date, but we don't need to set it here
      }
      
      const instances: any[] = [];
      let currentDate = new Date(startDate);
      let count = 0;
      const maxToGenerate = Number(maxInstances) || (pattern.occurrenceLimit || 20); // Default to 20 if no limit
      
      // Calculate recurring instances based on frequency
      while (count < maxToGenerate) {
        if (pattern.frequency === 'DAILY') {
          // Skip the first instance as it's the original reservation
          if (count > 0) {
            const newStartDate = new Date(currentDate);
            newStartDate.setDate(newStartDate.getDate() + (pattern.interval || 1));
            
            if (recurrenceEndDate && newStartDate > recurrenceEndDate) {
              break;
            }
            
            const newEndDate = new Date(newStartDate.getTime() + duration);
            
            instances.push({
              startDate: newStartDate,
              endDate: newEndDate
            });
            
            currentDate = newStartDate;
          }
        } 
        else if (pattern.frequency === 'WEEKLY') {
          // For weekly, we need to consider specific days of the week
          if (count > 0 || pattern.daysOfWeek.length > 1) {
            // If it's the first instance but we have multiple days of week,
            // we need to find the next occurrences in the same week
            const daysToProcess = count === 0 ? 
              pattern.daysOfWeek.filter(d => d !== startDate.getDay()) : 
              pattern.daysOfWeek;
              
            for (const dayOfWeek of daysToProcess) {
              // Calculate days to add to get to the desired day of week
              let daysToAdd = (dayOfWeek - currentDate.getDay() + 7) % 7;
              
              // If we're in the first week and the day is before the start day, 
              // add 7 days to move to next week
              if (count === 0 && daysToAdd === 0) {
                daysToAdd = 7 * (pattern.interval || 1);
              } else if (count > 0 && dayOfWeek === pattern.daysOfWeek[0]) {
                // If we're processing the first day of the pattern in subsequent weeks,
                // add the interval
                daysToAdd += 7 * (pattern.interval - 1 || 0);
              }
              
              const newStartDate = new Date(currentDate);
              newStartDate.setDate(newStartDate.getDate() + daysToAdd);
              
              if (recurrenceEndDate && newStartDate > recurrenceEndDate) {
                continue; // Skip this day if beyond end date
              }
              
              const newEndDate = new Date(newStartDate.getTime() + duration);
              
              instances.push({
                startDate: newStartDate,
                endDate: newEndDate
              });
              
              // If this is the last day of the week in our pattern,
              // update the current date for the next iteration
              if (dayOfWeek === pattern.daysOfWeek[pattern.daysOfWeek.length - 1]) {
                currentDate = newStartDate;
              }
            }
          }
        } 
        else if (pattern.frequency === 'MONTHLY') {
          // Skip the first instance as it's the original reservation
          if (count > 0) {
            const newStartDate = new Date(currentDate);
            newStartDate.setMonth(newStartDate.getMonth() + (pattern.interval || 1));
            
            if (recurrenceEndDate && newStartDate > recurrenceEndDate) {
              break;
            }
            
            const newEndDate = new Date(newStartDate.getTime() + duration);
            
            instances.push({
              startDate: newStartDate,
              endDate: newEndDate
            });
            
            currentDate = newStartDate;
          }
        }
        
        // Increment counter - for weekly with multiple days, we already added multiple instances
        if (pattern.frequency !== 'WEEKLY' || pattern.daysOfWeek.length <= 1 || count > 0) {
          count++;
        } else {
          // For the first weekly instance with multiple days, count it as one occurrence
          count++;
        }
        
        // If no instances were added in this iteration, break to avoid infinite loop
        if (instances.length === 0 && count > 0) {
          break;
        }
      }
      
      // If preview only, return the calculated instances without creating them
      if (previewOnly === 'true') {
        res.status(200).json(instances);
        return;
      }
      
      // Otherwise, create the reservation instances in the database
      const createdInstances = [];
      
      for (const instance of instances) {
        // Create a new reservation based on the original one
        const newReservation = await prisma.reservation.create({
          data: {
            startDate: instance.startDate,
            endDate: instance.endDate,
            status: 'PENDING',
            isRecurring: true,
            customerId: reservation.customerId,
            petId: reservation.petId,
            serviceId: reservation.serviceId,
            resourceId: reservation.resourceId,
            notes: reservation.notes,
            staffNotes: `Auto-generated from recurring reservation ${reservation.id}`,
            lodgingPreference: reservation.lodgingPreference
          }
        });
        
        createdInstances.push(newReservation);
      }
      
      res.status(201).json(createdInstances);
    } catch (error) {
      handleError(error, req, res);
    }
  }
};
