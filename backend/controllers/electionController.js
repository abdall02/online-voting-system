const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const User = require('../models/User');

// @desc    Get all elections
// @route   GET /api/elections
// @access  Public
exports.getElections = async (req, res, next) => {
    try {
        const elections = await Election.find();
        res.status(200).json({ success: true, count: elections.length, data: elections });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single election
// @route   GET /api/elections/:id
// @access  Public
exports.getElection = async (req, res, next) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        const candidates = await Candidate.find({ electionId: req.params.id });

        res.status(200).json({
            success: true,
            data: {
                ...election._doc,
                candidates
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create election
// @route   POST /api/elections
// @access  Private/Admin
exports.createElection = async (req, res, next) => {
    try {
        const election = await Election.create(req.body);
        res.status(201).json({ success: true, data: election });
    } catch (err) {
        next(err);
    }
};

// @desc    Update election
// @route   PUT /api/elections/:id
// @access  Private/Admin
exports.updateElection = async (req, res, next) => {
    try {
        let election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        election = await Election.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: election });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete election
// @route   DELETE /api/elections/:id
// @access  Private/Admin
exports.deleteElection = async (req, res, next) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        await election.deleteOne();
        await Candidate.deleteMany({ electionId: req.params.id });

        // Reset all users voting status so they can vote in a new election
        await User.updateMany({}, {
            hasVoted: false,
            votedCandidate: null
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
// @desc    Certify election and declare winner
// @route   PUT /api/elections/:id/certify
// @access  Private/Admin
exports.certifyElection = async (req, res, next) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        if (election.status !== 'ended') {
            return res.status(400).json({ success: false, message: 'Election must be ended before certifying' });
        }

        const candidates = await Candidate.find({ electionId: req.params.id }).sort('-voteCount');

        if (candidates.length === 0) {
            return res.status(400).json({ success: false, message: 'No candidates found for this election' });
        }

        const winner = candidates[0]; // The one with the highest votes

        election.isCertified = true;
        election.winner = winner._id;
        await election.save();

        res.status(200).json({
            success: true,
            message: `Election certified! Winner: ${winner.name}`,
            data: election
        });
    } catch (err) {
        next(err);
    }
};
