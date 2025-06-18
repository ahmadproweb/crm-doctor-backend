const { Analysis } = require("../models");

exports.createOrUpdateAnalysis = async (req, res) => {
  try {
    if (!req.admin && !req.doctor)
      return res.status(403).json({ error: "Only doctors or admins allowed" });

    const { idPatient }    = req.params;
    const { analysisName } = req.body;

    if (!analysisName)       return res.status(400).json({ error: "analysisName required" });
    if (!req.file)           return res.status(400).json({ error: "PDF file required" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfPath = `${baseUrl}/uploads/${req.file.filename}`;

    let record = await Analysis.findOne({ where: { analysisName, idPatient } });

    if (record) record = await record.update({ pdfPath });
    else record = await Analysis.create({ analysisName, idPatient, pdfPath });

    res.json({ success: true, data: record });
  } catch (err) {
    console.error("createOrUpdateAnalysis error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
