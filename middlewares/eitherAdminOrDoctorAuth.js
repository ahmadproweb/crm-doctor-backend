const jwt = require("jsonwebtoken");
const db = require("../models");
const Admin = db.Admin;
const Doctor = db.Doctor;

const eitherAdminOrDoctorAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized: Token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const doctor = await Doctor.findByPk(decoded.id);
    if (doctor) {
      req.doctor = doctor;
      return next();
    }

    const admin = await Admin.findByPk(decoded.id);
    if (admin) {
      req.admin = admin;
      return next();
    }

    return res.status(401).json({ message: "Invalid token: No user found" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { eitherAdminOrDoctorAuth };
