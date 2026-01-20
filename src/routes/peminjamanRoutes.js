const express = require('express');
const router = express.Router();

const peminjamanController = require('../controllers/peminjamanController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, peminjamanController.getMyPeminjaman);
router.post('/', verifyToken, peminjamanController.pinjamBuku);
router.put('/:id/kembali', verifyToken, peminjamanController.kembalikanBuku);
router.put('/:id/perpanjang', verifyToken, peminjamanController.perpanjangPeminjaman);
router.get('/aktif', verifyToken, peminjamanController.getPeminjamanAktif);
router.get('/riwayat', verifyToken, peminjamanController.getRiwayatPeminjaman);

module.exports = router;
