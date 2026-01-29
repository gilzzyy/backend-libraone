const db = require('../config/db');
const { broadcastAdminNotif } = require('../utils/notifikasiAdmin');


exports.getAllBooks = async (req, res) => {
  try {
    const [books] = await db.query('SELECT * FROM buku');
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};


exports.createBook = async (req, res) => {
  try {
    const {
      id_buku,
      cover,
      kategori,
      judul,
      pengarang,
      penerbit,
      tahun_terbit,
      jumlah_halaman,
      buku_deskripsi
    } = req.body;

    if (!id_buku || !judul) {
      return res.status(400).json({
        message: 'id_buku dan judul wajib diisi'
      });
    }

    await db.query(
      `INSERT INTO buku 
      (id_buku, cover, kategori, judul, pengarang, penerbit, tahun_terbit, jumlah_halaman, buku_deskripsi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_buku,
        cover,
        kategori,
        judul,
        pengarang,
        penerbit,
        tahun_terbit,
        jumlah_halaman,
        buku_deskripsi
      ]
    );

     await broadcastAdminNotif(
      `📚 Buku baru "${judul}" telah ditambahkan`
    );

    res.status(201).json({
      message: 'Buku berhasil ditambahkan'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};


exports.updateBook = async (req, res) => {
  try {
    const { id_buku } = req.params;

    const {
      cover,
      kategori,
      judul,
      pengarang,
      penerbit,
      tahun_terbit,
      jumlah_halaman,
      buku_deskripsi
    } = req.body;

    const [result] = await db.query(
      `UPDATE buku SET
        cover = ?,
        kategori = ?,
        judul = ?,
        pengarang = ?,
        penerbit = ?,
        tahun_terbit = ?,
        jumlah_halaman = ?,
        buku_deskripsi = ?
      WHERE id_buku = ?`,
      [
        cover,
        kategori,
        judul,
        pengarang,
        penerbit,
        tahun_terbit,
        jumlah_halaman,
        buku_deskripsi,
        id_buku
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Buku tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Buku berhasil diperbarui'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};


exports.deleteBook = async (req, res) => {
  try {
    const { id_buku } = req.params;

    const [result] = await db.query(
      'DELETE FROM buku WHERE id_buku = ?',
      [id_buku]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Buku tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Buku berhasil dihapus'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};



exports.getPopularBooks = async (req, res) => {
  try {
    const [books] = await db.query(`
      SELECT 
        b.id_buku,
        b.judul,
        b.pengarang,
        b.cover,
        COUNT(p.id) AS total_dipinjam
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id_buku
      GROUP BY b.id_buku
      ORDER BY total_dipinjam DESC
      LIMIT 5
    `);

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil buku populer' });
  }
};

exports.getBookDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        b.id_buku,
        b.judul,
        b.pengarang,
        b.kategori,
        b.buku_deskripsi,
        b.cover,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM peminjaman p 
            WHERE p.id_buku = b.id_buku AND p.status = 'dipinjam'
          ) THEN 'dipinjam'
          ELSE 'tersedia'
        END AS status,
        COUNT(p2.id) AS total_dipinjam
      FROM buku b
      LEFT JOIN peminjaman p2 ON b.id_buku = p2.id_buku
      WHERE b.id = ?
      GROUP BY b.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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
