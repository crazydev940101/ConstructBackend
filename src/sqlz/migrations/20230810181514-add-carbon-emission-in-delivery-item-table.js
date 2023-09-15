"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("deliveryItem", "ceFactor", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("deliveryItem", "ceFactor");
  },
};
