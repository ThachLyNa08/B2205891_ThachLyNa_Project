const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  // 1. Kiểm tra xem có token trong header không
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token
      token = req.headers.authorization.split(' ')[1];

      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- QUAN TRỌNG: TÌM USER ---
      // Lưu ý: decoded.id hay decoded.userId phụ thuộc vào file authController lúc bạn sign token.
      // Mình dùng (decoded.id || decoded.userId) để bắt cả 2 trường hợp cho chắc ăn.
      const user = await User.findById(decoded.id || decoded.userId).select('-password');

      // --- SỬA LỖI NULL TẠI ĐÂY ---
      // Nếu token hợp lệ nhưng User không còn trong DB (đã bị xóa)
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Gán user vào request
      req.user = user;
      
      // Không cần gán req.user.role = decoded.role nữa vì trong biến 'user' lấy từ DB đã có role rồi.
      // Điều này an toàn hơn (tránh trường hợp token cũ role admin nhưng DB đã hạ xuống user).

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      
      // Phân loại lỗi để Frontend dễ xử lý (hết hạn vs sai token)
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware kiểm tra quyền (Admin, Staff...)
const authorize = (...roles) => {
  return (req, res, next) => {
    // Kiểm tra kỹ req.user để tránh lỗi crash
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };