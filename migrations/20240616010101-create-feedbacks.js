"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Feedbacks", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      message: { type: Sequelize.TEXT, allowNull: false },
      stars: { type: Sequelize.INTEGER, allowNull: false },
      idPatient: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()")
      }
    });
  },
  
};
