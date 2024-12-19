import express from 'express';
import { borrowBook } from '../controllers/borrowingController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/:book_id/borrow', authenticateUser, borrowBook);

export default router;

