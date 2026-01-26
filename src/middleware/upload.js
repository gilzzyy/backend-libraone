const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/poto';

// auto-create folder kalau belum ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `user-${req.user.id}${path.extname(file.originalname)}`
    );
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('File harus gambar'));
  }
  cb(null, true);
};

module.exports = multer({ storage, fileFilter });
