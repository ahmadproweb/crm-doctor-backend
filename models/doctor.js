module.exports = (sequelize, DataTypes) => {
    const Doctor = sequelize.define('Doctor', {
        fullName: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, unique: true, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        speciality: DataTypes.STRING,
        experience: DataTypes.STRING,
        about: DataTypes.TEXT,
        image: DataTypes.STRING,
       scheduleDate: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      scheduleTime: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    });
    return Doctor;
};