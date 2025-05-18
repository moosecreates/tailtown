import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from '../middleware/error.middleware';

const prisma = new PrismaClient();

/**
 * Pet Feeding Preferences Controller
 * Handles CRUD operations for pet feeding preferences
 */
export const petFeedingController = {
  /**
   * Get feeding preferences for a pet
   */
  getFeedingPreferences: async (req: Request, res: Response): Promise<void> => {
    try {
      const { petId } = req.params;
      
      const feedingPreferences = await prisma.petFeedingPreference.findMany({
        where: { petId }
      });
      
      res.status(200).json(feedingPreferences);
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
    }
  },
  
  /**
   * Get feeding preference by ID
   */
  getFeedingPreferenceById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const feedingPreference = await prisma.petFeedingPreference.findUnique({
        where: { id }
      });
      
      if (!feedingPreference) {
        res.status(404).json({ message: 'Feeding preference not found' });
        return;
      }
      
      res.status(200).json(feedingPreference);
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
    }
  },
  
  /**
   * Create a new feeding preference
   */
  createFeedingPreference: async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        petId, 
        reservationId, 
        feedingSchedule, 
        foodType, 
        foodAmount, 
        specialInstructions, 
        foodAddIns, 
        probioticNeeded, 
        probioticDetails 
      } = req.body;
      
      // Validate required fields
      if (!petId || !feedingSchedule) {
        res.status(400).json({ message: 'Pet ID and feeding schedule are required' });
        return;
      }
      
      // Create new feeding preference
      const newFeedingPreference = await prisma.petFeedingPreference.create({
        data: {
          petId,
          reservationId,
          feedingSchedule,
          foodType,
          foodAmount,
          specialInstructions,
          foodAddIns: foodAddIns || [],
          probioticNeeded: probioticNeeded || false,
          probioticDetails: probioticDetails || null
        }
      });
      
      res.status(201).json(newFeedingPreference);
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
    }
  },
  
  /**
   * Update an existing feeding preference
   */
  updateFeedingPreference: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { 
        feedingSchedule, 
        foodType, 
        foodAmount, 
        specialInstructions, 
        foodAddIns, 
        probioticNeeded, 
        probioticDetails 
      } = req.body;
      
      // Check if feeding preference exists
      const existingPreference = await prisma.petFeedingPreference.findUnique({
        where: { id }
      });
      
      if (!existingPreference) {
        res.status(404).json({ message: 'Feeding preference not found' });
        return;
      }
      
      // Update the feeding preference
      const updatedPreference = await prisma.petFeedingPreference.update({
        where: { id },
        data: {
          feedingSchedule: feedingSchedule !== undefined ? feedingSchedule : undefined,
          foodType: foodType !== undefined ? foodType : undefined,
          foodAmount: foodAmount !== undefined ? foodAmount : undefined,
          specialInstructions: specialInstructions !== undefined ? specialInstructions : undefined,
          foodAddIns: foodAddIns !== undefined ? foodAddIns : undefined,
          probioticNeeded: probioticNeeded !== undefined ? probioticNeeded : undefined,
          probioticDetails: probioticDetails !== undefined ? probioticDetails : undefined
        }
      });
      
      res.status(200).json(updatedPreference);
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
    }
  },
  
  /**
   * Delete a feeding preference
   */
  deleteFeedingPreference: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Check if feeding preference exists
      const existingPreference = await prisma.petFeedingPreference.findUnique({
        where: { id }
      });
      
      if (!existingPreference) {
        res.status(404).json({ message: 'Feeding preference not found' });
        return;
      }
      
      // Delete the feeding preference
      await prisma.petFeedingPreference.delete({
        where: { id }
      });
      
      res.status(200).json({ message: 'Feeding preference deleted successfully' });
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
    }
  }
};

/**
 * Pet Medications Controller
 * Handles CRUD operations for pet medications
 */
