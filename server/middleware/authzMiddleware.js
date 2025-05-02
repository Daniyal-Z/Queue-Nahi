const authorize = (allowedRoles) => {
    return (req, res, next) => {
      // 1. Check if user exists (from authenticate middleware)
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Authentication required' 
        });
      }
      // 2. Check if user role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: `Access forbidden. Required roles: ${allowedRoles.join(', ')}`,
          yourRole: req.user.role
        });
      }
      next();
    };
  };
  
  module.exports = { authorize };