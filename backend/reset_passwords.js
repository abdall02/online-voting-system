const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: __dirname + '/.env' });

const resetPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Reset Admin
        const admin = await User.findOne({ email: 'uobgadmin@gmail.com' });
        if (admin) {
            admin.password = 'uobg123';
            await admin.save();
            console.log('Admin password reset to: uobg123');
        } else {
            console.log('Admin user not found!');
        }

        // Reset Student (Abdalle Ali)
        const student = await User.findOne({ email: 'abdalle@gmail.com' });
        if (student) {
            student.password = 'uobg123';
            await student.save();
            console.log('Student abdalle@gmail.com password reset to: uobg123');
        } else {
            console.log('Student user not found!');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPasswords();
