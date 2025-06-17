const { Analysis } = require("../models");

exports.createOrUpdateAnalysis = async (req, res) => {
  try {
    if (!req.admin && !req.doctor) {
      return res
        .status(403)
        .json({ error: "Only doctors or admins can perform this action" });
    }

    const { idPatient } = req.params;
    const { analysisName } = req.body;

    if (!analysisName)
      return res.status(400).json({ error: "analysisName is required" });

    if (!req.file)
      return res.status(400).json({ error: "Image file required" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imagePath = `${baseUrl}/uploads/analysis/${req.file.filename}`;

    let record = await Analysis.findOne({ where: { analysisName, idPatient } });

    if (record) {
      record = await record.update({ image: imagePath });
    } else {
      record = await Analysis.create({
        analysisName,
        idPatient,
        image: imagePath,
      });
    }

    return res.json({ success: true, data: record });
  } catch (err) {
    console.error("createOrUpdateAnalysis error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
