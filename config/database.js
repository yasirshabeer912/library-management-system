import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};


const sequelize = new Sequelize(mysqlConfig.database, mysqlConfig.user, mysqlConfig.password, {
  host: mysqlConfig.host,
  dialect: 'mysql',
});

const mongoConfig = {
  url: process.env.MONGODB_URL,
};
const connectMongoDB = async () => {
  const mongoUri = process.env.MONGODB_URL; // Access the environment variable
  if (!mongoUri) {
    throw new Error('MONGODB_URL is not defined in environment variables.');
  }
  try {

    await mongoose.connect(mongoConfig.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
 const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('MySQL connected and models synchronized');
  } catch (error) {
    console.error('Unable to connect to MySQL:', error);
  }
};
export { sequelize, connectMongoDB,connectMySQL}

