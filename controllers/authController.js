const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Patient } = require("../models");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const existingPatient = await Patient.findOne({ where: { email } });
    if (existingPatient)
      return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const patient = await Patient.create({
      fullName,
      email,
      password: hashed,
    });

    const token = generateToken(patient.id);
    res.status(201).json({
      message: "Registered successfully",
      token,
      patient: { id: patient.id, fullName, email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const patient = await Patient.findOne({ where: { email } });
    if (!patient) return res.status(404).json({ error: "patient not found" });

    const match = await bcrypt.compare(password, patient.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(patient.id);
    res.json({
      message: "Login successful",
      token,
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        email: patient.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.checkAuth = async (req, res) => {
  try {
    const patient = req.patient;
    res.json({ patient });
  } catch (err) {
    console.error("Check auth failed:", err.message);
    res.status(500).json({ error: "Check auth failed" });
  }
};

exports.updateProfile = async (req, res) => {
  const { fullName, phone, gender, birthday, password } = req.body || {};
  const idPatient = req.patient.id;

  try {
    const patient = await Patient.findByPk(idPatient);
    if (!patient) return res.status(404).json({ error: "User not found" });

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      patient.image = `${baseUrl}/uploads/${req.file.filename}`;
    }

    if (fullName) patient.fullName = fullName;
    if (phone) patient.phone = phone;
    if (gender) patient.gender = gender;
    if (birthday) patient.birthday = birthday;
    if (password) patient.password = await bcrypt.hash(password, 10);

    await patient.save();

    res.json({
      message: "Profile updated successfully",
      patient: {
        id: patient.id,
        image: patient.image,
        fullName: patient.fullName,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        birthday: patient.birthday,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
