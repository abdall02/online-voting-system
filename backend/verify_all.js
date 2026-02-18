const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: __dirname + '/.env' });

const verifyAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.updateMany({}, { phoneVerified: true });
        console.log(`Updated ${result.modifiedCount} users to verified status.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyAllUsers();
