const express = require('express');
const {
    updateCandidate,
    deleteCandidate
} = require('../controllers/candidateController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/:id')
    .put(protect, authorize('admin'), updateCandidate)
    .delete(protect, authorize('admin'), deleteCandidate);

module.exports = router;
