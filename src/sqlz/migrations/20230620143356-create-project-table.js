'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('project', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      extractorId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'extractModel'
          },
          key: 'id'
        },
        allowNull: false
      },
      projectName: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      projectId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      projectLocation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: "company",
          },
          key: "id",
        },
      },
      isExtracting: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      extractedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
    return queryInterface.dropTable('project');
  }
};
