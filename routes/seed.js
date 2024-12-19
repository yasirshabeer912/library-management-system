import express from 'express';
import { seedData } from '../controllers/seedController.js';

const router = express.Router();

router.post('/', seedData);

export default router;

