const bookService = require('../services/bookService');

// ==================================================
// 1. HÀM HELPER: Xử lý dữ liệu từ FormData (QUAN TRỌNG)
// ==================================================
const parseBookData = (req) => {
  // Copy dữ liệu từ body (text fields)
  const data = { ...req.body };
  
  // A. XỬ LÝ ẢNH UPLOAD
  if (req.file) {
    // Lấy giao thức (http) và tên miền (localhost:5000)
    const url = `${req.protocol}://${req.get('host')}`;
    
    // Tạo đường dẫn đầy đủ để Frontend hiển thị được
    // Ví dụ: http://localhost:5000/uploads/1715...png
    data.coverUrl = `${url}/uploads/${req.file.filename}`;
  }

  // B. XỬ LÝ MẢNG JSON (Vì FormData gửi mảng dưới dạng chuỗi)
  // Ví dụ: gửi "['Kinh dị', 'Hài']" -> Phải parse thành mảng thật
  const arrayFields = ['categories', 'tacGia'];
  
  arrayFields.forEach(field => {
    if (data[field]) {
      try {
        // Nếu là chuỗi thì parse, nếu đã là mảng thì giữ nguyên
        if (typeof data[field] === 'string') {
           data[field] = JSON.parse(data[field]);
        }
      } catch (e) {
        // Nếu lỗi parse (ví dụ gửi 1 ID trần), bọc nó vào mảng
        console.log(`Warning parsing ${field}:`, e.message);
        data[field] = [data[field]];
      }
    }
  });
  
  return data;
};

// ==================================================
// 2. CÁC HÀM CONTROLLER CHÍNH
// ==================================================

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
    // Gọi helper để xử lý ảnh và dữ liệu json
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
    // Gọi helper để xử lý ảnh và dữ liệu json
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

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
};