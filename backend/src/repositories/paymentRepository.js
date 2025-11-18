const Payment = require('../models/payment');

const getPayments = async (query = {}, pagination = {}) => {
  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate('userId', 'username email')
    .populate('loanId', 'bookId status phatTien')
    .sort({ createdAt: -1 })
    .skip((pagination.page - 1) * pagination.limit)
    .limit(pagination.limit);
  return { payments, total };
};

const getPaymentById = async (id) => {
  return await Payment.findById(id)
    .populate('userId', 'username email')
    .populate('loanId', 'bookId status phatTien');
};

const createPayment = async (paymentData) => {
  const newPayment = new Payment(paymentData);
  return await newPayment.save();
};

const updatePayment = async (id, updateData) => {
  return await Payment.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment
};