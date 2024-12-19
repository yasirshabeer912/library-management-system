import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const LibraryBranch = sequelize.define('LibraryBranch', {
  branch_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  branch_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  contact_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
});

export default LibraryBranch;

