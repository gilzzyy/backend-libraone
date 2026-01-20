const express = require('express');
const router = express.Router();

const leaderboardController = require('../controllers/leaderboardController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', leaderboardController.getLeaderboard);
router.get('/me', verifyToken, leaderboardController.getMyRank);


module.exports = router;
