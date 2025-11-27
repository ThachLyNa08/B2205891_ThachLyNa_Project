const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // <--- 1. Import middleware upload

const router = express.Router();

// --- ROUTES UPLOAD ẢNH (Thêm mới) ---
// Frontend gọi: POST /api/users/:id/avatar
router.post('/:id/avatar', protect, upload.single('avatar'), userController.uploadAvatar);

// Frontend gọi: POST /api/users/:id/cover
router.post('/:id/cover', protect, upload.single('cover'), userController.uploadCover);
router.get('/top-readers', userController.getTopReaders);
router.get('/favorites', protect, userController.getFavorites);
router.post('/favorites', protect, userController.addFavorite);
router.delete('/favorites/:bookId', protect, userController.removeFavorite);
// --- CÁC ROUTES CŨ ---

// Routes for Admin only (manage all users)
router.route('/')
  .get(protect, authorize('admin', 'staff'), userController.getUsers)
  .post(protect, authorize('admin'), userController.createUser);

// Route for updating password
router.put('/:id/password', protect, userController.updatePassword);

// Routes for specific user
router.route('/:id')
  .get(protect, userController.getUser)
  .put(protect, userController.updateUser)
  .delete(protect, authorize('admin'), userController.deleteUser);

module.exports = router;