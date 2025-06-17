const { Appointment, MedicalRecord, Doctor, Service } = require("../models");

exports.bookAppointment = async (req, res) => {
  try {
    const { idDoctor, idService, date, time, payment } = req.body;
    const idPatient   = req.patient.id;  
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

    const appt = await Appointment.findByPk(appointmentId, {
      include: MedicalRecord,
    });
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

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

    if (markComplete) appt.status = "complete";
    await appt.save();

    res.json({ success: true, data: appt });
  } catch (err) {
    console.error(err);
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
        { model: User, attributes: ["fullName", "email", "phone"] },
        { model: Doctor, attributes: ["name", "image", "fees"] },
      ],
      order: [["date", "ASC"]],
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Doctor appointment fetch error:", error);
    res.status(500).json({ error: "Failed to fetch doctor appointments" });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: User, attributes: ["fullName", "email"] },
        { model: Doctor, attributes: ["name", "image", "fees"] },
      ],
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Fetch appointments error:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const appointments = await Appointment.findAll({
      where: { userId },
      include: [
        { model: Doctor, attributes: ["name", "image", "fees", "speciality"] },
      ],
      order: [["date", "ASC"]],
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Fetch user appointments error:", error);
    res.status(500).json({ error: "Failed to fetch user appointments" });
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
