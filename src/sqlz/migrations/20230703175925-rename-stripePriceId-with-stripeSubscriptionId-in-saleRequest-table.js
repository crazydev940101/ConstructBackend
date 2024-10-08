"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('saleRequest', 'stripePriceId', 'stripeSubscriptionId');
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('saleRequest', 'stripeSubscriptionId', 'stripePriceId');
  },
};
