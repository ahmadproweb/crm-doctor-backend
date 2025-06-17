const { Feedback, DoctorFeedback, Doctor } = require("../models");

exports.giveFeedback = async (req, res) => {
  try {
    const idPatient = req.patient.id;
    const { idDoctor, message, stars } = req.body;

    if (!idDoctor || !message || !stars) {
      return res.status(400).json({ message: "idDoctor, message, stars required" });
    }

    const doctor = await Doctor.findByPk(idDoctor);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const existing = await DoctorFeedback.findOne({
      include: [{
        model: Feedback,
        where: { idPatient }
      }],
      where: { idDoctor }
    });

    if (existing) {
      return res.status(409).json({ message: "Feedback already given" });
    }


    const feedback = await Feedback.create({ message, stars, idPatient });
await DoctorFeedback.create({ idDoctor, idFeedback: feedback.id });

await Doctor.update({ idFeedback: feedback.id }, { where: { id: idDoctor } });


    res.status(201).json({ message: "Feedback submitted", feedback });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
