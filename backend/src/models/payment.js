const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    default: null
  },
  amount: { 
    type: Number,
    required: true,
    min: 0
  },
  paymentType: { 
    type: String,
    enum: ['fine', 'deposit', 'rent', 'rent_and_fine', 'other'], 
    required: true
  },
  status: { 
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentGatewayId: { 
    type: String,
    trim: true
  },
  billingDetails: {
    name: { type: String },
    phone: { type: String }
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