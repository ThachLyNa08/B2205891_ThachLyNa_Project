const paymentRepository = require('../repositories/paymentRepository');
const loanRepository = require('../repositories/loanRepository');
const User = require('../models/user');

// Giả lập thanh toán qua cổng (Momo/Stripe...)
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
    const newPayment = await paymentRepository.createPayment({
        userId,
        loanId,
        amount,
        paymentType,
        status: 'pending'
    });
    return newPayment;
};

// [SỬA QUAN TRỌNG TẠI ĐÂY]
const processPayment = async (paymentId, paymentMethod, billingDetails) => {
    const payment = await paymentRepository.getPaymentById(paymentId);
    if (!payment) throw new Error('Payment intent not found.');
    if (payment.status !== 'pending') throw new Error('Payment already processed.');

    // 1. Gọi Mock Gateway
    const gatewayResponse = await mockProcessPayment(payment.amount, 'VND', paymentMethod);

    // 2. Cập nhật Payment
    const updatedPayment = await paymentRepository.updatePayment(paymentId, {
      paymentGatewayId: gatewayResponse.transactionId,
      paidAt: new Date(),
      status: gatewayResponse.status === 'succeeded' ? 'completed' : 'failed',
      billingDetails: billingDetails 
    });

    // 3. CẬP NHẬT TRẠNG THÁI LOAN (Cập nhật cả Rent và Fine)
    if (updatedPayment.status === 'completed' && updatedPayment.loanId) {
        
        const updateData = {};

        // Tùy vào loại thanh toán để cập nhật trường tương ứng
        if (updatedPayment.paymentType === 'fine') {
             updateData.isFinePaid = true;
        } else if (updatedPayment.paymentType === 'rent') {
             updateData.isPaid = true;
        } else if (updatedPayment.paymentType === 'rent_and_fine') {
             // Trả cả hai
             updateData.isPaid = true;
             updateData.isFinePaid = true;
        } else {
             // Mặc định cứ set hết là true cho chắc (hoặc giữ logic cũ)
             updateData.isPaid = true;
             updateData.isFinePaid = true;
        }

        await loanRepository.updateLoan(updatedPayment.loanId._id, updateData);
    }

    return updatedPayment;
};

const getPayments = async (filter, pagination) => {
    // ... (Giữ nguyên logic getPayments cũ của bạn)
    // Copy lại phần logic search từ lần sửa trước nếu cần, hoặc dùng bản gốc
    return paymentRepository.getPayments(filter, pagination);
};
const getPaymentById = async (id) => paymentRepository.getPaymentById(id);

module.exports = {
  createPaymentIntent,
  processPayment,
  getPayments,
  getPaymentById
};