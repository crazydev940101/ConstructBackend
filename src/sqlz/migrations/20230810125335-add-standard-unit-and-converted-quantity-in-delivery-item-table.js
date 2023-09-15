"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("deliveryItem", "standardUnit", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("deliveryItem", "convertedQuantity", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    return queryInterface;
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("deliveryItem", "standardUnit");
    await queryInterface.removeColumn("deliveryItem", "convertedQuantity");
    return queryInterface;
  },
};
