
const User = require('../models/user');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN;

const registerUser = async (userData) => {
  const { username, email, password, role } = userData;

  // Kiểm tra user/email đã tồn tại chưa
  let user = await User.findOne({ $or: [{ username }, { email }] });
  if (user) {
    throw new Error('Username or Email already exists.');
  }

  // Hash mật khẩu
  const hashedPassword = await hashPassword(password);

  // Tạo user mới
  user = new User({
    username,
    email,
    password: hashedPassword,
    role: role || 'reader' // Mặc định là reader nếu không chỉ định
  });
  await user.save();

  // Tạo JWT và Refresh Token
  const payload = { userId: user._id, role: user.role };
  const token = generateToken(payload, JWT_SECRET, JWT_EXPIRES_IN);
  const refreshToken = generateToken(payload, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN);

  return { user, token, refreshToken };
};

const loginUser = async (emailOrUsername, password) => {
  // Tìm user theo email hoặc username
  const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
  if (!user) {
    throw new Error('Invalid credentials.');
  }

  // So sánh mật khẩu
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials.');
  }

  // Tạo JWT và Refresh Token
  const payload = { userId: user._id, role: user.role };
  const token = generateToken(payload, JWT_SECRET, JWT_EXPIRES_IN);
  const refreshToken = generateToken(payload, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN);

  return { user, token, refreshToken };
};

// TODO: Thêm logic refresh token sau
const refreshToken = async (oldRefreshToken) => {
    try {
        const decoded = jwt.verify(oldRefreshToken, REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new Error('Invalid refresh token.');
        }

        const payload = { userId: user._id, role: user.role };
        const newToken = generateToken(payload, JWT_SECRET, JWT_EXPIRES_IN);
        // Có thể tạo refresh token mới hoặc tái sử dụng cái cũ tùy chiến lược
        const newRefreshToken = generateToken(payload, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN); // Tạo mới refresh token

        return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
        throw new Error('Invalid or expired refresh token.');
    }
};


module.exports = {
  registerUser,
  loginUser,
  refreshToken
};