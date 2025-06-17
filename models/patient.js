// models/patient.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Patient",
    {
      fullName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      phone: DataTypes.STRING,
      gender: DataTypes.STRING,
      birthday: DataTypes.DATEONLY,
      image: DataTypes.STRING,
    },
    { freezeTableName: true }
  );
};
