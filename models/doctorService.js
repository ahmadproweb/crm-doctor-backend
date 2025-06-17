module.exports = (sequelize, DataTypes) => {
  const DoctorService = sequelize.define('DoctorService', {
    idDoctor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idService: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return DoctorService;
};