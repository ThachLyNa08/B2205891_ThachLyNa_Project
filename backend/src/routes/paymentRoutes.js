const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-intent', protect, authorize('reader', 'staff', 'admin'), paymentController.createPaymentIntent);

// Xử lý thanh toán
router.post('/:id/process', protect, authorize('reader', 'staff', 'admin'), paymentController.processPayment);

router.route('/')
    .get(protect, authorize('reader', 'staff', 'admin'), paymentController.getPayments);

// Xem chi tiết 1 giao dịch
router.route('/:id')
    .get(protect, authorize('reader', 'staff', 'admin'), paymentController.getPayment);


module.exports = router;