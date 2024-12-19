import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const Author = sequelize.define('Author', {
  author_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  biography: {
    type: DataTypes.TEXT,
  },
  nationality: {
    type: DataTypes.STRING(50),
  },
});

Author.belongsTo(Author, { as: 'Mentor', foreignKey: 'mentor_id' });

export default Author;

