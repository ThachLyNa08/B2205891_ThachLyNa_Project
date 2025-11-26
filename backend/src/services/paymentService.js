// backend/src/services/paymentService.js
const paymentRepository = require('../repositories/paymentRepository');
const loanRepository = require('../repositories/loanRepository');
const User = require('../models/user');

// [MỚI] Hàm escape regex
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
};
const mockProcessPayment = async (amount, currency, paymentMethod) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 'succeeded', transactionId: `mock_txn_${Date.now()}` });
    }, 500);
  });
};

const createPaymentIntent = async (userId, loanId, amount, paymentType) => {
    if (loanId) {
        const loan = await loanRepository.getLoanById(loanId);
        if (!loan) throw new Error('Associated loan not found.');
    }
    // Bỏ qua các check phức tạp, tạo luôn payment
    const newPayment = await paymentRepository.createPayment({
        userId,
        loanId,
        amount,
        paymentType,
        status: 'pending'
    });
    return newPayment;
};

const processPayment = async (paymentId, paymentMethod, billingDetails) => {
    const payment = await paymentRepository.getPaymentById(paymentId);
    if (!payment) throw new Error('Payment intent not found.');
    if (payment.status !== 'pending') throw new Error('Payment already processed.');

    const gatewayResponse = await mockProcessPayment(payment.amount, 'VND', paymentMethod);

    const updatedPayment = await paymentRepository.updatePayment(paymentId, {
      paymentGatewayId: gatewayResponse.transactionId,
      paidAt: new Date(),
      status: gatewayResponse.status === 'succeeded' ? 'completed' : 'failed',
      
      // LƯU THÔNG TIN VÀO ĐÂY
      billingDetails: billingDetails 
    });

    if (updatedPayment.status === 'completed' && updatedPayment.loanId) {
        await loanRepository.updateLoan(updatedPayment.loanId._id, { isPaid: true });
    }

    return updatedPayment;
};

// [SỬA] Viết lại hàm getPayments để xử lý tìm kiếm
const getPayments = async (filter, pagination) => {
    // Tách các tham số query cơ bản
    const query = {};
    if (filter.status) query.status = filter.status;
    if (filter.userId) query.userId = filter.userId;

    // XỬ LÝ TÌM KIẾM (SEARCH)
    if (filter.search) {
        const safeSearch = escapeRegExp(filter.search);
        const searchRegex = new RegExp(safeSearch, 'i');

        // 1. Tìm User ID khớp với tên/email
        const users = await User.find({
            $or: [
                { username: { $regex: searchRegex } },
                { email: { $regex: searchRegex } }
            ]
        }).select('_id');
        const userIds = users.map(u => u._id);

        // 2. Tạo query phức hợp:
        // - Hoặc là User ID khớp (người dùng hệ thống)
        // - Hoặc là Billing Name khớp (tên người thanh toán)
        // - Hoặc là Billing Phone khớp (sđt người thanh toán)
        query.$or = [
            { userId: { $in: userIds } },
            { 'billingDetails.name': { $regex: searchRegex } },
            { 'billingDetails.phone': { $regex: searchRegex } }
        ];
    }

    // Gọi Repository (Giả sử repository hỗ trợ nhận query object MongoDB chuẩn)
    return paymentRepository.getPayments(query, pagination);
};
const getPaymentById = async (id) => paymentRepository.getPaymentById(id);

module.exports = {
  createPaymentIntent,
  processPayment,
  getPayments,
  getPaymentById
};