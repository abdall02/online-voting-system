const express = require('express');
const {
    getElections,
    getElection,
    createElection,
    updateElection,
    deleteElection,
    certifyElection
} = require('../controllers/electionController');
const { addCandidate } = require('../controllers/candidateController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getElections)
    .post(protect, authorize('admin'), createElection);

router.route('/:id')
    .get(getElection)
    .put(protect, authorize('admin'), updateElection)
    .delete(protect, authorize('admin'), deleteElection);

router.put('/:id/certify', protect, authorize('admin'), certifyElection);

router.post('/:electionId/candidates', protect, authorize('admin'), addCandidate);

module.exports = router;
