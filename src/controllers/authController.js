const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * REGISTER
 */
exports.register = async (req, res) => {
  try {
    console.log('BODY REGISTER:', req.body);

    const { name, email, password } = req.body;

    // 1. Validasi body
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email dan password wajib diisi'
      });
    }

    // 2. Cek email sudah ada
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: 'Email sudah terdaftar'
      });
    }

    // 3. Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 4. INSERT (ROLE DIKUNCI OLEH SERVER)
    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name || null, email, hashedPassword, 'anggota']
    );

    return res.status(201).json({
      message: 'Register berhasil'
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({
      message: 'Internal server error',
      detail: error.message
    });
  }
};

/**
 * LOGIN (REAL)
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email dan password wajib diisi'
      });
    }

    // 2. Cari user
    const [rows] = await db.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Email atau password salah'
      });
    }

    const user = rows[0];

    // 3. Bandingkan password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Email atau password salah'
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5. Response
    return res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({
      message: 'Internal server error',
      detail: error.message
    });
  }
};
