
const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  tenNXB: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  diaChi: {
    type: String,
    trim: true
  },
  dienThoai: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Publisher = mongoose.model('Publisher', publisherSchema);

module.exports = Publisher;