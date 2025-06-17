// models/appointment.js
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "Appointment",
    {                      // fields …
      idPatient: DataTypes.INTEGER,
      idDoctor : DataTypes.INTEGER,
      idService: DataTypes.INTEGER,
      patientName: DataTypes.STRING,
      doctorName : DataTypes.STRING,
      date:  DataTypes.DATEONLY,
      time:  DataTypes.TIME,
      payment: DataTypes.ENUM("CASH", "CARD"),
      status : DataTypes.ENUM("processing", "complete", "cancelled"),
    },
    {
      tableName: "Appointments",   // 👈 force plural table
      freezeTableName: true,
    }
  );
