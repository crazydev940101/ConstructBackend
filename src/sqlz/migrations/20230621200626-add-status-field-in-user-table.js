'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user', 'status', {
      type: Sequelize.ENUM('pending', 'active', 'declined'),
      defaultValue: 'active',
      allowNull: false,
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user', 'status');
  }
};