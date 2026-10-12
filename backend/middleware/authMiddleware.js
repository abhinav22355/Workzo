const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

// Protect routes - verify JWT token and user status
const requireAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is suspended. Please contact Workzo support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Customer role guard
const requireCustomer = (req, res, next) => {
  if (req.user && (req.user.role === 'customer' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Customer privileges required.' });
  }
};

// Worker role guard
const requireWorker = (req, res, next) => {
  if (req.user && (req.user.role === 'worker' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Worker privileges required.' });
  }
};

// Admin role guard
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
  }
};

module.exports = {
  requireAuth,
  requireCustomer,
  requireWorker,
  requireAdmin,
};
