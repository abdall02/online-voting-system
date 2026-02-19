const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI || mongoURI.includes('your_mongodb_production_uri_here')) {
            console.error("CRITICAL ERROR: MONGO_URI is not set or is still the placeholder!");
            console.error("Please set MONGO_URI in your Render Environment Variables.");
            process.exit(1);
        }

        const conn = await mongoose.connect(mongoURI);
        console.log("Database connected successfully!");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.log("Database connection error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
