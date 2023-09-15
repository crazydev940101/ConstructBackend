"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("company", "longId", {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      defaultValue: Sequelize.UUIDV4,
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("company", "longId");
  },
};
