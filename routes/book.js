import express from 'express';
import { addBook, getAllBooks } from '../controllers/bookController.js';
import { authenticateUser, authorizeLibrarian } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateUser, authorizeLibrarian, addBook);
router.get('/', authenticateUser, getAllBooks);

export default router;

