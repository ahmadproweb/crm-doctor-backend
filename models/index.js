const { Sequelize } = require("sequelize");
const Patients = require("./patient");
const DoctorModel = require("./doctor");
const AdminModel = require("./admin");
const AppointmentModel = require("./appointment");
const MedicalRecordModel = require("./medicalRecord"); // ✅ ADD

const FeedbackModel = require("./feedback");
const DoctorFeedbackModel = require("./doctorFeedback");
const ServiceModel = require("./service");
const DoctorServiceModel = require("./doctorService");
const AnalysisModel = require("./analysis");

require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Doctor = DoctorModel(sequelize, Sequelize);
db.Feedback = FeedbackModel(sequelize, Sequelize);
db.DoctorFeedback = DoctorFeedbackModel(sequelize, Sequelize);
db.Service = ServiceModel(sequelize, Sequelize);
db.DoctorService = DoctorServiceModel(sequelize, Sequelize);
db.Patients = Patients(sequelize, Sequelize);
db.Admin = AdminModel(sequelize, Sequelize);
db.Appointment = AppointmentModel(sequelize, Sequelize);
db.MedicalRecord = MedicalRecordModel(sequelize, Sequelize); 
db.Analysis = AnalysisModel(sequelize, Sequelize); 

// Associations
db.Patients.hasMany(db.Feedback, { foreignKey: "idPatient" });
db.Feedback.belongsTo(db.Patients, { foreignKey: "idPatient" });

db.Doctor.hasMany(db.DoctorFeedback, { foreignKey: "idDoctor" });
db.DoctorFeedback.belongsTo(db.Doctor, { foreignKey: "idDoctor" });

db.Feedback.hasOne(db.DoctorFeedback, { foreignKey: "idFeedback" });
db.DoctorFeedback.belongsTo(db.Feedback, { foreignKey: "idFeedback" });

db.Doctor.hasMany(db.DoctorService, { foreignKey: "idDoctor" });
db.Service.hasMany(db.DoctorService, { foreignKey: "idService" });
db.DoctorService.belongsTo(db.Doctor, { foreignKey: "idDoctor" });
db.DoctorService.belongsTo(db.Service, { foreignKey: "idService" });

db.Appointment.belongsTo(db.Patients, { foreignKey: "idPatient" });
db.Appointment.belongsTo(db.Doctor, { foreignKey: "idDoctor" });


db.Appointment.hasOne(db.MedicalRecord, { foreignKey: "idAppointment" });
db.MedicalRecord.belongsTo(db.Appointment, { foreignKey: "idAppointment" });

db.Patients.hasMany(db.Analysis, { foreignKey: "idPatient" });
db.Analysis.belongsTo(db.Patients, { foreignKey: "idPatient" });

module.exports = db;
