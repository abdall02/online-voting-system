const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.error('Authorize middleware called but req.user is undefined');
            return res.status(401).json({ success: false, message: 'Not authorized - No user session' });
        }

        if (!roles.includes(req.user.role)) {
            console.log(`Access denied for role: ${req.user.role}. Required: ${roles}`);
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }

        console.log(`Access granted for role: ${req.user.role}`);
        if (typeof next === 'function') {
            next();
        } else {
            console.error('next is not a function in authorize middleware!');
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    };
};

module.exports = { protect, authorize };
