
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  tenTheLoai: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  moTa: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;