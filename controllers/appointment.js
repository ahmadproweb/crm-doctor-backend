const db = require("../models");
const { Appointment, MedicalRecord, Doctor, Service } = require("../models");
const { Patient } = require("../models");

exports.bookAppointment = async (req, res) => {
  try {
    const { idDoctor, idService, date, time, payment } = req.body;
    const idPatient = req.patient.id;
    const patientName = req.patient.fullName;

    const doctor = await Doctor.findByPk(idDoctor);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const service = await Service.findByPk(idService);
    if (!service) return res.status(404).json({ error: "Service not found" });

    const appt = await Appointment.create({
      idPatient,
      idDoctor,
      idService,
      patientName,
      doctorName: doctor.fullName,
      date,
      time,
      payment,
      status: "processing",
    });

    res.status(201).json({ success: true, data: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
};
exports.updateMedicalRecord = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { diagnosis, doctorNotes, medications, markComplete } = req.body;

    /* ── 1. fetch appointment + existing medical record ────────────── */
    const appt = await Appointment.findByPk(appointmentId, {
      include: [{ model: MedicalRecord }], // alias not needed, default is MedicalRecord
    });
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    /* ── 2. upsert medical record ──────────────────────────────────── */
    if (appt.MedicalRecord) {
      await appt.MedicalRecord.update({ diagnosis, doctorNotes, medications });
    } else {
      await MedicalRecord.create({
        idAppointment: appointmentId,
        diagnosis,
        doctorNotes,
        medications,
      });
    }

    /* ── 3. optionally set appointment status complete ─────────────── */
    if (markComplete) appt.status = "complete";
    await appt.save();

    /* ── 4. return fresh record & appointment info ─────────────────── */
    const updated = await Appointment.findByPk(appointmentId, {
      include: [{ model: MedicalRecord }],
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateMedicalRecord error:", err);
    res.status(500).json({ error: "Failed to update medical record" });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await db.Appointment.findByPk(appointmentId);
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ success: true, message: "Appointment canceled" });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const idDoctor = req.doctor.id;

    const appointments = await Appointment.findAll({
      where: { idDoctor },
      include: [
        { model: Patient, attributes: ["fullName", "email", "phone", "image"] },
        {
          model: Doctor,
          attributes: ["fullName", "image"],
          include: [
            // 👈 nested include
            {
              association: db.Doctor.associations.services,
              attributes: ["name", "fee"],
            },
          ],
        },
        // this one will work when idService is present
        { model: Service, attributes: ["name", "fee"] },
      ],
      order: [
        ["date", "DESC"],
        ["time", "DESC"],
      ],
    });

    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error("Doctor appointment fetch error:", err);
    res.status(500).json({ error: "Failed to fetch doctor appointments" });
  }
};

exports.getAllAppointments = async (_req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Patient, attributes: ["fullName", "email", "image"] },
        { model: Service, attributes: ["name", "fee"] },
        { model: Doctor, attributes: ["fullName", "image"] },
      ],
      order: [
        ["date", "DESC"],
        ["time", "DESC"],
      ],
    });

    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error("Fetch appointments error:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await db.Appointment.findByPk(appointmentId);

    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });

    if (appointment.status === "complete") {
      return res
        .status(400)
        .json({ error: "Cannot Delete. Appointment already completed." });
    }

    await appointment.destroy();

    res.json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
};
