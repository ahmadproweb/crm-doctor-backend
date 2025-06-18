module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Analysis",
    {
      analysisName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      idPatient: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pdfPath: {              // 👈 image ki jagah ab hamesha PDF ka URL
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { freezeTableName: true }
  );
};
