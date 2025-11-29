const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, userController.getUser); 

// Routes for Admin only 
router.route('/')
  .get(protect, authorize('admin', 'staff'), userController.getUsers) 
  .post(protect, authorize('admin'), userController.createUser); 

// Routes for specific user 
router.route('/:id')
  .get(protect, userController.getUser) 
  .put(protect, userController.updateUser) 
  .delete(protect, authorize('admin'), userController.deleteUser); 

// Route for updating password
router.put('/:id/password', protect, userController.updatePassword);


module.exports = router;