import { Router } from 'express';
import { 
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getPetReservations
} from '../controllers/pet.controller';

const router = Router();

// GET all pets
router.get('/', getAllPets);

// GET a single pet by ID
router.get('/:id', getPetById);

// GET all reservations for a pet
router.get('/:id/reservations', getPetReservations);

// POST create a new pet
router.post('/', createPet);

// PUT update a pet
router.put('/:id', updatePet);

// DELETE a pet
router.delete('/:id', deletePet);

export { router as petRoutes };
