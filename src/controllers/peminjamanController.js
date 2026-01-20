const db = require('../config/db');


/* ===============================
   PINJAM BUKU
================================ */
exports.pinjamBuku = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_buku } = req.body;

    if (!id_buku) {
      return res.status(400).json({ message: 'id_buku wajib diisi' });
    }

    // 1. Cek buku
    const [buku] = await db.query(
      'SELECT id_buku FROM buku WHERE id_buku = ?',
      [id_buku]
    );
    if (buku.length === 0) {
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }

    // 2. Cek sedang dipinjam
    const [dipinjam] = await db.query(
      `SELECT id FROM peminjaman 
       WHERE id_buku = ? AND status = 'dipinjam'`,
      [id_buku]
    );
    if (dipinjam.length > 0) {
      return res.status(409).json({ message: 'Buku sedang dipinjam' });
    }

    // 3. Simpan peminjaman (jatuh tempo 7 hari)
    const [result] = await db.query(
       `INSERT INTO peminjaman 
        (user_id, id_buku, tanggal_pinjam, tanggal_jatuh_tempo, status)
       VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'dipinjam')`,
      [userId, id_buku]
    );

    // 4. Tambah poin pinjam (+10)
    await db.query(
      'UPDATE users SET poin = poin + 10 WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      message: 'Buku berhasil dipinjam',
      poin_didapat: 10
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ===============================
   KEMBALIKAN BUKU
================================ */
exports.kembalikanBuku = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 1. Ambil data peminjaman
    const [data] = await db.query(
      `SELECT * FROM peminjaman 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (data.length === 0) {
      return res.status(404).json({ message: 'Data peminjaman tidak ditemukan' });
    }

    const peminjaman = data[0];

    if (peminjaman.status === 'dikembalikan') {
      return res.status(400).json({ message: 'Buku sudah dikembalikan' });
    }

    const today = new Date();
    const jatuhTempo = new Date(peminjaman.tanggal_jatuh_tempo);

    let poin = 0;
    let denda = 0;

    // 2. Cek telat atau tidak
    if (today <= jatuhTempo) {
      await db.query(
        'UPDATE users SET poin = poin + ? WHERE id = ?',
        [poin, userId]
      );
    } else {
      const telatHari = Math.ceil(
        (today - jatuhTempo) / (1000 * 60 * 60 * 24)
      );
      denda = telatHari * 500;

      await db.query(
        'INSERT INTO denda (peminjaman_id, jumlah) VALUES (?, ?)',
        [id, denda]
      );
    }

    // 3. Update peminjaman
    await db.query(
      `UPDATE peminjaman 
       SET status = 'dikembalikan',
           tanggal_kembali = CURDATE()
       WHERE id = ?`,
      [id]
    );

    res.json({
      message: 'Buku berhasil dikembalikan',
      poin_didapat: poin,
      denda
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ===============================
   RIWAYAT PEMINJAMAN
================================ */
exports.getMyPeminjaman = async (req, res) => {
  try {
    const userId = req.user.id;

    const [data] = await db.query(
      `SELECT 
        p.id,
        b.judul,
        p.tanggal_pinjam,
        p.tanggal_jatuh_tempo,
        p.tanggal_kembali,
        p.status
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id_buku
      WHERE p.user_id = ?
      ORDER BY p.tanggal_jatuh_tempo DESC`,
      [userId]
    );

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// exports.getPeminjamanSaya = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const data = await Peminjaman.findAll({
//       where: { user_id: userId },
//       include: [
//         {
//           model: Buku,
//           attributes: ['id', 'judul', 'penulis']
//         }
//       ],
//       order: [['createdAt', 'DESC']]
//     });

//     res.status(200).json({
//       success: true,
//       total: data.length,
//       data
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

exports.perpanjangPeminjaman = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [data] = await db.query(
      `SELECT * FROM peminjaman
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (data.length === 0) {
      return res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
    }

    const peminjaman = data[0];

    if (peminjaman.status !== 'dipinjam') {
      return res.status(400).json({ message: 'Buku sudah dikembalikan' });
    }

    if (peminjaman.diperpanjang === 1) {
      return res.status(400).json({ message: 'Peminjaman sudah pernah diperpanjang' });
    }

    // Tambah 2 hari
    await db.query(
      `UPDATE peminjaman
       SET tanggal_jatuh_tempo = DATE_ADD(tanggal_jatuh_tempo, INTERVAL 2 DAY),
           diperpanjang = 1
       WHERE id = ?`,
      [id]
    );

    res.json({ message: 'Peminjaman berhasil diperpanjang 2 hari' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPeminjamanAktif = async (req, res) => {
  try {
    const userId = req.user.id;

    const [data] = await db.query(
      `SELECT
        p.id,
        b.judul,
        b.pengarang,
        p.tanggal_pinjam,
        p.tanggal_jatuh_tempo,
        p.diperpanjang
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id_buku
      WHERE p.user_id = ?
      AND p.status = 'dipinjam'
      AND p.tanggal_jatuh_tempo IS NOT NULL
      ORDER BY p.tanggal_jatuh_tempo ASC;
`,
      [userId]
    );

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getRiwayatPeminjaman = async (req, res) => {
  try {
    const userId = req.user.id;

    const [data] = await db.query(
      `SELECT 
        p.id,
        b.judul,
        b.pengarang,
        p.tanggal_pinjam,
        p.tanggal_kembali,
        p.diperpanjang
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id_buku
      WHERE p.user_id = ?
        AND p.status = 'dikembalikan'
      ORDER BY p.tanggal_kembali DESC`,
      [userId]
    );

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

