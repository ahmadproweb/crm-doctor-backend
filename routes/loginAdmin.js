const express = require("express");
const router = express.Router();
const { adminAuthMiddleware, doctorAuthMiddleware } = require("../middlewares/admin");
const { loginAdmin, loginDoctor, createDoctor, checkSession, getAllDoctors, updateDoctor, deleteDoctor, getAllPatients } = require("../controllers/loginAdmin");
const upload = require("../middlewares/upload");
const { createOrUpdateAnalysis } = require("../controllers/analysis");
const { eitherAdminOrDoctorAuth } = require("../middlewares/eitherAdminOrDoctorAuth");

router.post("/admin/login", loginAdmin);
router.post("/doctor/login", loginDoctor);
router.get("/doctor", getAllDoctors);
router.post("/admin/doctor-create", upload.single("image"), adminAuthMiddleware, createDoctor);

router.put(
  "/admin/doctor-update/:id",
  upload.single("image"),
  adminAuthMiddleware,
  updateDoctor
);

router.delete(
  "/admin/doctor-delete/:id",
  adminAuthMiddleware,
  deleteDoctor
); 
router.get("/check-session", checkSession);

router.post(
    "/:idPatient/analysis", upload.single("image"), eitherAdminOrDoctorAuth ,
    createOrUpdateAnalysis
);


router.get("/admin/patients",  adminAuthMiddleware,  getAllPatients);

router.get("/doctor/patients", doctorAuthMiddleware, getAllPatients);


module.exports = router;
