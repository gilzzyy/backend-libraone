const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile/poto', verifyToken, userController.updateAvatar);
router.put('/change-password', verifyToken, userController.changePassword);
router.put('/profile-update', verifyToken, userController.updateProfile);

module.exports = router;