const express = require('express');
const { castVote, getResults, getAdminStats } = require('../controllers/voteController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('voter'), castVote);
router.get('/results/:electionId', getResults);
router.get('/stats', protect, authorize('admin'), getAdminStats);

module.exports = router;
