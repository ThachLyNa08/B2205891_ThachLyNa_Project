const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 

// Group 1: /api/books
router.route('/')
  .get(bookController.getBooks) // Public: Xem danh sách
  .post(
    protect, 
    authorize('admin', 'staff'), 
    upload.single('coverImage'), // <--- Đặt middleware upload vào đây
    bookController.createBook
  );

// Group 2: /api/books/:id
router.route('/:id')
  .get(bookController.getBook) // Public: Xem chi tiết
  .put(
    protect, 
    authorize('admin', 'staff'), 
    upload.single('coverImage'), // <--- Đặt middleware upload vào đây
    bookController.updateBook
  )
  .delete(
    protect, 
    authorize('admin'), 
    bookController.deleteBook
  );

// --- XÓA CÁC DÒNG KHAI BÁO TRÙNG LẶP Ở CUỐI FILE ĐI ---

module.exports = router;