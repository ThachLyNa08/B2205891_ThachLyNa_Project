
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Nếu thanh toán liên quan đến một khoản mượn cụ thể (ví dụ: tiền phạt)
  loanId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    default: null
  },
  // Số tiền thanh toán
  amount: { 
    type: Number,
    required: true,
    min: 0
  },
  // Loại thanh toán (fine, deposit, other)
  paymentType: { 
    type: String,
    enum: ['fine', 'deposit', 'other'],
    required: true
  },
  // Trạng thái thanh toán
  status: { 
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  // ID giao dịch từ cổng thanh toán (Stripe, PayPal)
  paymentGatewayId: { 
    type: String,
    trim: true
  },
  paidAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;