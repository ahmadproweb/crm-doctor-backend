const express = require("express");
const router = express.Router();
const { adminAuthMiddleware } = require("../middlewares/admin");
const { loginAdmin, loginDoctor, createDoctor, checkSession, getAllDoctors } = require("../controllers/loginAdmin");
const upload = require("../middlewares/upload");
const { createOrUpdateAnalysis } = require("../controllers/analysis");

router.post("/admin/login", loginAdmin);
router.post("/doctor/login", loginDoctor);
router.get("/doctor", getAllDoctors);
router.post("/admin/doctor-create", upload.single("image"), adminAuthMiddleware, createDoctor);
router.get("/check-session", checkSession);
router.put(
    "/:idPatient/analysis", upload.single("image"),
    createOrUpdateAnalysis
);


module.exports = router;
