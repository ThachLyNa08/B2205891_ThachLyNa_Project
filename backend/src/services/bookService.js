const bookRepository = require('../repositories/bookRepository');
const Category = require('../models/Category');
const Publisher = require('../models/publisher');
const Loan = require('../models/loan');

const generateBookCode = () => {
  return 'B' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
};

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
  const categoryExists = await Category.exists({ _id: { $in: bookData.categories } });
  if (bookData.categories && bookData.categories.length > 0 && !categoryExists) {
      throw new Error('One or more categories not found.');
  }

  const publisherExists = await Publisher.exists({ _id: bookData.maNXB });
  if (!publisherExists) throw new Error('Publisher not found.');

  if (!bookData.maSach) {
      bookData.maSach = generateBookCode();
  }
  
  if (!bookData.isbn) {
      bookData.isbn = generateISBN();
  }

  bookData.availableCopies = bookData.soQuyen;

  const book = await bookRepository.createBook(bookData);
  return book;
};

const updateBook = async (id, updateData) => {
  if (updateData.availableCopies !== undefined) delete updateData.availableCopies;

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

const deleteBook = async (id) => {
  const isBorrowed = await Loan.exists({
      bookId: id,
      status: { $in: ['pending', 'borrowed', 'overdue'] } 
  });

  if (isBorrowed) {
      throw new Error('Cannot delete: This book is currently borrowed or has pending requests.');
  }

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