const bookService = require('../services/bookService');
const Loan = require('../models/loan');

const parseBookData = (req) => {
  const data = { ...req.body };
  
  if (req.file) {
    const url = `${req.protocol}://${req.get('host')}`;

    data.coverUrl = `${url}/uploads/${req.file.filename}`;
  }

  const arrayFields = ['categories', 'tacGia'];
  
  arrayFields.forEach(field => {
    if (data[field]) {
      try {
        if (typeof data[field] === 'string') {
           data[field] = JSON.parse(data[field]);
        }
      } catch (e) {
        console.log(`Warning parsing ${field}:`, e.message);
        data[field] = [data[field]];
      }
    }
  });
  
  return data;
};

// @desc    Get all books
// @route   GET /api/books
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
const createBook = async (req, res, next) => {
  try {
    const bookData = parseBookData(req); 
    const newBook = await bookService.createBook(bookData);
    res.status(201).json({ message: 'Book created successfully.', book: newBook });
  } catch (error) {
    console.error("Create Book Error:", error);
    next(error);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
const updateBook = async (req, res, next) => {
  try {
    const bookData = parseBookData(req); 
    const updatedBook = await bookService.updateBook(req.params.id, bookData);
    res.status(200).json({ message: 'Book updated successfully.', book: updatedBook });
  } catch (error) {
    console.error("Update Book Error:", error);
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
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
const getTopBooks = async (req, res, next) => {
  try {
    const topBooks = await Loan.aggregate([
      { $group: { _id: "$bookId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, 
      { $limit: 5 },            
      { 
        $lookup: { 
          from: "books", 
          localField: "_id", 
          foreignField: "_id", 
          as: "bookInfo" 
        } 
      },
      { $unwind: "$bookInfo" },
      {
        $project: {
          tenSach: "$bookInfo.tenSach",
          tacGia: "$bookInfo.tacGia",
          coverUrl: "$bookInfo.coverUrl",
          borrowedCount: "$count"
        }
      }
    ]);
    res.status(200).json(topBooks);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getTopBooks
};