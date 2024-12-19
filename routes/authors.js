import express from 'express';
import { authenticateUser, authorizeLibrarian } from '../middleware/auth.js';
import { createAuthor, deleteAuthor, getAllAuthors, getAuthorById, updateAuthor } from '../controllers/authorController.js';

const router = express.Router();

router.get('/', getAllAuthors);
router.get('/:id', getAuthorById);
router.post('/', authenticateUser, authorizeLibrarian, createAuthor);
router.put('/:id', authenticateUser, authorizeLibrarian, updateAuthor);
router.delete('/:id', authenticateUser, authorizeLibrarian, deleteAuthor);
export default router;

