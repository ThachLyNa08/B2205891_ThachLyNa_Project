const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 

const router = express.Router();

router.post('/:id/avatar', protect, upload.single('avatar'), userController.uploadAvatar);

router.post('/:id/cover', protect, upload.single('cover'), userController.uploadCover);
router.get('/top-readers', userController.getTopReaders);
router.get('/favorites', protect, userController.getFavorites);
router.post('/favorites', protect, userController.addFavorite);
router.delete('/favorites/:bookId', protect, userController.removeFavorite);

// Routes for Admin only 
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