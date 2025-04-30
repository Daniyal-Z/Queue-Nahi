// middleware/auth.js (new file)
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authenticateManager = (requiredType) => {
    return (req, res, next) => {
      if (req.user?.role !== 'manager' || 
          (requiredType && req.user?.managerType !== requiredType)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
  };

module.exports = { authenticate, authenticateManager };