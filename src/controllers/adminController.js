const db = require('../config/db');

exports.dashboard = (req, res) => {
  res.json({
    message: 'Akses khusus admin',
    user: req.user
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, name, email, role, poin, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data user' });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [[user]] = await db.query(
      `SELECT id, name, email, role, poin, poto, created_at
       FROM users
       WHERE id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek user
    const [[user]] = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({
        message: 'User tidak ditemukan'
      });
    }

    // Cegah hapus admin sendiri
    if (id == req.user.id) {
      return res.status(400).json({
        message: 'Tidak bisa menghapus akun sendiri'
      });
    }

    await db.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'User berhasil dihapus'
    });

  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus user' });
  }
};

exports.getAllActiveBorrowings = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT 
        p.id,
        u.id AS user_id,
        u.name AS nama_user,
        u.email,
        b.id_buku,
        b.judul,
        b.pengarang,
        p.tanggal_pinjam,
        p.tanggal_jatuh_tempo,
        p.diperpanjang
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN buku b ON p.id_buku = b.id_buku
      WHERE p.status = 'dipinjam'
      ORDER BY p.tanggal_jatuh_tempo ASC`
    );

    res.json({
      total: data.length,
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data peminjaman aktif' });
  }
};

exports.getAllReturnedBorrowings = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT 
        p.id,
        u.id AS user_id,
        u.name AS nama_user,
        u.email,
        b.id_buku,
        b.judul,
        b.pengarang,
        p.tanggal_pinjam,
        p.tanggal_kembali,
        p.diperpanjang
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN buku b ON p.id_buku = b.id_buku
      WHERE p.status = 'dikembalikan'
      ORDER BY p.tanggal_kembali DESC`
    );

    res.json({
      total: data.length,
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil riwayat pengembalian' });
  }
};


// exports.getUserBorrowingHistory = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Cek user ada
//     const [[user]] = await db.query(
//       'SELECT id, name, email FROM users WHERE id = ?',
//       [userId]
//     );

//     if (!user) {
//       return res.status(404).json({ message: 'User tidak ditemukan' });
//     }

//     const [data] = await db.query(
//       `SELECT 
//         p.id,
//         b.id_buku,
//         b.judul,
//         b.pengarang,
//         p.tanggal_pinjam,
//         p.tanggal_jatuh_tempo,
//         p.tanggal_kembali,
//         p.status,
//         p.diperpanjang
//       FROM peminjaman p
//       JOIN buku b ON p.id_buku = b.id_buku
//       WHERE p.user_id = ?
//       ORDER BY p.tanggal_pinjam DESC`,
//       [userId]
//     );

//     res.json({
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email
//       },
//       total_peminjaman: data.length,
//       data
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Gagal mengambil riwayat peminjaman user' });
//   }
// };
