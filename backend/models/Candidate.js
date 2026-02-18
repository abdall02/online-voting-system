const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a candidate name']
    },
    image: {
        type: String,
        default: 'no-photo.jpg'
    },
    electionId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Election',
        required: true
    },
    voteCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Candidate', candidateSchema);
