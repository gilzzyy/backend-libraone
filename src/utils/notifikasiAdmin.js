const db = require('../config/db');

exports.broadcastAdminNotif = async (pesan) => {
  const [users] = await db.query(
    "SELECT id FROM users WHERE role = 'anggota'"
  );

  for (const user of users) {
    await db.query(
      'INSERT INTO notifikasi (user_id, pesan, tipe) VALUES (?, ?, ?)',
      [user.id, pesan, 'admin']
    );
  }
};
