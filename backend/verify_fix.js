const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: __dirname + '/.env' });

const verifyUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOneAndUpdate(
            { phone: '252907909994' },
            { phoneVerified: true },
            { new: true }
        );
        if (user) {
            console.log(`User ${user.name} is now VERIFIED!`);
        } else {
            console.log('User not found by that phone number.');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyUser();
