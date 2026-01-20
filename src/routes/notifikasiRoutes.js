const express = require('express');
const router = express.Router();

const notifikasiController = require('../controllers/notifikasiController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, notifikasiController.getMyNotif);
router.get('/unread-count', verifyToken, notifikasiController.getUnreadCount);
router.put('/:id/read', verifyToken, notifikasiController.markAsRead);

module.exports = router;
