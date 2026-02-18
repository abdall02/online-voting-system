const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { getIO } = require('../config/socket');

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Private/Voter
exports.castVote = async (req, res, next) => {
    console.log('--- Cast Vote Started ---');
    console.log('Type of next:', typeof next);
    try {
        const { candidateId, electionId } = req.body;

        if (!req.user) {
            console.error('No user found on request object');
            return res.status(401).json({ success: false, message: 'User session not found. Please log in again.' });
        }

        const userId = req.user.id;
        console.log(`User ID: ${userId}, Role: ${req.user.role}`);

        const user = await User.findById(userId);
        console.log(`User ${userId} attempting to vote. hasVoted: ${user.hasVoted}`);

        if (user.hasVoted) {
            console.log(`User ${userId} already voted.`);
            return res.status(400).json({ success: false, message: 'You have already cast your vote' });
        }

        const election = await Election.findById(electionId);
        if (!election) {
            console.log(`Election ${electionId} not found.`);
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        if (election.status !== 'active') {
            console.log(`Election ${electionId} is ${election.status}.`);
            return res.status(400).json({ success: false, message: 'This election is not currently active' });
        }

        // Check if election time has passed
        const now = new Date();
        if (now > new Date(election.endDate)) {
            console.log(`Election ${electionId} has expired based on endDate.`);
            return res.status(400).json({ success: false, message: 'The voting period for this election has ended' });
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            console.log(`Candidate ${candidateId} not found.`);
            return res.status(404).json({ success: false, message: 'Selected candidate was not found' });
        }

        // Increment candidate vote count
        candidate.voteCount += 1;
        await candidate.save();

        // Update user status
        user.hasVoted = true;
        user.votedCandidate = candidateId;
        await user.save();

        // Socket.io emit updated results (defensive)
        try {
            const io = getIO();
            const updatedCandidates = await Candidate.find({ electionId });
            io.emit('voteUpdated', {
                electionId,
                candidates: updatedCandidates
            });
        } catch (socketErr) {
            console.warn('Socket update failed, but vote was recorded:', socketErr.message);
        }

        res.status(200).json({
            success: true,
            message: 'Your vote has been recorded successfully'
        });
    } catch (err) {
        console.error('Error in castVote:', err);
        if (typeof next === 'function') {
            next(err);
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

// @desc    Get results for an election
// @route   GET /api/votes/results/:electionId
// @access  Public
exports.getResults = async (req, res, next) => {
    try {
        const candidates = await Candidate.find({ electionId: req.params.electionId });
        const totalVotesCast = candidates.reduce((total, candidate) => total + candidate.voteCount, 0);

        // Accurate real-time count of eligible voters (students)
        const totalEligibleVoters = await User.countDocuments({ role: 'voter' });

        res.status(200).json({
            success: true,
            data: {
                candidates,
                totalVotes: totalVotesCast,
                totalEligibleVoters,
                turnoutPercent: totalEligibleVoters > 0 ? ((totalVotesCast / totalEligibleVoters) * 100).toFixed(1) : 0
            }
        });
    } catch (err) {
        console.error('Error in getResults:', err);
        if (typeof next === 'function') {
            next(err);
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

// @desc    Get stats for admin
// @route   GET /api/votes/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res, next) => {
    try {
        const totalVoters = await User.countDocuments({ role: 'voter' });
        const totalVoted = await User.countDocuments({ hasVoted: true });
        const electionsCount = await Election.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalVoters,
                totalVoted,
                electionsCount,
                participationRate: totalVoters > 0 ? (totalVoted / totalVoters * 100).toFixed(2) : 0
            }
        });
    } catch (err) {
        console.error('Error in getAdminStats:', err);
        if (typeof next === 'function') {
            next(err);
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};
