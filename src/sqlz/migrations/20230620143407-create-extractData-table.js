'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('extractData', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      projectId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'project'
          },
          key: 'id'
        },
        allowNull: false
      },
      blobName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      documentLink: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      documentName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      documentExtension: {
        type: Sequelize.STRING,
        allowNull: false, 
      },
      extractedData: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      extractedDate: {
        type: Sequelize.DATE,
        allowNull: true 
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
    return queryInterface.dropTable('extractData');
  }
};
