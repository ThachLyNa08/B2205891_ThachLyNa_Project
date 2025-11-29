
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  maSach: { 
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
  donGia: { 
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  soQuyen: { 
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  availableCopies: { 
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
    ref: 'Publisher', 
    required: true
  },
  tacGia: [{ 
    type: String,
    trim: true
  }],
  categories: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category' 
  }],
  isbn: { 
    type: String,
    unique: true,
    trim: true
  },
  coverUrl: { 
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

bookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;