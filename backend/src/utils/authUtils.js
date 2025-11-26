
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (payload, secret, expiresIn) => {
  // Thay vì dùng biến expiresIn từ bên ngoài (có thể đang là '1h'),
  // ta ép cứng thành '30d' (30 ngày) để thoải mái code mà không bị văng ra.
  return jwt.sign(payload, secret, { expiresIn: '30d' });
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10); 
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword
};