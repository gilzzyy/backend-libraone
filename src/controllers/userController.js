const db = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[user]] = await db.query(
      `SELECT id, name, email, created_at, role, poin
       FROM users
       WHERE id = ?`,
      [userId]
    );

    const [[stat]] = await db.query(
      `SELECT
        COUNT(*) AS total_peminjaman,
        SUM(status = 'dipinjam') AS sedang_dipinjam
       FROM peminjaman
       WHERE user_id = ?`,
      [userId]
    );

    const [[peringkat]] = await db.query(
      `SELECT COUNT(*) + 1 AS ranking
       FROM users
       WHERE poin > ?`,
      [user.xp]
    );

    res.json({
      nama: user.name,
      email: user.email,
      foto: user.poto,
      bergabung_sejak: user.created_at,
      status: user.role,
      xp: user.poin,
      peringkat: peringkat.ranking,
      sedang_dipinjam: stat.sedang_dipinjam,
      total_peminjaman: stat.total_peminjaman
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil profil' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'File tidak ditemukan' });
    }

    const avatarPath = `/uploads/poto/${req.file.filename}`;

    await db.query(
      `UPDATE users SET poto = ? WHERE id = ?`,
      [avatarPath, userId]
    );

    res.json({
      message: 'Foto profil berhasil diperbarui',
      poto: avatarPath
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal update foto profil' });
  }
};
