
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, 
    lowercase: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'] 
  },
  password: { 
    type: String,
    required: true,
    minlength: 6 },
  role: {
    type: String,
    enum: ['reader', 'staff', 'admin'], 
    default: 'reader'
  },
  hoLot: {
    type: String,
    trim: true
  },
  ten: {
    type: String,
    trim: true
  },
  ngaySinh: {
    type: Date
  },
  gioiTinh: {
    type: String,
    enum: ['M', 'F', 'Other'] 
  },
  diaChi: {
    type: String,
    trim: true
  },
  dienThoai: {
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
  password: {
    type: String,
    required: function() { return !this.googleId; } 
  },
  googleId: {
      type: String,
      unique: true,
      sparse: true 
  },
  favorites: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Book' 
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },
  avatar: { type: String }
}); 

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
}); 

const User = mongoose.model('User', userSchema);

module.exports = User;