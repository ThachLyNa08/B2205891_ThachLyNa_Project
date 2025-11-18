
const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-intent', protect, authorize('reader', 'staff', 'admin'), paymentController.createPaymentIntent);
router.post('/:id/process', protect, authorize('reader', 'staff', 'admin'), paymentController.processPayment); // User cũng có thể "trigger" thanh toán từ frontend
router.route('/')
    .get(protect, authorize('reader', 'staff', 'admin'), paymentController.getPayments); // Get all payments (admin/staff) or user's payments (reader)

router.route('/:id')
    .get(protect, authorize('reader', 'staff', 'admin'), paymentController.getPayment); // Get specific payment


module.exports = router;