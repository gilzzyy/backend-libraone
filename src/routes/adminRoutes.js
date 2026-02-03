const express = require('express');
const router = express.Router();

const {verifyToken,isAdmin} = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');


router.get('/dashboard', verifyToken, isAdmin, adminController.dashboard);
router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);
router.get('/users/:id', verifyToken, isAdmin, adminController.getUserDetail);
router.delete('/users/:id', verifyToken, isAdmin, adminController.deleteUser);

router.get('/peminjaman/aktif', verifyToken, isAdmin, adminController.getAllActiveBorrowings);
router.get('/peminjaman/riwayat', verifyToken, isAdmin, adminController.getAllReturnedBorrowings);
// router.get('/users/:userId/peminjaman', verifyToken, isAdmin, adminController.getUserBorrowingHistory);

module.exports = router;
