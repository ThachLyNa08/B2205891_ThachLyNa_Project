const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, // Điểm sao 1-5
  comment: { type: String, required: true }, // Nội dung bình luận
}, { timestamps: true });

// Đảm bảo mỗi user chỉ được review 1 lần cho 1 cuốn sách (Tùy chọn)
reviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);