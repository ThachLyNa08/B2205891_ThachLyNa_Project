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
  ngayHenTra: { // Ngày dự kiến trả
    type: Date,
    required: true
  },
  ngayTraThucTe: { // Ngày khách trả thật
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'borrowed', 'returned', 'overdue', 'cancelled'],
    default: 'pending' // Nên set là 'borrowed' khi admin duyệt cho mượn
  },
  
  // --- NHÓM CHI PHÍ THUÊ ---
  rentCost: { // Tiền thuê sách (Phí mượn)
    type: Number,
    default: 0
  },
  deposit: { // Tiền cọc
    type: Number,
    default: 0
  },
  isPaid: { // Đã thanh toán phí thuê/cọc chưa?
    type: Boolean,
    default: false
  },

  // --- NHÓM CHI PHÍ PHẠT (QUAN TRỌNG) ---
  phatTien: { 
    type: Number,
    default: 0
  },
  lyDoPhat: { // Lưu lý do: "Quá hạn 3 ngày"
    type: String,
    default: ''
  },
  isFinePaid: { // Đã đóng tiền phạt chưa? (Tách riêng với isPaid của tiền thuê)
    type: Boolean,
    default: false
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware cập nhật thời gian
loanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;