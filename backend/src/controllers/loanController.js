const loanService = require('../services/loanService');
// --- THÊM IMPORT MODEL ĐỂ XỬ LÝ LOGIC TRẢ SÁCH ---
const Loan = require('../models/loan');
const Book = require('../models/book');

// @desc    Request to borrow a book
// @route   POST /api/loans/request
// @access  Private/Reader
const requestLoan = async (req, res, next) => {
  try {
    const { bookId, ngayHenTra } = req.body;
    const userId = req.user._id;

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
    const staffUserId = req.user._id;

    const confirmedLoan = await loanService.confirmLoan(loanId, staffUserId);
    res.status(200).json({ message: 'Loan confirmed successfully.', loan: confirmedLoan });
  } catch (error) {
    if (error.message.includes('Loan request not found') || error.message.includes('not in pending status') || error.message.includes('out of stock')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// ==================================================================
// @desc    Process book return (ĐÃ CẬP NHẬT TÍNH TIỀN PHẠT)
// @route   PUT /api/loans/:id/return
// @access  Private/Staff, Admin
// ==================================================================
const processReturn = async (req, res, next) => {
  try {
    const loanId = req.params.id;
    
    // 1. Tìm phiếu mượn và populate thông tin sách
    // Lưu ý: Dùng 'bookId' theo đúng Model bạn cung cấp
    const loan = await Loan.findById(loanId).populate('bookId');
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    if (loan.status === 'returned') {
      return res.status(400).json({ message: 'This book has already been returned.' });
    }

    // 2. TÍNH TOÁN NGÀY QUÁ HẠN & TIỀN PHẠT
    const today = new Date();
    const duKien = new Date(loan.ngayHenTra); // Model của bạn dùng 'ngayHenTra'
    
    // Đặt giờ về 00:00:00 để chỉ so sánh ngày
    today.setHours(0,0,0,0);
    duKien.setHours(0,0,0,0);

    let tienPhat = 0;
    let lyDo = '';
    let soNgayQuaHan = 0;

    // Nếu ngày trả thực tế (hôm nay) lớn hơn ngày hẹn trả
    if (today > duKien) {
      const diffTime = Math.abs(today - duKien);
      soNgayQuaHan = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      const PHI_PHAT_MOI_NGAY = 5000; // Cấu hình: 5k / 1 ngày
      tienPhat = soNgayQuaHan * PHI_PHAT_MOI_NGAY;
      lyDo = `Quá hạn ${soNgayQuaHan} ngày`;
    }

    // 3. Cập nhật thông tin phiếu mượn
    loan.ngayTraThucTe = Date.now();
    loan.status = 'returned';
    loan.phatTien = tienPhat; // Model của bạn dùng 'phatTien'
    loan.lyDoPhat = lyDo;      // (Nếu model chưa có trường này thì nó sẽ tự bỏ qua, không lỗi)
    
    // Nếu có tiền phạt -> chưa thanh toán (false), nếu không phạt -> coi như xong (true)
    loan.isFinePaid = tienPhat === 0;
    // Cập nhật luôn trạng thái thanh toán chung nếu cần
    if (tienPhat === 0 && loan.isPaid) {
        // Giữ nguyên logic cũ
    } else if (tienPhat > 0) {
        loan.isPaid = false; // Có phát sinh phí mới nên set lại chưa thanh toán hết
    }

    // 4. Cộng lại số lượng sách vào kho (Stock)
    if (loan.bookId) {
      const book = await Book.findById(loan.bookId._id);
      if (book) {
        book.stock = (book.stock || 0) + 1;
        await book.save();
      }
    }

    await loan.save();

    // 5. Trả về kết quả cho Frontend (Frontend cần cục 'phat' này để hiển thị)
    res.status(200).json({ 
      message: 'Book returned successfully.', 
      loan: loan,
      phat: {
        coPhat: tienPhat > 0,
        soTien: tienPhat,
        soNgay: soNgayQuaHan
      }
    });

  } catch (error) {
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

// @desc    Get all loans
// @route   GET /api/loans
// @access  Private/Reader, Staff, Admin
const getLoans = async (req, res, next) => {
  try {
    const { page, limit, status, userId } = req.query;
    const pagination = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
    const query = {};

    if (status) query.status = status;

    if (req.user.role === 'reader') {
      query.userId = req.user._id;
    } else if (userId) {
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
// @route   GET /api/loans/calendar
// @access  Private/Reader, Staff, Admin
const getLoansForCalendar = async (req, res, next) => {
    try {
        const { year, month, userId } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month are required for calendar view.' });
        }

        let queryUserId = null;
        if (req.user.role === 'reader') {
            queryUserId = req.user._id;
        } else if (userId) {
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

const deleteLoan = async (req, res, next) => {
  try {
    await loanService.deleteLoan(req.params.id);
    res.status(200).json({ message: 'Loan record deleted successfully.' });
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
  getStats,
  deleteLoan
};