"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return require('sequelize-replace-enum-postgres').default({
      queryInterface,
      tableName: 'saleRequest',
      columnName: 'status',
      defaultValue: 'submitted',
      newValues: ["submitted", "pending", "completed", "declined"],
      enumName: 'enum_saleRequest_status'
    })
  },
  down: async (queryInterface, Sequelize) => {
    return require('sequelize-replace-enum-postgres').default({
      queryInterface,
      tableName: 'saleRequest',
      columnName: 'status',
      defaultValue: 'pending',
      newValues: ["pending", "completed", "declined"],
      enumName: 'enum_saleRequest_status'
    })
  },
};
