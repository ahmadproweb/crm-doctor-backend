module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Analysis",
    {
      analysisName: DataTypes.STRING,
      idPatient: DataTypes.INTEGER,
      image: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );
};
