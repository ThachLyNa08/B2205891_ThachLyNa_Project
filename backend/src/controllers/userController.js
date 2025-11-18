
const userService = require('../services/userService');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin or User itself
const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Cho phép user xem profile của mình, hoặc admin/staff xem user khác
    if (req.user._id.toString() === req.params.id || ['admin', 'staff'].includes(req.user.role)) {
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
    // Basic validation, more advanced validation can be added later
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

    // Chỉ admin/staff mới có thể cập nhật role của người khác
    // Người dùng chỉ có thể cập nhật role của chính họ
    if (updateData.role && req.user._id.toString() !== userId && !['admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized to change user role.' });
    }

    // Người dùng chỉ có thể cập nhật profile của mình, admin/staff có thể cập nhật user khác
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
    // Admin không thể tự xóa tài khoản của mình qua API này
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

        // Chỉ user có thể cập nhật password của chính mình
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


module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updatePassword
};