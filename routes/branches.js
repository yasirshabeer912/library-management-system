import express from 'express'
const router = express.Router();
import { createBranch, deleteBranch, getAllBranches, getBranchById, updateBranch } from '../controllers/branchController.js';
import { authenticateUser, authorizeLibrarian } from '../middleware/auth.js';

router.get('/', getAllBranches);
router.get('/:id', getBranchById);
router.post('/', authenticateUser, authorizeLibrarian, createBranch);
router.put('/:id', authenticateUser, authorizeLibrarian, updateBranch);
router.delete('/:id', authenticateUser, authorizeLibrarian, deleteBranch);

export default router;

