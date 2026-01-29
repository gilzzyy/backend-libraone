const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[user]] = await db.query(
      `SELECT id, name, email, created_at, role, poin, poto
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
    const { poto } = req.body;

    if (!poto) {
      return res.status(400).json({
        message: 'URL foto wajib diisi'
      });
    }

    await db.query(
      'UPDATE users SET poto = ? WHERE id = ?',
      [poto, userId]
    );

    res.json({
      message: 'Foto profil berhasil diperbarui',
      poto
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Gagal update foto profil'
    });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { poto } = req.body;

    if (!poto) {
      return res.status(400).json({
        message: 'URL foto wajib diisi'
      });
    }

    await db.query(
      'UPDATE users SET poto = ? WHERE id = ?',
      [poto, userId]
    );

    res.json({
      message: 'Foto profil berhasil diperbarui',
      poto
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Gagal update foto profil'
    });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'Password lama dan baru wajib diisi'
      });
    }

    const [[user]] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Password lama salah'
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: 'Password baru tidak boleh sama'
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashed, userId]
    );

    res.json({
      message: 'Password berhasil diubah'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Gagal mengubah password'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: 'Nama dan email wajib diisi'
      });
    }

    // cek email sudah dipakai user lain
    const [[existing]] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );

    if (existing) {
      return res.status(409).json({
        message: 'Email sudah digunakan'
      });
    }

    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    );

    res.json({
      message: 'Profil berhasil diperbarui'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Gagal update profil'
    });
  }
};
