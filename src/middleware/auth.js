// Authentication Middleware - JWT verification with blacklist support
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Shared blacklist reference — set via setBlacklist() so server.js can inject it.
let tokenBlacklist = null;

function setBlacklist(blacklistRef) {
    tokenBlacklist = blacklistRef;
}

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    // Check blacklist
    if (tokenBlacklist && tokenBlacklist.has(token)) {
        return res.status(401).json({ success: false, message: 'Token has been invalidated. Please log in again.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bright_star_secret');
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

// Authorize specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Role ${req.user.role} is not authorized to access this route` 
            });
        }
        next();
    };
};

module.exports = { protect, authorize, setBlacklist };
