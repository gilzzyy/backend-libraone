const express = require('express');
const router = express.Router();
const dendaController = require('../controllers/dendaController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, dendaController.getMyDenda);
router.get('/me/total', verifyToken, isAdmin,dendaController.getTotalDenda);
router.put('/:id/bayar', verifyToken, dendaController.bayarDenda);

module.exports = router;
