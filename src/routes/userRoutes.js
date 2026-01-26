const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile/poto', verifyToken, upload.single('poto'), userController.updateAvatar);

module.exports = router;