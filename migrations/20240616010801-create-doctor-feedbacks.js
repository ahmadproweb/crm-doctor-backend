"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("DoctorFeedbacks", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      idDoctor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Doctors", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      idFeedback: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Feedbacks", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
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
