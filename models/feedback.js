module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idPatient: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Feedback.associate = (models) => {
    Feedback.belongsTo(models.Patient, { foreignKey: 'idPatient' });
    Feedback.hasOne(models.DoctorFeedback, { foreignKey: 'idFeedback' });
  };
  

  return Feedback;
};
