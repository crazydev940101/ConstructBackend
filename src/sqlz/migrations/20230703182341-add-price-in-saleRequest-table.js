"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    // unit is a pence
    return queryInterface.addColumn("saleRequest", "price", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("saleRequest", "price");
  },
};
