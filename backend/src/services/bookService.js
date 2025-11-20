const bookRepository = require('../repositories/bookRepository');
const Category = require('../models/Category');
const Publisher = require('../models/publisher');
const Loan = require('../models/loan');

// Hàm sinh mã ngẫu nhiên (Ví dụ: B123456)
const generateBookCode = () => {
  return 'B' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
};

// Hàm sinh ISBN giả (nếu cần)
const generateISBN = () => {
  return 'GEN-' + Date.now();
};

const getBooks = async (filters, pagination, search) => {
  return await bookRepository.getBooks(filters, pagination, search);
};

const getBookById = async (id) => {
  const book = await bookRepository.getBookById(id);
  if (!book) throw new Error('Book not found.');
  return book;
};

const createBook = async (bookData) => {
  // 1. Validate danh mục và NXB
  const categoryExists = await Category.exists({ _id: { $in: bookData.categories } });
  if (bookData.categories && bookData.categories.length > 0 && !categoryExists) {
      throw new Error('One or more categories not found.');
  }

  const publisherExists = await Publisher.exists({ _id: bookData.maNXB });
  if (!publisherExists) throw new Error('Publisher not found.');

  // 2. TỰ ĐỘNG SINH MÃ (Đây là phần quan trọng để fix lỗi của bạn)
  if (!bookData.maSach) {
      bookData.maSach = generateBookCode();
  }
  
  // 3. Tự động sinh ISBN nếu thiếu (tránh lỗi duplicate key)
  if (!bookData.isbn) {
      bookData.isbn = generateISBN();
  }

  // 4. Khởi tạo số lượng
  bookData.availableCopies = bookData.soQuyen;

  // 5. Tạo sách
  const book = await bookRepository.createBook(bookData);
  return book;
};

const updateBook = async (id, updateData) => {
  // Không cho phép sửa số lượng tồn kho trực tiếp
  if (updateData.availableCopies !== undefined) delete updateData.availableCopies;

  // Logic cập nhật kho khi sửa tổng số lượng
  if (updateData.soQuyen !== undefined) {
    const oldBook = await bookRepository.getBookById(id);
    if (oldBook) {
        const borrowed = oldBook.soQuyen - oldBook.availableCopies;
        if (updateData.soQuyen < borrowed) {
             throw new Error('New total copies cannot be less than borrowed copies.');
        }
        updateData.availableCopies = updateData.soQuyen - borrowed;
    }
  }

  const book = await bookRepository.updateBook(id, updateData);
  if (!book) throw new Error('Book not found.');
  return book;
};

// --- CẬP NHẬT HÀM XÓA SÁCH ---
const deleteBook = async (id) => {
  // 1. Kiểm tra ràng buộc: Sách có đang được mượn không?
  const isBorrowed = await Loan.exists({
      bookId: id,
      // Các trạng thái ngăn cản việc xóa:
      status: { $in: ['pending', 'borrowed', 'overdue'] } 
  });

  if (isBorrowed) {
      throw new Error('Cannot delete: This book is currently borrowed or has pending requests.');
  }

  // 2. Nếu "sạch" thì mới xóa
  const result = await bookRepository.deleteBook(id);
  if (!result) throw new Error('Book not found.');
  return result;
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};