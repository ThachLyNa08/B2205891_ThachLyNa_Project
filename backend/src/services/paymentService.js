const paymentRepository = require('../repositories/paymentRepository');
const loanRepository = require('../repositories/loanRepository');
const mongoose = require('mongoose');

// Mock Payment Gateway function
const mockProcessPayment = async (amount, currency, paymentMethod) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate for mock
      if (success) {
        resolve({ status: 'succeeded', transactionId: `mock_txn_${Date.now()}` });
      } else {
        resolve({ status: 'failed', error: 'Mock payment failed.' });
      }
    }, 1000); // Simulate network delay
  });
};


const createPaymentIntent = async (userId, loanId, amount, paymentType) => {
    // Nếu có loanId, kiểm tra xem khoản vay có tồn tại không
    if (loanId) {
        const loan = await loanRepository.getLoanById(loanId);
        if (!loan) {
            throw new Error('Associated loan not found.');
        }
        // Có thể thêm logic kiểm tra xem khoản vay này có cần thanh toán không (ví dụ: phạt > 0)
        if (paymentType === 'fine' && loan.phatTien === 0) {
            throw new Error('No fine amount to pay for this loan.');
        }
        if (paymentType === 'fine' && amount < loan.phatTien) {
            throw new Error('Payment amount is less than the actual fine.');
        }
    }

    const newPayment = await paymentRepository.createPayment({
        userId,
        loanId,
        amount,
        paymentType,
        status: 'pending' // Ban đầu là pending
    });
    return newPayment;
};

const processPayment = async (paymentId, paymentMethod) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const payment = await paymentRepository.getPaymentById(paymentId);
    if (!payment) {
      throw new Error('Payment intent not found.');
    }
    if (payment.status !== 'pending') {
      throw new Error('Payment has already been processed or is not pending.');
    }

    // Call mock payment gateway
    const gatewayResponse = await mockProcessPayment(payment.amount, 'VND', paymentMethod);

    const updateData = {
      paymentGatewayId: gatewayResponse.transactionId || null,
      paidAt: gatewayResponse.status === 'succeeded' ? new Date() : null,
      status: gatewayResponse.status === 'succeeded' ? 'completed' : 'failed'
    };

    const updatedPayment = await paymentRepository.updatePayment(paymentId, updateData);

    // Nếu thanh toán thành công và là tiền phạt, cập nhật trạng thái của Loan
    if (updatedPayment.status === 'completed' && updatedPayment.loanId && updatedPayment.paymentType === 'fine') {
      const loan = await loanRepository.getLoanById(updatedPayment.loanId);
      if (loan && loan.status === 'overdue') {
        await loanRepository.updateLoan(loan._id, { status: 'returned' }); // Đổi trạng thái từ overdue sang returned
        // TODO: Gửi notification cho user rằng tiền phạt đã được thanh toán và sách đã được trả
      }
    }

    await session.commitTransaction();
    session.endSession();

    return updatedPayment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


const getPayments = async (query, pagination) => {
  return await paymentRepository.getPayments(query, pagination);
};

const getPaymentById = async (paymentId) => {
    const payment = await paymentRepository.getPaymentById(paymentId);
    if (!payment) {
        throw new Error('Payment not found.');
    }
    return payment;
};

module.exports = {
  createPaymentIntent,
  processPayment,
  getPayments,
  getPaymentById
};