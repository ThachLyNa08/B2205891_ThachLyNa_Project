// backend/src/services/paymentService.js
const paymentRepository = require('../repositories/paymentRepository');
const loanRepository = require('../repositories/loanRepository');

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

const processPayment = async (paymentId, paymentMethod) => {
    // BỎ transaction session
    const payment = await paymentRepository.getPaymentById(paymentId);
    if (!payment) throw new Error('Payment intent not found.');
    if (payment.status !== 'pending') throw new Error('Payment already processed.');

    // Gọi giả lập thanh toán
    const gatewayResponse = await mockProcessPayment(payment.amount, 'VND', paymentMethod);

    // Cập nhật Payment
    const updatedPayment = await paymentRepository.updatePayment(paymentId, {
      paymentGatewayId: gatewayResponse.transactionId,
      paidAt: new Date(),
      status: gatewayResponse.status === 'succeeded' ? 'completed' : 'failed'
    });

    // Nếu thanh toán thành công -> Cập nhật Loan là đã trả tiền
    if (updatedPayment.status === 'completed' && updatedPayment.loanId) {
        await loanRepository.updateLoan(updatedPayment.loanId._id, { isPaid: true });
    }

    return updatedPayment;
};

const getPayments = async (query, pagination) => paymentRepository.getPayments(query, pagination);
const getPaymentById = async (id) => paymentRepository.getPaymentById(id);

module.exports = {
  createPaymentIntent,
  processPayment,
  getPayments,
  getPaymentById
};