module.exports = (sequelize, DataTypes) => {
  const DoctorFeedback = sequelize.define('DoctorFeedback', {
    idDoctor: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idFeedback: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  DoctorFeedback.associate = (models) => {
    DoctorFeedback.belongsTo(models.Doctor, { foreignKey: 'idDoctor' });
    DoctorFeedback.belongsTo(models.Feedback, { foreignKey: 'idFeedback' });
  };

  return DoctorFeedback;
};
