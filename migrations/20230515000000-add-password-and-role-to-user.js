'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'changeme'
    });

    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('user', 'librarian'),
      allowNull: false,
      defaultValue: 'user'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'password');
    await queryInterface.removeColumn('Users', 'role');
  }
};

