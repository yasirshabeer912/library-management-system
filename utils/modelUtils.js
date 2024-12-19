import * as MySQLModels from '../models/mysql/index.js';
import * as MongoDBModels from '../models/mongodb/index.js';

export const getModel = (modelName) => {
  if (process.env.DB_TYPE === 'MySQL') {
    if (MySQLModels[modelName]) {
      return MySQLModels[modelName];
    } else {
      throw new Error(`MySQL model '${modelName}' not found.`);
    }
  } else if (process.env.DB_TYPE === 'MongoDB') {
    if (MongoDBModels[modelName]) {
      return MongoDBModels[modelName];
    } else {
      throw new Error(`MongoDB model '${modelName}' not found.`);
    }
  } else {
    throw new Error('Invalid database type');
  }
};
