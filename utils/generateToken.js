const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });  
};

const generateTokenAdmin = (admin) => {
  return generateToken({ id: admin.id, email: admin.email, role: "admin" });
};

const generateTokenDoctor = (doctor) => {
  return generateToken({ id: doctor.id, email: doctor.email, role: "doctor" });
};

module.exports = { generateTokenAdmin , generateTokenDoctor };
