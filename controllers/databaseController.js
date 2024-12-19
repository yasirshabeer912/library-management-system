import { switchDatabase, migrateData } from '../utils/databaseUtils.js';

export const switchDatabaseType = async (req, res) => {
  try {
    const { dbType } = req.body;
    const result = await switchDatabase(dbType);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error switching database', error: error.message });
  }
};

export const migrateDatabase = async (req, res) => {
  try {
    const result = await migrateData();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error migrating data', error: error.message });
  }
};

