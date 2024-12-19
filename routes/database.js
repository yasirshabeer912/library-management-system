import express from 'express';
import { switchDatabaseType, migrateDatabase } from '../controllers/databaseController.js';
import { authenticateUser, authorizeLibrarian } from '../middleware/auth.js';

const router = express.Router();

router.post('/switch', authenticateUser, authorizeLibrarian, switchDatabaseType);
router.post('/migrate', authenticateUser, authorizeLibrarian, migrateDatabase);

export default router;

