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

exports.getOnTimeReturns = async (req, res) => {
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
        p.tanggal_kembali
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN buku b ON p.id_buku = b.id_buku
      WHERE p.status = 'dikembalikan'
        AND p.tanggal_kembali <= p.tanggal_jatuh_tempo
      ORDER BY p.tanggal_kembali DESC`
    );

    res.json({
      total: data.length,
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data pengembalian tepat waktu' });
  }
};

exports.getLateReturns = async (req, res) => {
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
        p.tanggal_kembali,
        DATEDIFF(p.tanggal_kembali, p.tanggal_jatuh_tempo) AS hari_terlambat,
        d.jumlah AS denda
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN buku b ON p.id_buku = b.id_buku
      LEFT JOIN denda d ON p.id = d.peminjaman_id
      WHERE p.status = 'dikembalikan'
        AND p.tanggal_kembali > p.tanggal_jatuh_tempo
      ORDER BY p.tanggal_kembali DESC`
    );

    res.json({
      total: data.length,
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data pengembalian terlambat' });
  }
};

exports.getAllDendaSummary = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT 
        u.id AS user_id,
        u.name AS nama_user,
        u.email,
        COUNT(d.id) AS jumlah_transaksi,
        SUM(d.jumlah) AS total_dibayar
      FROM users u
      JOIN peminjaman p ON u.id = p.user_id
      JOIN denda d ON p.id = d.peminjaman_id
      WHERE d.status = 'dibayar'
      GROUP BY u.id, u.name, u.email
      ORDER BY total_dibayar DESC`
    );

    // Hitung grand total
    const grandTotal = data.reduce((sum, row) => sum + Number(row.total_dibayar), 0);

    res.json({
      jumlah_user: data.length,
      total_denda_dibayar: grandTotal,
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil ringkasan denda' });
  }
};

exports.getAllPaidDenda = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT 
        d.id AS denda_id,
        u.id AS user_id,
        u.name AS nama_user,
        u.email,
        b.judul,
        d.jumlah,
        d.status,
        p.tanggal_pinjam,
        p.tanggal_jatuh_tempo,
        p.tanggal_kembali,
        DATEDIFF(p.tanggal_kembali, p.tanggal_jatuh_tempo) AS hari_terlambat
      FROM denda d
      JOIN peminjaman p ON d.peminjaman_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN buku b ON p.id_buku = b.id_buku
      WHERE d.status = 'dibayar'
      ORDER BY d.id DESC`
    );

    const totalDibayar = data.reduce((sum, row) => sum + Number(row.jumlah), 0);

    res.json({
      total_transaksi: data.length,
      total_dibayar: totalDibayar,
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data denda yang dibayar' });
  }
};
