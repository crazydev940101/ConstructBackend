"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("openaiPromptKey", "openaiModel", {
      type: Sequelize.ENUM('text-davinci-003', 'gpt-3.5-turbo'),
      allowNull: false,
      defaultValue: 'text-davinci-003'
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("openaiPromptKey", "openaiModel");
  },
};
