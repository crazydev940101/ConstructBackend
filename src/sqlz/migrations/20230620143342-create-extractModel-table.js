'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('extractModel', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      modelId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      modelDescription: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      appVersion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      extractorName: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      extractorDescription: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('extractModel');
  }
};
