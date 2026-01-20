const db = require('../config/db');

exports.getLeaderboard = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        name,
        email,
        poin
      FROM users
      WHERE 
        role = 'anggota'
        AND name IS NOT NULL
      ORDER BY poin DESC
      LIMIT 10
    `);

    // tambahkan ranking manual
    const leaderboard = rows.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      email: user.email,
      poin: user.poin
    }));

    res.json({
      message: 'Leaderboard berhasil diambil',
      data: leaderboard
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMyRank = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[me]] = await db.query(
      'SELECT poin, name FROM users WHERE id = ?',
      [userId]
    );

    if (!me) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const [[rank]] = await db.query(
      `
      SELECT COUNT(*) + 1 AS ranking
      FROM users
      WHERE 
        role = 'anggota'
        AND poin > ?
      `,
      [me.poin]
    );

    res.json({
      name: me.name,
      poin: me.poin,
      ranking: rank.ranking
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
