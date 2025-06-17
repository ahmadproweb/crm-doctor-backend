"use strict";
module.exports = {
  up: async (qi, S) => {
    await qi.createTable("Appointments", {
      id:          { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      idPatient:   { type: S.INTEGER, allowNull: false },
      idDoctor:    { type: S.INTEGER, allowNull: false },
      idService:   { type: S.INTEGER, allowNull: false },
      patientName: { type: S.STRING,  allowNull: false },
      doctorName:  { type: S.STRING,  allowNull: false },
      date:        { type: S.DATEONLY, allowNull: false },
      time:        { type: S.TIME,     allowNull: false },
      payment:     { type: S.ENUM("CASH", "CARD"), allowNull: false },
      status:      {
        type: S.ENUM("processing", "complete", "cancelled"),
        allowNull: false,
        defaultValue: "processing",
      },
      createdAt:   { type: S.DATE, defaultValue: S.literal("NOW()"), allowNull: false },
      updatedAt:   { type: S.DATE, defaultValue: S.literal("NOW()"), allowNull: false },
    });
  },
  down: (qi) => qi.dropTable("Appointments"),
};
