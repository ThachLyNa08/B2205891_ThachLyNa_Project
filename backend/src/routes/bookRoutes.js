const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 

router.route('/')
  .get(bookController.getBooks)
  .post(
    protect, 
    authorize('admin', 'staff'), 
    upload.single('coverImage'), 
    bookController.createBook
  );
router.get('/top-borrowed', bookController.getTopBooks);

router.route('/:id')
  .get(bookController.getBook) 
  .put(
    protect, 
    authorize('admin', 'staff'), 
    upload.single('coverImage'),
    bookController.updateBook
  )
  .delete(
    protect, 
    authorize('admin'), 
    bookController.deleteBook
  );

module.exports = router;