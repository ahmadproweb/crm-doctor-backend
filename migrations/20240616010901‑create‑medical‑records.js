"use strict";
module.exports = {
  up: async (qi, S) => {
    await qi.createTable("MedicalRecords", {
      id:            { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      idAppointment: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "Appointments", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      diagnosis:    S.TEXT,
      doctorNotes:  S.TEXT,
      medications:  S.TEXT,
      createdAt:    { type: S.DATE, defaultValue: S.literal("NOW()"), allowNull: false },
      updatedAt:    { type: S.DATE, defaultValue: S.literal("NOW()"), allowNull: false },
    });
  },
  down: (qi) => qi.dropTable("MedicalRecords"),
};
