module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    name: DataTypes.STRING,
    fee: DataTypes.INTEGER,
  });

  return Service;
};
