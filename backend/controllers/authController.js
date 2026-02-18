const User = require('../models/User');
const Election = require('../models/Election');
const generateToken = require('../utils/generateToken');
const { generateOTP, verifyOTP } = require('../services/otpService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password, role, studentId } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { phone }, { studentId }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
            role: role || 'voter',
            studentId,
            phoneVerified: true // Automatically verify for now
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyPhone = async (req, res, next) => {
    try {
        const { phone, code } = req.body;
        console.log(`Verifying phone: ${phone} with code: ${code}`);

        // DEVELOPERS: Remove "code === '123456' ||" before publishing for production!
        const isValid = code === '123456' || await verifyOTP(phone, code);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Find user
        let user = await User.findOne({ phone });
        if (!user) {
            const suffix = phone.slice(-9);
            user = await User.findOne({ phone: new RegExp(suffix + '$') });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found in database' });
        }

        user.phoneVerified = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Phone verified successfully',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, studentId, password } = req.body;

        // Check for user by email OR studentId
        const query = email ? { email } : { studentId };
        console.log('Login attempt with query:', query);
        const user = await User.findOne(query).select('+password');

        if (!user) {
            console.log('User not found in DB');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        console.log('Password match result:', isMatch);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Phone verification check removed as per request

        res.status(200).json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all voters (students)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'voter' }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a voter (student)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot delete an admin account' });
        }
        await user.deleteOne();
        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
        next(err);
    }
};
