
const User = require('../models/user');
const { hashPassword } = require('../utils/authUtils'); 

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
};
// Lấy tất cả người dùng (chỉ admin)
const getAllUsers = async (search, role) => {
  let query = {};

  //Nếu có role và role không phải là 'all', thêm điều kiện lọc
  if (role && role !== 'all') {
      query.role = role;
  }

  // Logic tìm kiếm (Search)
  if (search) {
    const safeSearch = escapeRegExp(search);
    const searchRegex = new RegExp(safeSearch, 'i');

    // Sử dụng $and để kết hợp: (Role = ?) VÀ (Tên like ? HOẶC Email like ? ...)
    const searchQuery = {
      $or: [
        { username: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { dienThoai: { $regex: searchRegex } },
        { hoLot: { $regex: searchRegex } },
        { ten: { $regex: searchRegex } }
      ]
    };
    // Gộp query role và query search
    query = { ...query, ...searchQuery };
  }

  return await User.find(query).select('-password').sort({ createdAt: -1 });
};

const getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

const createUser = async (userData) => {
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
  return user.toObject(); 
};

// Cập nhật thông tin người dùng
const updateUser = async (id, updateData) => {
  if (updateData.password) {
    delete updateData.password; 
  }

  const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
  if (!user) {
    throw new Error('User not found.');
  }
  return user.toObject();
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error('User not found.');
  }
  return { message: 'User deleted successfully.' };
};

const updatePassword = async (userId, newPassword) => {
    const hashedPassword = await hashPassword(newPassword);
    const user = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
    if (!user) {
        throw new Error('User not found.');
    }
    return { message: 'Password updated successfully.' };
};
const addFavorite = async (userId, bookId) => {
    const user = await User.findByIdAndUpdate(
        userId, 
        { $addToSet: { favorites: bookId } }, 
        { new: true }
    ).populate('favorites');
    return user.favorites;
};

const removeFavorite = async (userId, bookId) => {
    const user = await User.findByIdAndUpdate(
        userId, 
        { $pull: { favorites: bookId } }, 
        { new: true }
    ).populate('favorites');
    return user.favorites;
};

const getFavorites = async (userId) => {
    const user = await User.findById(userId).populate({
        path: 'favorites',
        populate: [
            { path: 'categories', select: 'tenTheLoai' }, 
            { path: 'maNXB', select: 'tenNXB' }           
        ]
    });
    return user ? user.favorites : [];
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser, 
  updateUser,
  deleteUser,
  updatePassword,
  addFavorite,
  removeFavorite,
  getFavorites
};