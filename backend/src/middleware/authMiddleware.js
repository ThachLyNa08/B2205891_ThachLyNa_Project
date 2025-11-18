
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 

const JWT_SECRET = process.env.JWT_SECRET;

const protect = async (req, res, next) => {
  let token;

  // Kiểm tra header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Lấy token từ 'Bearer TOKEN'

      const decoded = jwt.verify(token, JWT_SECRET); // Giải mã token
      
      // Tìm user theo ID và gán vào req.user (không bao gồm password)
      req.user = await User.findById(decoded.userId).select('-password');
      req.user.role = decoded.role; // Đảm bảo role được gán vào req.user

      next(); // Chuyển sang middleware/controller tiếp theo
    } catch (error) {
      console.error('Error in authentication middleware:', error);
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

// Middleware để kiểm tra quyền (role-based access control)
const authorize = (...roles) => { // roles là mảng các vai trò được phép (e.g., 'admin', 'staff')
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route.` });
    }
    next();
  };
};

module.exports = { protect, authorize };