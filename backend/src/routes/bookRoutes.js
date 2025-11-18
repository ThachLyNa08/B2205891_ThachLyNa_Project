
const express = require('express');
const bookController = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(bookController.getBooks) // Public access for listing books
  .post(protect, authorize('admin', 'staff'), bookController.createBook); // Admin/Staff to create books

router.route('/:id')
  .get(bookController.getBook) // Public access for single book detail
  .put(protect, authorize('admin', 'staff'), bookController.updateBook) // Admin/Staff to update books
  .delete(protect, authorize('admin'), bookController.deleteBook); // Admin to delete books

module.exports = router;