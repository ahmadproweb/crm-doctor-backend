const jwt = require("jsonwebtoken");
const {
  Patient,
  Analysis,
  Appointment,
  MedicalRecord,
  Service,
  Doctor,
} = require("../models");

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🗄️  Pull patient + analysis + appointments (+ medical record)
    const patient = await Patient.findByPk(decoded.id, {
      attributes: [
        "id",
        "fullName",
        "email",
        "phone",
        "gender",
        "birthday",
        "image",
      ],
      include: [
        // ⇢ Analyses performed for this patient
        {
          model: Analysis,
          attributes: ["id", "analysisName", "pdfPath", "createdAt" , "updatedAt"],
        },
        // ⇢ Their appointments with nested doctor, service & medical record
        {
          model: Appointment,
          attributes: ["id", "date", "time", "status", "payment"],
          include: [
            {
              model: Service,
              attributes: ["id", "name", "fee"],
            },
            {
              model: Doctor,
              attributes: ["id", "fullName", "speciality", "image"],
            },
            {
              model: MedicalRecord,
              attributes: ["id", "diagnosis", "doctorNotes", "medications"],
            },
          ],
        },
      ],
      order: [[{ model: Appointment }, "date", "DESC"]], // latest first
    });

    if (!patient) return res.status(401).json({ error: "User not found" });

    req.patient = patient;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};
