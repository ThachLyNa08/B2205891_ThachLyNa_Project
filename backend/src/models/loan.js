const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }, 
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  ngayMuon: {
    type: Date,
    default: Date.now
  },
  ngayHenTra: { 
    type: Date,
    required: true
  },
  ngayTraThucTe: { 
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'borrowed', 'returned', 'overdue', 'cancelled'],
    default: 'pending' 
  },
  
  rentCost: { 
    type: Number,
    default: 0
  },
  deposit: { 
    type: Number,
    default: 0
  },
  isPaid: { 
    type: Boolean,
    default: false
  },

  phatTien: { 
    type: Number,
    default: 0
  },
  lyDoPhat: { 
    type: String,
    default: ''
  },
  isFinePaid: { 
    type: Boolean,
    default: false
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

loanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;