import express from 'express';
import { deleteUser, getAllUsers, getUserById, seedUsers, updateUser } from '../controllers/userController.js';
import { authenticateUser, authorizeLibrarian } from '../middleware/auth.js';

const router = express.Router();

router.post('/seed', seedUsers);
router.get('/', authenticateUser, authorizeLibrarian,getAllUsers);
router.get('/:id', authenticateUser,getUserById);
router.put('/:id', authenticateUser,updateUser);
router.delete('/:id', authenticateUser, authorizeLibrarian,deleteUser);
export default router;

