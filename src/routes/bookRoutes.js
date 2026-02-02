const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');


// PUBLIC

router.get('/', bookController.getAllBooks);
router.get('/populer', bookController.getPopularBooks);
router.get('/:id', bookController.getBookDetail);


// ADMIN ONLY

router.post('/', verifyToken, isAdmin, upload.single('cover'), bookController.createBook);
router.put('/:id_buku', verifyToken, isAdmin, bookController.updateBook);
router.delete('/:id_buku', verifyToken, isAdmin, bookController.deleteBook);

module.exports = router;
