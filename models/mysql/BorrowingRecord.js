// In your BorrowingRecord.js model
import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';
import User from './User.js';
import Book from './Book.js';

const BorrowingRecord = sequelize.define('BorrowingRecord', {
  borrow_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  return_date: {
    type: DataTypes.DATE,
  },
  user_id: {  // Add these foreign key fields explicitly
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  book_id: {  // Add these foreign key fields explicitly
    type: DataTypes.INTEGER,
    references: {
      model: Book,
      key: 'book_id'
    }
  }
});

// Define the associations directly on BorrowingRecord
BorrowingRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
BorrowingRecord.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

// The many-to-many relationships can still exist
User.belongsToMany(Book, {
  through: BorrowingRecord,
  foreignKey: 'user_id',
  otherKey: 'book_id'
});

Book.belongsToMany(User, {
  through: BorrowingRecord,
  foreignKey: 'book_id',
  otherKey: 'user_id'
});

export default BorrowingRecord;