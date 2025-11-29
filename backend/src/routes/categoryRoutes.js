
const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(categoryController.getCategories) 
  .post(protect, authorize('admin', 'staff'), categoryController.createCategory); 

router.route('/:id')
  .get(categoryController.getCategory) 
  .put(protect, authorize('admin', 'staff'), categoryController.updateCategory) 
  .delete(protect, authorize('admin'), categoryController.deleteCategory); 

module.exports = router;