const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Tạo yêu cầu thanh toán (nếu tích hợp cổng thanh toán online như Stripe/Momo)
router.post('/create-intent', protect, authorize('reader', 'staff', 'admin'), paymentController.createPaymentIntent);

// Xử lý thanh toán
router.post('/:id/process', protect, authorize('reader', 'staff', 'admin'), paymentController.processPayment);

// Lấy danh sách thanh toán (Lịch sử giao dịch)
// Frontend gọi: GET /api/payments (Kèm token user)
// Controller sẽ tự lọc: Nếu là user thường -> trả về lịch sử của user đó. Nếu admin -> trả về tất cả.
router.route('/')
    .get(protect, authorize('reader', 'staff', 'admin'), paymentController.getPayments);

// Xem chi tiết 1 giao dịch
router.route('/:id')
    .get(protect, authorize('reader', 'staff', 'admin'), paymentController.getPayment);


module.exports = router;