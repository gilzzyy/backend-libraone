const express = require('express');
const router = express.Router();

const {
  verifyToken,
  isAdmin
} = require('../middleware/authMiddleware');

// console.log('✅ adminRoutes LOADED');

router.get('/dashboard', verifyToken, isAdmin, (req, res) => {
  res.json({
    message: 'Selamat datang Admin',
    user: req.user
  });
});

module.exports = router;
