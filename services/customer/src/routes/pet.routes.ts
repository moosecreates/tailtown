import { Router } from 'express';
import { 
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getPetReservations,
  uploadPetPhoto,
  getPetsByCustomer,
  checkAllPets
} from '../controllers/pet.controller';

const router = Router();

// GET all pets
router.get('/', getAllPets);

// GET all pets for a customer
router.get('/customer/:customerId', getPetsByCustomer);

// GET a single pet by ID
router.get('/:id', getPetById);

// GET all reservations for a pet
router.get('/:id/reservations', getPetReservations);

// POST create a new pet
router.post('/', createPet);

// PUT update a pet
router.put('/:id', updatePet);

// POST upload a pet's photo
router.post('/:id/photo', uploadPetPhoto);

// DELETE a pet
router.delete('/:id', deletePet);

// GET check all pets from both models
router.get('/debug/check-all-pets', checkAllPets);

export { router as petRoutes };
