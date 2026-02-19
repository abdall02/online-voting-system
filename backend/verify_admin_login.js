const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: __dirname + '/.env' });

const verifyAdminLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'uobgadmin@gmail.com';
        const password = 'uobg123';

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('Admin not found in Database.');
            process.exit();
        }

        const isMatch = await user.matchPassword(password);
        console.log(`Password 'uobg123' match result:`, isMatch);

        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

verifyAdminLogin();
