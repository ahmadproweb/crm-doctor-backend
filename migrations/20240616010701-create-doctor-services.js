"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("DoctorServices", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      idDoctor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Doctors", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      idService: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Services", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("DoctorServices");
  },
};
