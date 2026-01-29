require('dotenv').config();
require('./config/db');

const express = require('express');
const app = express();

app.use(express.json());


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); 
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/peminjaman', require('./routes/peminjamanRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/denda', require('./routes/dendaRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifikasi', require('./routes/notifikasiRoutes'));



app.get('/', (req, res) => {
  res.send('API Perpustakaan Digital berjalan 🚀');
});

module.exports = app;
