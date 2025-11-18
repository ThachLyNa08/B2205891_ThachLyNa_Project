const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Get current logged-in user's profile
router.get('/me', protect, userController.getUser); // New route to get current user's info

// Routes for Admin only (manage all users)
router.route('/')
  .get(protect, authorize('admin', 'staff'), userController.getUsers) // Get all users, only admin/staff
  .post(protect, authorize('admin'), userController.createUser); // Create user, only admin

// Routes for specific user (or admin/staff managing specific user)
router.route('/:id')
  .get(protect, userController.getUser) // Get user profile (user itself, admin, staff)
  .put(protect, userController.updateUser) // Update user profile (user itself, admin, staff)
  .delete(protect, authorize('admin'), userController.deleteUser); // Delete user, only admin

// Route for updating password
router.put('/:id/password', protect, userController.updatePassword);


module.exports = router;