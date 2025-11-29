const loanRepository = require('../repositories/loanRepository');
const Book = require('../models/book'); 
const User = require('../models/user'); 
const Loan = require('../models/loan');

const OVERDUE_FINE_PER_DAY = 10000; 

// 1. YÊU CẦU MƯỢN
const requestLoan = async (userId, bookId, ngayHenTra) => {
    const book = await Book.findById(bookId);
    if (!book) throw new Error('Book not found.');
    if (book.availableCopies <= 0) throw new Error('Book is currently out of stock.');

    const start = new Date();
    const end = new Date(ngayHenTra);
    
    // Vẫn lưu rentCost để tham khảo (hoặc set = 0 nếu muốn miễn phí hoàn toàn)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; 
    const rentCost = diffDays * (book.pricePerDay || 2000); 

    const newLoan = await loanRepository.createLoan({
      userId,
      bookId,
      ngayMuon: start,
      ngayHenTra: end,
      rentCost: rentCost,
      status: 'pending',
      isPaid: false // Mặc định chưa trả (nhưng không bắt buộc nữa)
    });

    return newLoan;
};

// [SỬA] 2. DUYỆT ĐƠN (BỎ KIỂM TRA THANH TOÁN)
const confirmLoan = async (loanId, staffUserId) => {
    const loan = await loanRepository.getLoanById(loanId);
    if (!loan) throw new Error('Loan request not found.');
    if (loan.status !== 'pending') throw new Error('Loan is not in pending status.');

    // [ĐÃ XÓA] Đoạn kiểm tra loan.rentCost > 0 && !loan.isPaid
    // Bây giờ Admin có thể duyệt ngay lập tức mà không cần khách thanh toán trước.

    const book = await Book.findById(loan.bookId);
    if (!book || book.availableCopies <= 0) throw new Error('Book out of stock.');

    // Trừ kho sách
    book.availableCopies -= 1;
    await book.save();

    const updatedLoan = await loanRepository.updateLoan(loanId, {
      status: 'borrowed',
      ngayMuon: new Date() // Cập nhật ngày mượn chính thức là lúc duyệt
    });

    return updatedLoan;
};

// 3. TRẢ SÁCH
const processReturn = async (loanId, staffUserId) => {
    const loan = await loanRepository.getLoanById(loanId);
    if (!loan) throw new Error('Loan not found.');
    if (loan.status === 'returned') throw new Error('Already returned.');

    const book = await Book.findById(loan.bookId);

    // Tính phạt nếu quá hạn
    const ngayTraThucTe = new Date();
    let phatTien = 0;
    
    // So sánh ngày trả thực tế với ngày hẹn
    if (ngayTraThucTe > new Date(loan.ngayHenTra)) {
      const diffTime = Math.abs(ngayTraThucTe - new Date(loan.ngayHenTra));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      phatTien = diffDays * OVERDUE_FINE_PER_DAY;
    }

    const updatedLoan = await loanRepository.updateLoan(loanId, {
      ngayTraThucTe,
      status: 'returned',
      phatTien
    });

    // Cộng lại kho
    if (book) {
        book.availableCopies += 1;
        await book.save();
    }

    return updatedLoan;
};

const cancelLoan = async (loanId, userId) => {
    const loan = await loanRepository.getLoanById(loanId);
    if (!loan) throw new Error('Loan not found.');
    return await loanRepository.updateLoan(loanId, { status: 'cancelled' });
};

const getLoanStats = async () => {
  const pending = await Loan.countDocuments({ status: 'pending' });
  const borrowed = await Loan.countDocuments({ status: 'borrowed' });
  
  const overdue = await Loan.countDocuments({ 
      $or: [
          { status: 'overdue' },
          { status: 'borrowed', ngayHenTra: { $lt: new Date() } }
      ]
  });

  const returned = await Loan.countDocuments({ status: 'returned' });

  // [MỚI] Đếm số phiếu có tiền phạt > 0 VÀ chưa thanh toán
  const unpaidFines = await Loan.countDocuments({ 
      phatTien: { $gt: 0 }, 
      isFinePaid: false 
  });

  // Trả về thêm unpaidFines
  return { pending, borrowed, overdue, returned, unpaidFines };
};

const getLoans = async (filter, pagination) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  let query = {};

  if (filter.status) {
    if (filter.status === 'overdue') {
      query.$or = [
         { status: 'overdue' },
         { status: 'borrowed', ngayHenTra: { $lt: new Date() } }
      ];
    } 
    else if (filter.status.includes(',')) {
      const statuses = filter.status.split(',');
      query.status = { $in: statuses };
    } 
    else {
      query.status = filter.status;
    }
  }

  if (filter.userId) query.userId = filter.userId;

  const loans = await Loan.find(query)
    .populate('userId', 'username email hoLot ten')
    .populate('bookId', 'tenSach maSach coverUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Loan.countDocuments(query);
  return { loans, total };
};

const getLoanById = async (id) => loanRepository.getLoanById(id);
const getLoansForCalendar = async (userId, year, month) => loanRepository.getLoansForCalendar(userId, year, month);

const deleteLoan = async (loanId) => {
    const loan = await loanRepository.getLoanById(loanId);
    if (!loan) throw new Error('Loan record not found.');
    if (['borrowed', 'overdue'].includes(loan.status)) {
        throw new Error('Cannot delete: Book is currently borrowed. Please return it first.');
    }
    await loanRepository.deleteLoan(loanId);
    return true;
};

module.exports = {
  requestLoan,
  confirmLoan,
  processReturn,
  cancelLoan,
  getLoans,
  getLoanById,
  getLoansForCalendar,
  getLoanStats,
  deleteLoan
};