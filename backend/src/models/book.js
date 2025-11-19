
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  maSach: { // Optional, có thể dùng _id của Mongo thay thế
    type: String,
    unique: true,
    trim: true
  },
  tenSach: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  moTa: {
    type: String,
    trim: true
  },
  donGia: { // Giá có thể là tiền đặt cọc hoặc giá mua nếu sách bị mất
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  soQuyen: { // Tổng số bản sao của sách này
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  availableCopies: { // Số bản sao có sẵn để mượn
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  namXuatBan: {
    type: Number
  },
  maNXB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher', // Tham chiếu đến model Publisher
    required: true
  },
  tacGia: [{ // Mảng các tên tác giả
    type: String,
    trim: true
  }],
  categories: [{ // Mảng các ObjectId của Category
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category' // Tham chiếu đến model Category
  }],
  isbn: { // International Standard Book Number
    type: String,
    unique: true,
    trim: true
  },
  coverUrl: { // URL ảnh bìa sách
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  pricePerDay: { 
    type: Number, 
    default: 2000, 
    min: 0 
  }
});

// Cập nhật updatedAt mỗi khi save
bookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;