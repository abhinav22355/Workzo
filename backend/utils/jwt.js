const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'workzo_jwt_secret_production_2026_super_key';

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
