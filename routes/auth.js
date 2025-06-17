const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { giveFeedback } = require('../controllers/feedbackController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/check-auth', protect, authController.checkAuth);
router.put('/update-profile', protect,  upload.single("image"), authController.updateProfile);
router.post("/feedback", protect, giveFeedback);
module.exports = router;
