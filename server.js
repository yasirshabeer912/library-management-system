import express from 'express';
import dotenv from 'dotenv';
import { connectMongoDB, connectMySQL, sequelize } from './config/database.js';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/book.js';
import borrowingRoutes from './routes/borrowing.js';
import authorsRoutes from './routes/authors.js';
import shelvesRoutes from './routes/shelves.js';
import branchesRoutes from './routes/branches.js';
import seedRoutes from './routes/seed.js';
import seedUsers from './routes/user.js';
import { migrateData } from './utils/databaseUtils.js';
import {  migrateFromMongoToMysql } from './utils/migratev.js';
import { migrateMySQLToMongo } from './utils/migrateToMongo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowing', borrowingRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/users', seedUsers);
app.use('/api/authors', authorsRoutes);
app.use('/api/shelves', shelvesRoutes);
app.use('/api/branches', branchesRoutes);
app.post('/migrate-data', migrateMySQLToMongo);
app.post('/migrate-mongo', migrateFromMongoToMysql);



const startServer = async () => {
  try {
    if (process.env.DB_TYPE === 'MySQL') {
      await connectMySQL();
    } else if (process.env.DB_TYPE === 'MongoDB') {
      await connectMongoDB();
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
  }
};

startServer();

