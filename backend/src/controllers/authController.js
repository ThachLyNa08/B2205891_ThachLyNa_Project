const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { username, email, password, role, hoLot, ten, ngaySinh, gioiTinh, diaChi, dienThoai } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }

    const userData = { username, email, password, role, hoLot, ten, ngaySinh, gioiTinh, diaChi, dienThoai };
    const { user, token, refreshToken } = await authService.registerUser(userData);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,      
        coverImage: user.coverImage
      },
      token
    });
  } catch (error) {
    if (error.message.includes('Username or Email already exists')) {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password.' });
    }

    const { user, token, refreshToken } = await authService.loginUser(emailOrUsername, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        coverImage: user.coverImage
      },
      token
    });
  } catch (error) {
    if (error.message.includes('Invalid credentials')) {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
};

const refresh = async (req, res, next) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        if (!oldRefreshToken) {
            return res.status(401).json({ message: 'No refresh token provided.' });
        }
        const { token, refreshToken: newRefreshToken } = await authService.refreshToken(oldRefreshToken);
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: 'Token refreshed successfully',
            token
        });
    } catch (error) {
        if (error.message.includes('Invalid or expired refresh token')) {
            return res.status(403).json({ message: error.message });
        }
        next(error);
    }
};

module.exports = {
  register,
  login,
  refresh
};