export const petMedicationController = {
  /**
   * Get medications for a pet
   */
  getMedications: async (req: Request, res: Response): Promise<void> => {
    try {
      const { petId } = req.params;
      
      const medications = await prisma.petMedication.findMany({
        where: { petId }
      });
      
      res.status(200).json(medications);
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
    }
  },
  
  /**
   * Get medication by ID
   */
  getMedicationById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const medication = await prisma.petMedication.findUnique({
        where: { id }
      });
      
      if (!medication) {
        res.status(404).json({ message: 'Medication not found' });
        return;
      }
      
      res.status(200).json(medication);
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
    }
  },
  
  /**
   * Create a new medication
   */
  createMedication: async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        petId, 
        reservationId, 
        name, 
        dosage, 
        frequency, 
        timingSchedule, 
        administrationMethod, 
        specialInstructions, 
        startDate, 
        endDate, 
        isActive 
      } = req.body;
      
      // Validate required fields
      if (!petId || !name || !dosage || !frequency || !timingSchedule) {
        res.status(400).json({ 
          message: 'Pet ID, medication name, dosage, frequency, and timing schedule are required' 
        });
        return;
      }
      
      // Create new medication
      const newMedication = await prisma.petMedication.create({
        data: {
          petId,
          reservationId,
          name,
          dosage,
          frequency,
          timingSchedule,
          administrationMethod,
          specialInstructions,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          isActive: isActive !== undefined ? isActive : true
        }
      });
      
      res.status(201).json(newMedication);
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
    }
  },
  
  /**
   * Update an existing medication
   */
  updateMedication: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { 
        name, 
        dosage, 
        frequency, 
        timingSchedule, 
        administrationMethod, 
        specialInstructions, 
        startDate, 
        endDate, 
        isActive 
      } = req.body;
      
      // Check if medication exists
      const existingMedication = await prisma.petMedication.findUnique({
        where: { id }
      });
      
      if (!existingMedication) {
        res.status(404).json({ message: 'Medication not found' });
        return;
      }
      
      // Update the medication
      const updatedMedication = await prisma.petMedication.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          dosage: dosage !== undefined ? dosage : undefined,
          frequency: frequency !== undefined ? frequency : undefined,
          timingSchedule: timingSchedule !== undefined ? timingSchedule : undefined,
          administrationMethod: administrationMethod !== undefined ? administrationMethod : undefined,
          specialInstructions: specialInstructions !== undefined ? specialInstructions : undefined,
          startDate: startDate !== undefined ? new Date(startDate) : undefined,
          endDate: endDate !== undefined ? new Date(endDate) : undefined,
          isActive: isActive !== undefined ? isActive : undefined
        }
      });
      
      res.status(200).json(updatedMedication);
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
    }
  },
  
  /**
   * Delete a medication
   */
  deleteMedication: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Check if medication exists
      const existingMedication = await prisma.petMedication.findUnique({
        where: { id }
      });
      
      if (!existingMedication) {
        res.status(404).json({ message: 'Medication not found' });
        return;
      }
      
      // Delete the medication
      await prisma.petMedication.delete({
        where: { id }
      });
      
      res.status(200).json({ message: 'Medication deleted successfully' });
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
    }
  },

  /**
   * Get active medications for a pet on a specific date
   */
  getActiveMedicationsForDate: async (req: Request, res: Response): Promise<void> => {
    try {
      const { petId } = req.params;
      const { date } = req.query;
      
      if (!date || typeof date !== 'string') {
        res.status(400).json({ message: 'Date is required as a query parameter' });
        return;
      }
      
      const targetDate = new Date(date);
      
      // Get medications that are active on the target date
      const medications = await prisma.petMedication.findMany({
        where: {
          petId,
          isActive: true,
          AND: [
            {
              OR: [
                { startDate: null },
                { startDate: { lte: targetDate } }
              ]
            },
            {
              OR: [
                { endDate: null },
                { endDate: { gte: targetDate } }
              ]
            }
          ]
        }
      });
      
      res.status(200).json(medications);
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
    }
  }
};
