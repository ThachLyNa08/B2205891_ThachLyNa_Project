
const loanService = require('../services/loanService');

// @desc    Request to borrow a book
// @route   POST /api/loans/request
// @access  Private/Reader
const requestLoan = async (req, res, next) => {
  try {
    const { bookId, ngayHenTra } = req.body;
    const userId = req.user._id; // Lấy ID của người dùng từ token

    if (!bookId || !ngayHenTra) {
      return res.status(400).json({ message: 'Book ID and return due date are required.' });
    }

    const loan = await loanService.requestLoan(userId, bookId, ngayHenTra);
    res.status(201).json({ message: 'Loan request created successfully.', loan });
  } catch (error) {
    if (error.message.includes('Book not found') || error.message.includes('out of stock')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Confirm a pending loan request
// @route   PUT /api/loans/:id/confirm
// @access  Private/Staff, Admin
const confirmLoan = async (req, res, next) => {
  try {
    const loanId = req.params.id;
    const staffUserId = req.user._id; // Lấy ID nhân viên/admin từ token

    const confirmedLoan = await loanService.confirmLoan(loanId, staffUserId);
    res.status(200).json({ message: 'Loan confirmed successfully.', loan: confirmedLoan });
  } catch (error) {
    if (error.message.includes('Loan request not found') || error.message.includes('not in pending status') || error.message.includes('out of stock')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Process book return
// @route   PUT /api/loans/:id/return
// @access  Private/Staff, Admin
const processReturn = async (req, res, next) => {
  try {
    const loanId = req.params.id;
    const staffUserId = req.user._id; // Lấy ID nhân viên/admin từ token

    const returnedLoan = await loanService.processReturn(loanId, staffUserId);
    res.status(200).json({ message: 'Book returned successfully.', loan: returnedLoan });
  } catch (error) {
    if (error.message.includes('Loan not found') || error.message.includes('already been returned')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Cancel a pending loan request
// @route   PUT /api/loans/:id/cancel
// @access  Private/Reader (for own pending loans), Staff, Admin
const cancelLoan = async (req, res, next) => {
    try {
        const loanId = req.params.id;
        const userId = req.user._id;

        const cancelledLoan = await loanService.cancelLoan(loanId, userId);
        res.status(200).json({ message: 'Loan cancelled successfully.', loan: cancelledLoan });
    } catch (error) {
        if (error.message.includes('Loan not found') || error.message.includes('Only pending loans can be cancelled') || error.message.includes('Not authorized')) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

// @desc    Get all loans (for Admin/Staff) or user's loans (for Reader)
// @route   GET /api/loans
// @access  Private/Reader, Staff, Admin
const getLoans = async (req, res, next) => {
  try {
    const { page, limit, status, userId } = req.query;
    const pagination = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
    const query = {};

    if (status) query.status = status;

    // Nếu là admin/staff, có thể lọc theo userId khác
    // Nếu là reader, chỉ xem được loans của mình
    if (req.user.role === 'reader') {
      query.userId = req.user._id;
    } else if (userId) { // Admin/Staff có thể lọc theo userId cụ thể
      query.userId = userId;
    }

    const { loans, total } = await loanService.getLoans(query, pagination);
    res.status(200).json({
      data: loans,
      total,
      page: pagination.page,
      pages: Math.ceil(total / pagination.limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single loan by ID
// @route   GET /api/loans/:id
// @access  Private/Reader (for own loan), Staff, Admin
const getLoan = async (req, res, next) => {
  try {
    const loanId = req.params.id;
    const loan = await loanService.getLoanById(loanId);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    // Chỉ cho phép user xem loan của mình, hoặc admin/staff xem bất kỳ
    if (req.user._id.toString() !== loan.userId._id.toString() && !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view this loan.' });
    }

    res.status(200).json(loan);
  } catch (error) {
    if (error.message.includes('Loan not found')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Get loans for calendar view
// @route   GET /api/loans/calendar?year=...&month=...
// @access  Private/Reader, Staff, Admin
const getLoansForCalendar = async (req, res, next) => {
    try {
        const { year, month, userId } = req.query; // userId có thể được cung cấp bởi admin/staff

        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month are required for calendar view.' });
        }

        let queryUserId = null;
        if (req.user.role === 'reader') {
            queryUserId = req.user._id; // Reader chỉ xem của mình
        } else if (userId) { // Admin/Staff có thể xem của user khác
            queryUserId = userId;
        }

        const loans = await loanService.getLoansForCalendar(queryUserId, parseInt(year), parseInt(month));
        res.status(200).json(loans);
    } catch (error) {
        next(error);
    }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await loanService.getLoanStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};


module.exports = {
  requestLoan,
  confirmLoan,
  processReturn,
  cancelLoan,
  getLoans,
  getLoan,
  getLoansForCalendar,
  getStats
};