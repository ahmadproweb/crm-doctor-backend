const db = require("../models");
const jwt = require("jsonwebtoken");
const { Patient , Appointment } = db;
const bcrypt = require("bcrypt");
const { Sequelize } = require("../models");

const DoctorFeedback = db.DoctorFeedback;
const Feedback = db.Feedback;
const fs = require("fs");
const path = require("path");
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
const parsedDate =
  scheduleDate && scheduleDate !== "Invalid date" ? scheduleDate : null;
const parsedTime =
  scheduleTime && scheduleTime !== "Invalid date" ? scheduleTime : null;
    const doctor = await Doctor.create(
      {
        fullName,
        email,
        password: hash,
        speciality,
        experience,
        about,
        image: imagePath,
        scheduleDate: parsedDate,
    scheduleTime: parsedTime,
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

function removeImage(fullUrl) {
  if (!fullUrl) return;

  try {
    const fileName = path.basename(fullUrl);
    const filePath = path.join(__dirname, "..", "uploads", fileName);

    console.log("🗑 Deleting image:", filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("✅ Image deleted:", fileName);
    } else {
      console.warn("⚠️ Image not found on disk:", fileName);
    }
  } catch (e) {
    console.error("removeImage error:", e.message);
  }
}

exports.updateDoctor = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;
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

    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (email && email !== doctor.email) {
      const exists = await Doctor.findOne({ where: { email } });
      if (exists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const hash = password ? await bcrypt.hash(password, 10) : doctor.password;

    if (req.file) {
      removeImage(doctor.image);
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      doctor.image = `${baseUrl}/uploads/${req.file.filename}`;
    }

    await doctor.update(
      {
        fullName: fullName ?? doctor.fullName,
        email: email ?? doctor.email,
        password: hash,
        speciality: speciality ?? doctor.speciality,
        experience: experience ?? doctor.experience,
        about: about ?? doctor.about,
        scheduleDate: scheduleDate ?? doctor.scheduleDate,
        scheduleTime: scheduleTime ?? doctor.scheduleTime,
      },
      { transaction: t }
    );

    let updatedServices = [];
    if (services) {
      let parsed;
      try {
        parsed = JSON.parse(services);
      } catch (e) {
        return res.status(400).json({
          message: "Invalid JSON in services",
          error: e.message,
        });
      }

      const oldLinks = await DoctorService.findAll({
        where: { idDoctor: doctor.id },
        transaction: t,
      });
      const oldServiceIds = oldLinks.map((l) => l.idService);

      await DoctorService.destroy({
        where: { idDoctor: doctor.id },
        transaction: t,
      });

      if (oldServiceIds.length) {
        await Service.destroy({ where: { id: oldServiceIds }, transaction: t });
      }

      for (const s of parsed) {
        const newSrv = await Service.create(
          { name: s.name, fee: s.fee },
          { transaction: t }
        );
        await DoctorService.create(
          { idDoctor: doctor.id, idService: newSrv.id },
          { transaction: t }
        );
        updatedServices.push(newSrv);
      }
    }

    await t.commit();
    return res.status(200).json({
      message: "Doctor updated",
      doctor,
      services: updatedServices,
    });
  } catch (err) {
    await t.rollback();
    console.error("Update doctor error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

// controller/doctorController.js
exports.deleteDoctor = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    /* ---------- Doctor exist? ---------- */
    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    /* ---------- 1. Image delete ---------- */
    removeImage(doctor.image);

    /* ---------- 2. Services clean‑up ---------- */
    const serviceLinks = await DoctorService.findAll({
      where: { idDoctor: id },
      transaction: t,
    });
    const serviceIds = serviceLinks.map((l) => l.idService);

    await DoctorService.destroy({
      where: { idDoctor: id },
      transaction: t,
    });
    if (serviceIds.length) {
      await Service.destroy({
        where: { id: serviceIds },
        transaction: t,
      });
    }

    /* ---------- 3. Reviews clean‑up ---------- */
    const reviewLinks = await DoctorFeedback.findAll({
      where: { idDoctor: id },
      transaction: t,
    });
    const feedbackIds = reviewLinks.map((l) => l.idFeedback);

    await DoctorFeedback.destroy({
      where: { idDoctor: id },
      transaction: t,
    });
    if (feedbackIds.length) {
      await Feedback.destroy({
        where: { id: feedbackIds },
        transaction: t,
      });
    }

    /* ---------- 4. Doctor delete ---------- */
    await doctor.destroy({ transaction: t });

    await t.commit();
    return res.status(200).json({
      message: "Doctor, services & reviews deleted",
    });
  } catch (err) {
    await t.rollback();
    console.error("Delete doctor error:", err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

exports.getAllDoctors = async (_req, res) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: {
        exclude: ["password"],
        include: [
          [
            Sequelize.fn(
              "COALESCE",
              Sequelize.fn("AVG", Sequelize.col("Feedbacks.stars")),
              0
            ),
            "avgRating",
          ],
        ],
      },

      include: [
        // services via M:N relation
        {
          model: Service,
          as: "services",
          attributes: ["id", "name", "fee"],
          through: { attributes: [] }, // hide join table
        },
        // feedbacks
        {
          model: Feedback,
          attributes: ["id", "message", "stars"],
          through: { attributes: [] },
        },
      ],

      group: ["Doctor.id", "services.id", "Feedbacks.id"],

      order: [[Sequelize.literal('"avgRating"'), "DESC"]],
    });

    res.json({ doctors });
  } catch (err) {
    console.error("getAllDoctors error:", err);
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

exports.getAllPatients = async (req, res) => {
  try {
    const isDoctor = !!req.doctor;
    const doctorId = req.doctor?.id;

    const patients = await Patient.findAll({
      attributes: { exclude: ["password"] },
      distinct: true,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Appointment,
          required: isDoctor,
          where: isDoctor ? { idDoctor: doctorId } : undefined,
          attributes: ["date", "time"],
          include: [
            {
              model: Service,
              attributes: ["name", "fee"],
            },
            {
              model: Doctor,
              attributes: ["id", "fullName"],
            },
            {
              model: db.MedicalRecord,
              attributes: ["diagnosis", "doctorNotes", "medications"],
            },
          ],
        },
        {
          model: Feedback,
          required: false,
          attributes: ["message", "stars"],
          include: [
            {
              model: DoctorFeedback,
              as: "feedbackJoin", // ✅ Fix: Correct alias used here
              required: isDoctor,
              where: isDoctor ? { idDoctor: doctorId } : undefined,
              attributes: [],
              include: [
                {
                  model: Doctor,
                     as   : "doctor",   
                  attributes: ["id", "fullName"],
                },
              ],
            },
          ],
        },
        {
          model: db.Analysis,
          attributes: ["analysisName", "pdfPath"],
        },
      ],
    });

    res.json(patients);
  } catch (e) {
    console.error("getAllPatients error:", e);
    res.status(500).json({ message: "Something went wrong" });
  }
};

