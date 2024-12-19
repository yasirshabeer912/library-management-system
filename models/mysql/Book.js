import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';
import LibraryBranch from './LibraryBranch.js';

const Book = sequelize.define('Book', {
  book_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  ISBN: {
    type: DataTypes.STRING(13),
    allowNull: false,
  },
  publication_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
});

Book.belongsTo(LibraryBranch, { foreignKey: 'branch_id', as: 'branch' });


export default Book;

