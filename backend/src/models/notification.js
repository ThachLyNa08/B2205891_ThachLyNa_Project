const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true }, // Tiêu đề: "Sắp đến hạn", "Quá hạn"
  message: { type: String, required: true }, // Nội dung chi tiết
  type: { type: String, enum: ['info', 'warning', 'error'], default: 'info' }, // warning=sắp hết, error=quá hạn
  isRead: { type: Boolean, default: false }, // Đã xem chưa
  link: { type: String, default: '' } // Link bấm vào (ví dụ trỏ tới trang chi tiết sách)
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);