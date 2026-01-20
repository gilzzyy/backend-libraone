exports.dashboard = (req, res) => {
  res.json({
    message: 'Akses khusus admin',
    user: req.user
  });
};
