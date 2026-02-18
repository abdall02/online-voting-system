const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const Election = require('./models/Election');
require('dotenv').config({ path: __dirname + '/.env' });

const checkLinks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const elections = await Election.find();
        console.log('Elections:', elections.map(e => ({ id: e._id, title: e.title })));
        const candidates = await Candidate.find();
        console.log('Candidates:', candidates.map(c => ({ id: c._id, name: c.name, electionId: c.electionId })));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkLinks();
