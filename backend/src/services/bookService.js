
const bookRepository = require('../repositories/bookRepository');
const Category = require('../models/Category');
const Publisher = require('../models/publisher');

const getBooks = async (filters, pagination, search) => {
  return await bookRepository.getBooks(filters, pagination, search);
};

const getBookById = async (id) => {
  const book = await bookRepository.getBookById(id);
  if (!book) {
    throw new Error('Book not found.');
  }
  return book;
};

const createBook = async (bookData) => {
  // Validate Category & Publisher IDs
  const categoryExists = await Category.exists({ _id: { $in: bookData.categories } });
  if (bookData.categories && !categoryExists) {
      throw new Error('One or more categories not found.');
  }

  const publisherExists = await Publisher.exists({ _id: bookData.maNXB });
  if (!publisherExists) {
      throw new Error('Publisher not found.');
  }

  // Khởi tạo availableCopies = soQuyen khi tạo sách
  bookData.availableCopies = bookData.soQuyen;

  const book = await bookRepository.createBook(bookData);
  return book;
};

const updateBook = async (id, updateData) => {
  // Không cho phép cập nhật số lượng sách có sẵn trực tiếp từ đây
  // Việc cập nhật availableCopies sẽ được xử lý bởi logic mượn/trả sách
  if (updateData.availableCopies !== undefined) {
    delete updateData.availableCopies;
  }

  // Cập nhật soQuyen có thể ảnh hưởng đến availableCopies (logic phức tạp hơn nếu cần)
  if (updateData.soQuyen !== undefined) {
    const oldBook = await bookRepository.getBookById(id);
    if (oldBook && updateData.soQuyen < oldBook.soQuyen - oldBook.availableCopies) {
      throw new Error('New total copies cannot be less than currently borrowed copies.');
    }
    // Cập nhật availableCopies dựa trên soQuyen mới và số lượng đang mượn
    if (oldBook) {
        updateData.availableCopies = updateData.soQuyen - (oldBook.soQuyen - oldBook.availableCopies);
    }
  }


  const book = await bookRepository.updateBook(id, updateData);
  if (!book) {
    throw new Error('Book not found.');
  }
  return book;
};

const deleteBook = async (id) => {
  // TODO: Kiểm tra xem sách có đang được mượn không trước khi xóa
  const result = await bookRepository.deleteBook(id);
  if (!result) {
    throw new Error('Book not found.');
  }
  return result;
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};