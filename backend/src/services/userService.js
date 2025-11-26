
const User = require('../models/user');
const { hashPassword } = require('../utils/authUtils'); 

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
};
// Lấy tất cả người dùng (chỉ admin)
const getAllUsers = async (search) => {
  let query = {};

  // Nếu có từ khóa tìm kiếm, tạo bộ lọc (filter)
  if (search) {
    const safeSearch = escapeRegExp(search);
    const searchRegex = new RegExp(safeSearch, 'i'); // 'i' nghĩa là không phân biệt hoa thường

    // Tìm kiếm trong: username, email, số điện thoại, họ, tên
    query = {
      $or: [
        { username: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { dienThoai: { $regex: searchRegex } },
        { hoLot: { $regex: searchRegex } },
        { ten: { $regex: searchRegex } }
      ]
    };
  }

  // Truyền query vào find()
  return await User.find(query).select('-password');
};

// Lấy thông tin một người dùng theo ID
const getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

// Tạo người dùng mới (có thể dùng trong admin panel, hoặc đăng ký đã làm)
const createUser = async (userData) => {
  // Logic tương tự registerUser nhưng có thể bỏ qua kiểm tra username/email nếu đã có từ trước
  const { username, email, password, role, ...rest } = userData;

  let user = await User.findOne({ $or: [{ username }, { email }] });
  if (user) {
    throw new Error('Username or Email already exists.');
  }

  const hashedPassword = await hashPassword(password);
  user = new User({
    username,
    email,
    password: hashedPassword,
    role: role || 'reader',
    ...rest
  });
  await user.save();
  return user.toObject(); // Trả về object thuần túy
};

// Cập nhật thông tin người dùng
const updateUser = async (id, updateData) => {
  // Không cho phép cập nhật password trực tiếp từ đây
  if (updateData.password) {
    delete updateData.password; // Không cho phép cập nhật password qua update thông thường
  }
  // Nếu muốn cập nhật role, cần kiểm tra quyền của người gửi request

  const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
  if (!user) {
    throw new Error('User not found.');
  }
  return user.toObject();
};

// Xóa người dùng
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error('User not found.');
  }
  return { message: 'User deleted successfully.' };
};

// Cập nhật password riêng
const updatePassword = async (userId, newPassword) => {
    const hashedPassword = await hashPassword(newPassword);
    const user = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
    if (!user) {
        throw new Error('User not found.');
    }
    return { message: 'Password updated successfully.' };
};


module.exports = {
  getAllUsers,
  getUserById,
  createUser, 
  updateUser,
  deleteUser,
  updatePassword
};