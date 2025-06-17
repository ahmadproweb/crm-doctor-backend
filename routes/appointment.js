const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment");
const {
  adminAuthMiddleware,
  doctorAuthMiddleware,
} = require("../middlewares/admin");
const { protect } = require("../middlewares/authMiddleware");

router.post("/auth/book", protect, appointmentController.bookAppointment);

router.get(
  "/admin/all/appointments",
  adminAuthMiddleware,
  appointmentController.getAllAppointments
);
router.get(
  "/doctor/my/appointments",
  doctorAuthMiddleware,
  appointmentController.getDoctorAppointments
);

router.put(
  "/:appointmentId/medical-record",
  appointmentController.updateMedicalRecord
);

router.put("/:appointmentId/cancel", appointmentController.cancelAppointment);



router.delete(
  "/:appointmentId/auth/delete/cancel",
  protect,
  appointmentController.cancelAppointment
);

module.exports = router;
