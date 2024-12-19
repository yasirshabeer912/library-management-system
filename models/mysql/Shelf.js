import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';
import LibraryBranch from './LibraryBranch.js';

const Shelf = sequelize.define('Shelf', {
  shelf_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  shelf_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
});

Shelf.belongsTo(LibraryBranch, { foreignKey: 'branch_id', as: 'branch' });

export default Shelf;

