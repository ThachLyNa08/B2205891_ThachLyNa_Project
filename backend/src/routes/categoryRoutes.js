
const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(categoryController.getCategories) // Public access
  .post(protect, authorize('admin', 'staff'), categoryController.createCategory); // Admin/Staff to create categories

router.route('/:id')
  .get(categoryController.getCategory) // Public access
  .put(protect, authorize('admin', 'staff'), categoryController.updateCategory) // Admin/Staff to update categories
  .delete(protect, authorize('admin'), categoryController.deleteCategory); // Admin to delete categories

module.exports = router;