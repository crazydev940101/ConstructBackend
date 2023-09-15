"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("openaiPrompt", "chatCompletionRequestMessages", {
      type: Sequelize.JSON,
      allowNull: true
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("openaiPrompt", "chatCompletionRequestMessages");
  },
};
