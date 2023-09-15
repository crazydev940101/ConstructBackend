"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [
      {
        firstname: "Airdoc",
        lastname: "Pro",
        jobTitle: "Admin",
        role: "systemAdmin",
        email: "admin@hypervine.io",
        password: require("bcrypt").hashSync("1234", 11),
        companyId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "Paul",
        lastname: "Duddy",
        jobTitle: "Paul Job",
        role: "superAdmin",
        email: "paul@hypervine.io",
        password: require("bcrypt").hashSync("1234", 11),
        companyId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "Vincent",
        lastname: "Chai",
        jobTitle: "Vincent Job",
        role: "superAdmin",
        email: "vincent@hypervine.io",
        password: require("bcrypt").hashSync("1234", 11),
        companyId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "Andrei",
        lastname: "Shen",
        jobTitle: "Andrei Job",
        role: "superAdmin",
        email: "andrei@hypervine.io",
        password: require("bcrypt").hashSync("1234", 11),
        companyId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const newUsers = [];
    for(let i = 0; i < users.length; i ++) {
      const email = await queryInterface.rawSelect(
        "user",
        {
          where: {
            email: users[i].email,
          },
        },
        ["email"]
      );
      if(!email) {
        newUsers.push(users[i])
      }
    }
    if(newUsers.length) {
      await queryInterface.bulkInsert(
        "user",
        newUsers,
        {}
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("user", null, {});
  },
};
