const mongoose = require('mongoose');
const User = require('./models/User');
const Election = require('./models/Election');
require('dotenv').config({ path: __dirname + '/.env' });

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find();
        console.log('Users hasVoted status:', users.map(u => ({ name: u.name, hasVoted: u.hasVoted, role: u.role })));
        const elections = await Election.find();
        console.log('Elections status:', elections.map(e => ({ title: e.title, status: e.status })));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkStatus();
