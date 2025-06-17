const db = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const {
  generateTokenAdmin,
  generateTokenDoctor,
} = require("../utils/generateToken");

const Admin = db.Admin;
const { Doctor, Service, DoctorService } = require("../models");

const predefinedAdmins = [
  { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
];

const reinitializeAdmin = async () => {
  for (const admin of predefinedAdmins) {
    const existing = await Admin.findOne({ where: { email: admin.email } });
    const hashed = await bcrypt.hash(admin.password, 10);

    if (!existing) {
      await Admin.create({ email: admin.email, password: hashed });
    } else {
      existing.password = hashed;
      await existing.save();
    }
  }
};
reinitializeAdmin();

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ where: { email } });
  if (!admin || !(await bcrypt.compare(password, admin.password)))
    return res.status(401).json({ message: "Invalid credentials" });

  const token = generateTokenAdmin(admin);
  res.status(200).json({ token, admin: { id: admin.id, email: admin.email } });
};

exports.createDoctor = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      fullName,
      email,
      password,
      speciality,
      experience,
      about,
      scheduleDate,
      scheduleTime,
      services,
    } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "fullName, email & password are required" });
    }

    const exists = await Doctor.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    let imagePath = null;
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      imagePath = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const doctor = await Doctor.create(
      {
        fullName,
        email,
        password: hash,
        speciality,
        experience,
        about,
        image: imagePath,
        scheduleDate,
        scheduleTime,
      },
      { transaction: t }
    );

    let createdServices = [];
    if (services) {
      let parsedServices;
      try {
        parsedServices = JSON.parse(services);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid JSON in services", error: err.message });
      }

      for (const service of parsedServices) {
        const newService = await Service.create(
          {
            name: service.name,
            fee: service.fee,
          },
          { transaction: t }
        );

        await DoctorService.create(
          {
            idDoctor: doctor.id,
            idService: newService.id,
          },
          { transaction: t }
        );

        createdServices.push(newService);
      }
    }

    await t.commit();

    res.status(201).json({
      message: "Doctor created with services",
      doctor,
      services: createdServices,
    });
  } catch (err) {
    await t.rollback();
    console.error("Create doctor error:", err);
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ doctors });
  } catch (err) {
    console.error("Error fetching doctors:", err.message);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

exports.loginDoctor = async (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;
  const doctor = await Doctor.findOne({ where: { email } });

  if (!doctor || !(await bcrypt.compare(password, doctor.password)))
    return res.status(401).json({ message: "Invalid credentials" });

  const token = generateTokenDoctor(doctor);
  res
    .status(200)
    .json({ token, doctor: { id: doctor.id, email: doctor.email } });
};

exports.checkSession = async (req, res) => {
  console.log(req.headers.authorization);
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("No token found");
    return res.status(401).json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    if (decoded.role === "admin") {
      return res.status(200).json({
        isAuthenticated: true,
        role: "admin",
        user: decoded,
      });
    }

    if (decoded.role === "doctor") {
      const doctor = await Doctor.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
        include: [
          {
            model: db.Feedback,
            attributes: ["id", "message", "stars"],
            include: {
              model: db.Patients,
              attributes: ["id", "fullName"],
            },
          },
        ],
      });
      return res.status(200).json({
        isAuthenticated: true,
        role: "doctor",
        user: doctor,
      });
    }

    return res.status(401).json({ isAuthenticated: false });
  } catch (error) {
    console.log("JWT verify error:", error.message);
    return res.status(401).json({ isAuthenticated: false });
  }
};
