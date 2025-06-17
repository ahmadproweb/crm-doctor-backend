const { Sequelize } = require("sequelize");
const PatientModel        = require("./patient");
const DoctorModel         = require("./doctor");
const AdminModel          = require("./admin");
const AppointmentModel    = require("./appointment");
const MedicalRecordModel  = require("./medicalRecord");
const FeedbackModel       = require("./feedback");
const DoctorFeedbackModel = require("./doctorFeedback");
const ServiceModel        = require("./service");
const DoctorServiceModel  = require("./doctorService");
const AnalysisModel       = require("./analysis");

require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host   : process.env.DB_HOST,
    port   : process.env.DB_PORT,
    dialect: "postgres",
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.Doctor         = DoctorModel(sequelize, Sequelize);
db.Feedback       = FeedbackModel(sequelize, Sequelize);
db.DoctorFeedback = DoctorFeedbackModel(sequelize, Sequelize);
db.Service        = ServiceModel(sequelize, Sequelize);
db.DoctorService  = DoctorServiceModel(sequelize, Sequelize);
db.Patient        = PatientModel(sequelize, Sequelize);
db.Admin          = AdminModel(sequelize, Sequelize);
db.Appointment    = AppointmentModel(sequelize, Sequelize);
db.MedicalRecord  = MedicalRecordModel(sequelize, Sequelize);
db.Analysis       = AnalysisModel(sequelize, Sequelize);

// ─────────────────── Associations ───────────────────

// Patient ↔ Feedback
db.Patient.hasMany(db.Feedback, { foreignKey: "idPatient" });
db.Feedback.belongsTo(db.Patient, { foreignKey: "idPatient" });

// Doctor ↔ DoctorFeedback (1:M) + aliases
db.Doctor.hasMany(db.DoctorFeedback, { foreignKey: "idDoctor", as: "doctorFeedbacks" });
db.DoctorFeedback.belongsTo(db.Doctor, { foreignKey: "idDoctor", as: "doctor" });
db.Feedback.hasOne(db.DoctorFeedback, { foreignKey: "idFeedback", as: "feedbackJoin" });
db.DoctorFeedback.belongsTo(db.Feedback, { foreignKey: "idFeedback", as: "feedback" });

// Doctor ↔ Feedback (M:N) through DoctorFeedback
db.Doctor.belongsToMany(db.Feedback, {
  through    : db.DoctorFeedback,
  foreignKey : "idDoctor",
  otherKey   : "idFeedback",
});
db.Feedback.belongsToMany(db.Doctor, {
  through    : db.DoctorFeedback,
  foreignKey : "idFeedback",
  otherKey   : "idDoctor",
});

// Doctor ↔ Service (M:N) through DoctorService  ✅ NEW
db.Doctor.belongsToMany(db.Service, {
  through    : db.DoctorService,
  foreignKey : "idDoctor",
  otherKey   : "idService",
  as         : "services",
});
db.Service.belongsToMany(db.Doctor, {
  through    : db.DoctorService,
  foreignKey : "idService",
  otherKey   : "idDoctor",
});

// Appointment relations
db.Doctor.hasMany(db.Appointment,  { foreignKey: "idDoctor" });
db.Patient.hasMany(db.Appointment, { foreignKey: "idPatient" });
db.Appointment.belongsTo(db.Doctor,  { foreignKey: "idDoctor"  });
db.Appointment.belongsTo(db.Patient, { foreignKey: "idPatient" });
db.Service.hasMany(db.Appointment,   { foreignKey: "idService" });
db.Appointment.belongsTo(db.Service, { foreignKey: "idService" });

// MedicalRecord 1:1
db.Appointment.hasOne(db.MedicalRecord,   { foreignKey: "idAppointment" });
db.MedicalRecord.belongsTo(db.Appointment,{ foreignKey: "idAppointment" });

// Analysis 1:M
db.Patient.hasMany(db.Analysis, { foreignKey: "idPatient" });
db.Analysis.belongsTo(db.Patient,{ foreignKey: "idPatient" });

module.exports = db;
