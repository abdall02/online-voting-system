const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Election = require('./models/Election');
const Candidate = require('./models/Candidate');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Election.deleteMany();
        await Candidate.deleteMany();

        // Create Admin
        const admin = await User.create({
            name: 'UOB Admin',
            email: 'uobgadmin@gmail.com',
            phone: '+1111111111',
            password: 'uobg123',
            role: 'admin',
            phoneVerified: true,
            studentId: 'ADMIN001'
        });

        // Create Voter
        const voter = await User.create({
            name: 'John Voter',
            email: 'voter@example.com',
            phone: '+2222222222',
            password: 'password123',
            role: 'voter',
            phoneVerified: true
        });

        // Create Election
        const election = await Election.create({
            title: 'National Tech Awards 2026',
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

        // Create Candidates
        await Candidate.create([
            {
                name: 'Alice Software',
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
                electionId: election._id,
                voteCount: 15
            },
            {
                name: 'Bob Hardware',
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
                electionId: election._id,
                voteCount: 22
            },
            {
                name: 'Charlie Cyber',
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
                electionId: election._id,
                voteCount: 8
            }
        ]);

        console.log('Dummy data seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
