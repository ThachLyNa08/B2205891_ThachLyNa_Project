
const Book = require('../models/book');
const Category = require('../models/Category');
const Publisher = require('../models/publisher');

const getBooks = async (filters, pagination, search) => {
  const query = {};

  if (filters.category) {
    const category = await Category.findOne({ tenTheLoai: new RegExp(filters.category, 'i') });
    if (category) {
      query.categories = category._id;
    } else {
      return { books: [], total: 0 };
    }
  }

  if (filters.author) {
    query.tacGia = { $regex: new RegExp(filters.author, 'i') };
  }

  if (filters.year) {
    query.namXuatBan = filters.year;
  }

  if (search) {
    query.$or = [
      { tenSach: { $regex: new RegExp(search, 'i') } },
      { moTa: { $regex: new RegExp(search, 'i') } },
      { tacGia: { $regex: new RegExp(search, 'i') } },
      { isbn: { $regex: new RegExp(search, 'i') } },
    ];
  }

  const total = await Book.countDocuments(query);
  const books = await Book.find(query)
    .populate('maNXB', 'tenNXB') 
    .populate('categories', 'tenTheLoai') 
    .skip((pagination.page - 1) * pagination.limit)
    .limit(pagination.limit);

  return { books, total };
};

const getBookById = async (id) => {
  return await Book.findById(id)
    .populate('maNXB', 'tenNXB')
    .populate('categories', 'tenTheLoai');
};

const createBook = async (bookData) => {
  const newBook = new Book(bookData);
  return await newBook.save();
};

const updateBook = async (id, updateData) => {
  return await Book.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const deleteBook = async (id) => {
  return await Book.findByIdAndDelete(id);
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};