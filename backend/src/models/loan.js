
const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu đến model User
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book', // Tham chiếu đến model Book
    required: true
  },
  ngayMuon: {
    type: Date,
    default: Date.now
  },
  ngayHenTra: { // Ngày hẹn trả sách
    type: Date,
    required: true
  },
  ngayTraThucTe: { // Ngày trả sách thực tế
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'borrowed', 'returned', 'overdue', 'cancelled'], // Các trạng thái có thể
    default: 'pending'
  },
  phatTien: { // Tiền phạt (nếu có)
    type: Number,
    default: 0,
    min: 0
  },
  deposit: { // Tiền đặt cọc (nếu có)
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Cập nhật updatedAt mỗi khi save
loanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;