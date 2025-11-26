const loanRepository = require('../repositories/loanRepository');
const Book = require('../models/book'); 
const User = require('../models/user'); 
const Loan = require('../models/loan'); // <--- ĐÃ THÊM DÒNG QUAN TRỌNG NÀY

const OVERDUE_FINE_PER_DAY = 10000; 

// 1. YÊU CẦU MƯỢN
const requestLoan = async (userId, bookId, ngayHenTra) => {
    const book = await Book.findById(bookId);
    if (!book) throw new Error('Book not found.');
    if (book.availableCopies <= 0) throw new Error('Book is currently out of stock.');

    // Tính tiền thuê
    const start = new Date();
    const end = new Date(ngayHenTra);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; 
    const rentCost = diffDays * (book.pricePerDay || 2000); 

    const newLoan = await loanRepository.createLoan({
      userId,
      bookId,
      ngayMuon: start,
      ngayHenTra: end,
      rentCost: rentCost,
      status: 'pending'
    });

    return newLoan;
};

// 2. DUYỆT ĐƠN (Kèm kiểm tra thanh toán)
const confirmLoan = async (loanId, staffUserId) => {
    const loan = await loanRepository.getLoanById(loanId);
    if (!loan) throw new Error('Loan request not found.');
    if (loan.status !== 'pending') throw new Error('Loan is not in pending status.');

    // Kiểm tra thanh toán
    if (loan.rentCost > 0 && !loan.isPaid) {
        throw new Error(`Cannot approve: User has not paid the rental fee (${loan.rentCost} VND).`);
    }

    const book = await Book.findById(loan.bookId);
    if (!book || book.availableCopies <= 0) throw new Error('Book out of stock.');

    // Trừ kho sách
    book.availableCopies -= 1;
    await book.save();

    const updatedLoan = await loanRepository.updateLoan(loanId, {
      status: 'borrowed',
      ngayMuon: new Date()
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

// --- HÀM THỐNG KÊ (Fix lỗi Loan is not defined) ---
const getLoanStats = async () => {
  // Đếm số lượng theo từng trạng thái
  const pending = await Loan.countDocuments({ status: 'pending' });
  const borrowed = await Loan.countDocuments({ status: 'borrowed' });
  
  // Đếm sách quá hạn (status là borrowed VÀ ngày trả < hôm nay)
  // HOẶC nếu bạn có status riêng là 'overdue' thì đếm theo status đó
  const overdue = await Loan.countDocuments({ 
      $or: [
          { status: 'overdue' },
          { status: 'borrowed', ngayHenTra: { $lt: new Date() } }
      ]
  });

  const returned = await Loan.countDocuments({ status: 'returned' });

  return { pending, borrowed, overdue, returned };
};

const getLoans = async (filter, pagination) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  // Tạo query tìm kiếm cơ bản
  let query = {};

  // 1. XỬ LÝ FILTER STATUS (QUAN TRỌNG)
  if (filter.status) {
    if (filter.status === 'overdue') {
      // Logic tìm sách quá hạn:
      // 1. Trạng thái phải là đang mượn ('borrowed')
      // 2. Ngày hẹn trả phải NHỎ HƠN thời điểm hiện tại
      query.status = 'borrowed';
      query.ngayHenTra = { $lt: new Date() }; 
    } 
    else if (filter.status.includes(',')) {
      // Logic tìm nhiều trạng thái (ví dụ: "returned,cancelled")
      const statuses = filter.status.split(',');
      query.status = { $in: statuses };
    } 
    else {
      // Các trạng thái bình thường (pending, borrowed, returned...)
      query.status = filter.status;
    }
  }

  // 2. XỬ LÝ FILTER USER (Nếu có)
  if (filter.userId) {
    query.userId = filter.userId;
  }

  // 3. XỬ LÝ TÌM KIẾM TỪ KHÓA (Nếu có - Search box)
  // (Phần này tùy code cũ của bạn, nếu chưa có thì bỏ qua hoặc thêm vào sau)
  
  // --- THỰC HIỆN TRUY VẤN ---
  const loans = await Loan.find(query)
    .populate('userId', 'username email hoLot ten') // Lấy thông tin user
    .populate('bookId', 'tenSach maSach coverUrl')  // Lấy thông tin sách
    .sort({ createdAt: -1 }) // Mới nhất lên đầu
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

    // LOGIC CHẶN XÓA:
    // Nếu đang mượn (borrowed) hoặc quá hạn (overdue) -> KHÔNG ĐƯỢC XÓA
    if (['borrowed', 'overdue'].includes(loan.status)) {
        throw new Error('Cannot delete: Book is currently borrowed. Please return it first.');
    }

    // Chỉ cho phép xóa khi:
    // 1. status = 'pending' (Chưa duyệt/Chưa thanh toán xong)
    // 2. status = 'cancelled' (Đã hủy)
    // 3. status = 'returned' (Đã trả xong xuôi)
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