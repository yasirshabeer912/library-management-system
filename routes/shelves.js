import express from 'express';
import { authenticateUser, authorizeLibrarian } from '../middleware/auth.js';
import { createShelf, deleteShelf, getAllShelves, getShelfById, updateShelf } from '../controllers/shelfController.js';

const router = express.Router();

router.get('/', getAllShelves);
router.get('/:id', getShelfById);
router.post('/', authenticateUser, authorizeLibrarian, createShelf);
router.put('/:id', authenticateUser, authorizeLibrarian, updateShelf);
router.delete('/:id', authenticateUser, authorizeLibrarian, deleteShelf);
export default router;

