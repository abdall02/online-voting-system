const path = require('path');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

// @desc    Add candidate to election
// @route   POST /api/elections/:electionId/candidates
// @access  Private/Admin
exports.addCandidate = async (req, res, next) => {
    try {
        req.body.electionId = req.params.electionId;

        const election = await Election.findById(req.params.electionId);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        // Handle file upload
        if (req.files && req.files.image) {
            const file = req.files.image;

            // Make sure image is a photo
            if (!file.mimetype.startsWith('image')) {
                return res.status(400).json({ success: false, message: 'Please upload an image file' });
            }

            // Create custom filename
            const fileExt = path.parse(file.name).ext;
            const filename = `party_${req.params.electionId}_${Date.now()}${fileExt}`;

            file.mv(path.join(__dirname, `../public/uploads/${filename}`), async (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Problem with file upload' });
                }
            });

            req.body.image = `/uploads/${filename}`;
        }

        const candidate = await Candidate.create(req.body);
        res.status(201).json({ success: true, data: candidate });
    } catch (err) {
        next(err);
    }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
// @access  Private/Admin
exports.updateCandidate = async (req, res, next) => {
    try {
        let candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: candidate });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private/Admin
exports.deleteCandidate = async (req, res, next) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        await candidate.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
