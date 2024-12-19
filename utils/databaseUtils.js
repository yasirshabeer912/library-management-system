import { sequelize } from '../config/database.js';
import mongoose from 'mongoose';
import * as MySQLModels from '../models/mysql/index.js';
import * as MongoDBModels from '../models/mongodb/index.js';

export const switchDatabase = async (newDbType) => {
  if (newDbType === process.env.DB_TYPE) {
    return { message: 'Already using this database' };
  }

  process.env.DB_TYPE = newDbType;

  if (newDbType === 'MySQL') {
    await sequelize.authenticate();
    console.log('Switched to MySQL');
    return { message: 'Switched to MySQL' };
  } else if (newDbType === 'MongoDB') {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Switched to MongoDB');
    return { message: 'Switched to MongoDB' };
  } else {
    throw new Error('Invalid database type');
  }
};

export const migrateData = async () => {
  if (process.env.DB_TYPE === 'MySQL') {
    // Migrate from MySQL to MongoDB
    for (const [modelName, MySQLModel] of Object.entries(MySQLModels)) {
      const MongoDBModel = MongoDBModels[modelName];
      const items = await MySQLModel.findAll();
      await MongoDBModel.insertMany(items.map(item => item.toJSON()));
    }
    return { message: 'Data migrated from MySQL to MongoDB' };
  } else if (process.env.DB_TYPE === 'MongoDB') {
    // Migrate from MongoDB to MySQL
    for (const [modelName, MongoDBModel] of Object.entries(MongoDBModels)) {
      const MySQLModel = MySQLModels[modelName];
      const items = await MongoDBModel.find();
      await MySQLModel.bulkCreate(items.map(item => item.toObject()));
    }
    return { message: 'Data migrated from MongoDB to MySQL' };
  } else {
    throw new Error('Invalid database type');
  }
};

