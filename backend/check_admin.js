const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: __dirname + '/.env' });

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ email: 'uobgadmin@gmail.com' });
        if (admin) {
            console.log('Admin found in Atlas DB!');
            console.log('Name:', admin.name);
            console.log('Role:', admin.role);
        } else {
            console.log('Admin NOT FOUND in Atlas DB.');
        }
        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkAdmin();
