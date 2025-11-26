const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const reviewController = require('../controllers/reviewController');

// Public: Xem review của sách
router.get('/book/:bookId', reviewController.getBookReviews);

// Protected: User thêm review
router.post('/', protect, reviewController.addReview);

// Admin: Xem tất cả
router.get('/all', protect, authorize('admin', 'staff'), reviewController.getAllReviews);

// Admin/User: Xóa review
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;