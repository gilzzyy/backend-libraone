const db = require('../config/db');

exports.getMyDenda = async (req, res) => {
  try {
    const userId = req.user.id;

    const [data] = await db.query(
      `SELECT 
        d.id AS denda_id,
        d.jumlah,
        d.status,
        b.judul,
        p.tanggal_pinjam,
        p.tanggal_jatuh_tempo,
        p.tanggal_kembali
      FROM denda d
      JOIN peminjaman p ON d.peminjaman_id = p.id
      JOIN buku b ON p.id_buku = b.id_buku
      WHERE p.user_id = ?`,
      [userId]
    );

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




exports.getTotalDenda = async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT 
        d.id,
        u.name,
        b.judul,
        d.jumlah,
        p.tanggal_jatuh_tempo,
        p.tanggal_kembali
      FROM denda d
      JOIN peminjaman p ON d.peminjaman_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN buku b ON p.id_buku = b.id_buku
      ORDER BY d.id DESC
    `);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data denda' });
  }
};

exports.bayarDenda = async (req, res) => {
  try {
    const { id } = req.params;

    const [cek] = await db.query(
      'SELECT * FROM denda WHERE peminjaman_id = ?',
      [id]
    );

    if (cek.length === 0) {
      return res.status(404).json({ message: 'Denda tidak ditemukan' });
    }

    if (cek[0].status === 'lunas') {
      return res.status(400).json({ message: 'Denda sudah dibayar' });
    }

    await db.query(
      `UPDATE denda 
       SET status = 'dibayar'
       WHERE peminjaman_id = ?`,
      [id]
    );

    res.json({ message: 'Denda berhasil dibayar' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membayar denda' });
  }
};
