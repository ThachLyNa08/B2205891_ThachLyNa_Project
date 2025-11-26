
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Loại bỏ khoảng trắng ở đầu và cuối
    lowercase: true // Chuyển username về chữ thường
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'] // Regex kiểm tra định dạng email
  },
  password: { // Lưu ý: sẽ hash password trước khi lưu
    type: String,
    required: true,
    minlength: 6 // Mật khẩu tối thiểu 6 ký tự
  },
  role: {
    type: String,
    enum: ['reader', 'staff', 'admin'], // Các vai trò có thể có
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
    enum: ['M', 'F', 'Other'] // Male, Female, Other
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
    required: function() { return !this.googleId; } // Chỉ bắt buộc nếu không đăng nhập bằng Google
},
googleId: {
    type: String,
    unique: true,
    sparse: true // Cho phép null mà không báo lỗi unique
},
avatar: { type: String }
});

// Cập nhật updatedAt mỗi khi save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;