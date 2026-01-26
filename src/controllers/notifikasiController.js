const db = require('../config/db');

/* ===============================
   GET NOTIFIKASI USER
================================ */
exports.getMyNotif = async (req, res) => {
  try {
    const userId = req.user.id;

    const [data] = await db.query(
      `SELECT id, pesan, tipe, dibaca, created_at
       FROM notifikasi
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ===============================
   JUMLAH NOTIFIKASI BELUM DIBACA
================================ */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[result]] = await db.query(
      `SELECT COUNT(*) AS total FROM notifikasi
       WHERE user_id = ? AND dibaca = false`,
      [userId]
    );

    res.json({ total: result.total });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ===============================
   MARK AS READ
================================ */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      `UPDATE notifikasi
       SET dibaca = true
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Notifikasi tidak ditemukan'
      });
    }

    res.json({ message: 'Notifikasi dibaca' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


