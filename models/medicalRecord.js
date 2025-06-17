// models/medicalRecord.js
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "MedicalRecord",
    {
      idAppointment: DataTypes.INTEGER,
      diagnosis    : DataTypes.TEXT,
      doctorNotes  : DataTypes.TEXT,
      medications  : DataTypes.TEXT,
    },
    {
      tableName: "MedicalRecords", // 👈 force plural
      freezeTableName: true,
    }
  );
