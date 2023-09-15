"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const models = [
      {
        modelId: "Composed_v45",
        modelDescription: "Composed 45 DT v4",
        appVersion: new Date('2022-08-31'),
        extractorName: "Delivery Ticket",
        extractorDescription: "Extract delivery and material data from photographs, PDFs, scanned images",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: "prebuilt-receipt",
        modelDescription: "Extract key information from receipts.",
        appVersion: new Date('2022-08-31'),
        extractorName: "Receipts",
        extractorDescription: "Extract information from thousands of receipts including purchase, costs and date",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: "prebuilt-invoice",
        modelDescription: "Extract key information from invoices.",
        appVersion: new Date('2022-08-31'),
        extractorName: "Invoices",
        extractorDescription: "Extract key information from hundreds of invoices in minutes enabling faster spending analytics",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: "prebuilt-invoice",
        modelDescription: "Extract key information from invoices.",
        appVersion: new Date('2022-08-31'),
        extractorName: "Purchase Orders",
        extractorDescription: "Extract information from Purchase Orders such as materials, costs, services, dates among key financial data",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: "prebuilt-idDocument",
        modelDescription: "Extract key information from passports and ID cards.",
        appVersion: new Date('2022-08-31'),
        extractorName: "Drivers License",
        extractorDescription: "Extract driver licnese information such as name, licensex number, expiry date among other regulatory information needed",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: "prebuilt-layout",
        modelDescription: "Extract text and layout information from documents.",
        appVersion: new Date('2022-08-31'),
        extractorName: "Contract",
        extractorDescription: "Extract names, references, titles among other data from thousands of contracts within minutes",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const newModels = [];
    for(let i = 0; i < models.length; i ++) {
      const extractorName = await queryInterface.rawSelect(
        "extractModel",
        {
          where: {
            extractorName: models[i].extractorName,
          },
        },
        ["extractorName"]
      );
      if(!extractorName) {
        newModels.push(models[i])
      }
    }
    if(newModels.length) {
      await queryInterface.bulkInsert(
        "extractModel",
        newModels,
        {}
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("extractModel", null, {});
  },
};
