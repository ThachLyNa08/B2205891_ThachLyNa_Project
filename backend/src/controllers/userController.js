const userService = require('../services/userService');

// @desc    Get all users (with search support)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    // [MỚI] Lấy từ khóa tìm kiếm từ URL
    const search = req.query.search;
    
    // [SỬA] Truyền biến search vào hàm getAllUsers
    const users = await userService.getAllUsers(search);
    
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID or current logged-in user
// @route   GET /api/users/:id or /api/users/me
// @access  Private/Admin or User itself
const getUser = async (req, res, next) => {
    try {
        const userIdToFetch = req.params.id === 'me' ? req.user._id : req.params.id;
        const user = await userService.getUserById(userIdToFetch);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (req.user._id.toString() === userIdToFetch.toString() || ['admin', 'staff'].includes(req.user.role)) {
            res.status(200).json(user);
        } else {
            res.status(403).json({ message: 'Not authorized to view this user profile.' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a user (for admin panel)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }
    const newUser = await userService.createUser(req.body);
    res.status(201).json({ message: 'User created successfully.', user: newUser });
  } catch (error) {
    if (error.message.includes('Username or Email already exists')) {
        return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private/Admin or User itself
const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Logic kiểm tra quyền hạn (chỉ admin mới được sửa role, v.v...)
    if (updateData.role && req.user._id.toString() !== userId && !['admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized to change user role.' });
    }

    if (req.user._id.toString() !== userId && !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this user profile.' });
    }

    const updatedUser = await userService.updateUser(userId, updateData);
    res.status(200).json({ message: 'User updated successfully.', user: updatedUser });
  } catch (error) {
    if (error.message.includes('User not found')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
        return res.status(400).json({ message: 'Cannot delete your own account via this route.' });
    }
    const result = await userService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('User not found')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Private/User itself
const updatePassword = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this password.' });
        }

        const result = await userService.updatePassword(userId, newPassword);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('User not found')) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

// @desc    Upload Avatar
// @route   POST /api/users/:id/avatar
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh.' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const userId = req.params.id;
    const updatedUser = await userService.updateUser(userId, { avatar: imageUrl });

    res.status(200).json({
      message: 'Avatar updated successfully',
      avatar: imageUrl,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload Cover Image
// @route   POST /api/users/:id/cover
const uploadCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh.' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const userId = req.params.id;
    const updatedUser = await userService.updateUser(userId, { coverImage: imageUrl });

    res.status(200).json({
      message: 'Cover image updated successfully',
      coverImage: imageUrl,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
const getFavorites = async (req, res, next) => {
    try {
        // req.user lấy từ middleware protect
        const favorites = await userService.getFavorites(req.user._id);
        res.status(200).json(favorites);
    } catch (error) { next(error); }
};

const addFavorite = async (req, res, next) => {
    try {
        const { bookId } = req.body;
        const favorites = await userService.addFavorite(req.user._id, bookId);
        res.status(200).json({ message: 'Added to favorites', favorites });
    } catch (error) { next(error); }
};

const removeFavorite = async (req, res, next) => {
    try {
        const { bookId } = req.params;
        const favorites = await userService.removeFavorite(req.user._id, bookId);
        res.status(200).json({ message: 'Removed from favorites', favorites });
    } catch (error) { next(error); }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  uploadAvatar,
  uploadCover,
  getFavorites,
  addFavorite,
  removeFavorite
};