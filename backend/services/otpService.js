const OTP = require('../models/OTP');
const sendSMS = require('../utils/sendSMS');

const generateOTP = async (phone) => {
    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove any existing OTP for this phone
    await OTP.deleteMany({ phone });

    // Save new OTP
    await OTP.create({ phone, code, expiresAt });

    // Send SMS
    await sendSMS(phone, `Your Online Voting System verification code is: ${code}`);

    return code;
};

const verifyOTP = async (phone, code) => {
    const otpDoc = await OTP.findOne({ phone, code });

    if (!otpDoc) {
        return false;
    }

    if (otpDoc.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: otpDoc._id });
        return false;
    }

    // OTP is valid
    await OTP.deleteOne({ _id: otpDoc._id });
    return true;
};

module.exports = { generateOTP, verifyOTP };
