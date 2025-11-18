
const bookService = require('../services/bookService');

// @desc    Get all books with filters, search, and pagination
// @route   GET /api/books?category=...&author=...&year=...&search=...&page=...&limit=...
// @access  Public
const getBooks = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      author: req.query.author,
      year: req.query.year ? parseInt(req.query.year) : undefined,
    };
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };
    const search = req.query.search;

    const { books, total } = await bookService.getBooks(filters, pagination, search);
    res.status(200).json({
      data: books,
      total,
      page: pagination.page,
      pages: Math.ceil(total / pagination.limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
const getBook = async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    res.status(200).json(book);
  } catch (error) {
    if (error.message.includes('Book not found')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Private/Staff, Admin
const createBook = async (req, res, next) => {
  try {
    const newBook = await bookService.createBook(req.body);
    res.status(201).json({ message: 'Book created successfully.', book: newBook });
  } catch (error) {
    // Check for duplicate ISBN error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.isbn) {
        return res.status(409).json({ message: 'ISBN already exists.' });
    }
    if (error.message.includes('Category not found') || error.message.includes('Publisher not found')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Staff, Admin
const updateBook = async (req, res, next) => {
  try {
    const updatedBook = await bookService.updateBook(req.params.id, req.body);
    res.status(200).json({ message: 'Book updated successfully.', book: updatedBook });
  } catch (error) {
    if (error.message.includes('Book not found')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('New total copies cannot be less')) {
        return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res, next) => {
  try {
    const result = await bookService.deleteBook(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('Book not found')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// TODO: Thêm route upload ảnh bìa (cần middleware xử lý file upload)

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
};