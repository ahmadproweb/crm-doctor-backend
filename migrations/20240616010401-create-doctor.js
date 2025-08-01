"use strict";
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable("Doctors", {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            fullName: { type: Sequelize.STRING, allowNull: false },
            email: { type: Sequelize.STRING, allowNull: false, unique: true },
            password: { type: Sequelize.STRING, allowNull: false },
            speciality: Sequelize.STRING,
            experience: Sequelize.STRING,
            about: Sequelize.TEXT,
            image: Sequelize.STRING,
            scheduleDate: { type: Sequelize.DATEONLY, allowNull: false },
            scheduleTime: { type: Sequelize.TIME, allowNull: false },
                  scheduleDate: { type: Sequelize.DATEONLY, allowNull: false, },
      scheduleTime: { type: Sequelize.TIME, allowNull: false, },
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
    down: async(queryInterface) => {
        await queryInterface.dropTable("Doctors");
    },
};