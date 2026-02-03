const express = require('express');
const router = express.Router();

const {verifyToken,isAdmin} = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

//manage akun
router.get('/dashboard', verifyToken, isAdmin, adminController.dashboard);
router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);
router.get('/users/:id', verifyToken, isAdmin, adminController.getUserDetail);
router.delete('/users/:id', verifyToken, isAdmin, adminController.deleteUser);

//peminjaman
router.get('/peminjaman/aktif', verifyToken, isAdmin, adminController.getAllActiveBorrowings);
router.get('/peminjaman/riwayat', verifyToken, isAdmin, adminController.getAllReturnedBorrowings);
router.get('/peminjaman/tepat-waktu', verifyToken, isAdmin, adminController.getOnTimeReturns);
router.get('/peminjaman/terlambat', verifyToken, isAdmin, adminController.getLateReturns);
// router.get('/users/:userId/peminjaman', verifyToken, isAdmin, adminController.getUserBorrowingHistory);

//denda
router.get('/denda', verifyToken, isAdmin, adminController.getAllDenda);
router.get('/denda/summary', verifyToken, isAdmin, adminController.getAllDendaSummary);
router.get('/denda/dibayar', verifyToken, isAdmin, adminController.getAllPaidDenda);

module.exports = router;
