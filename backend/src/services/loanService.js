
const loanRepository = require('../repositories/loanRepository');
const Book = require('../models/book'); 
const User = require('../models/user'); 
const mongoose = require('mongoose');

const OVERDUE_FINE_PER_DAY = 5000; // Ví dụ: 5,000 VND mỗi ngày

const requestLoan = async (userId, bookId, ngayHenTra) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const book = await Book.findById(bookId).session(session);
    if (!book) {
      throw new Error('Book not found.');
    }
    if (book.availableCopies <= 0) {
      throw new Error('Book is currently out of stock.');
    }

    // Tạo yêu cầu mượn
    const newLoan = await loanRepository.createLoan({
      userId,
      bookId,
      ngayHenTra: new Date(ngayHenTra),
      status: 'pending' // Ban đầu là pending, chờ nhân viên xác nhận
    });

    // Giảm số lượng sách có sẵn (tạm thời) hoặc khi xác nhận
    // Logic này có thể để sau khi xác nhận bởi nhân viên
    // For now, let's decrease immediately if we assume auto-approval or simplified flow
    // book.availableCopies -= 1;
    // await book.save({ session });

    await session.commitTransaction();
    session.endSession();

    // TODO: Gửi notification cho nhân viên về yêu cầu mượn mới

    return newLoan;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const confirmLoan = async (loanId, staffUserId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const loan = await loanRepository.getLoanById(loanId);
    if (!loan) {
      throw new Error('Loan request not found.');
    }
    if (loan.status !== 'pending') {
      throw new Error('Loan is not in pending status and cannot be confirmed.');
    }

    const book = await Book.findById(loan.bookId).session(session);
    if (!book) {
        throw new Error('Associated book not found.');
    }
    if (book.availableCopies <= 0) {
        throw new Error('Book is currently out of stock for confirmation.');
    }

    // Cập nhật trạng thái và ngày mượn thực tế
    const updatedLoan = await loanRepository.updateLoan(loanId, {
      status: 'borrowed',
      ngayMuon: new Date(), // Set ngày mượn là ngày xác nhận
      // Nhân viên xác nhận có thể là staffUserId, nhưng không lưu trực tiếp vào loan schema
    });

    // Giảm số lượng sách có sẵn
    book.availableCopies -= 1;
    await book.save({ session });

    await session.commitTransaction();
    session.endSession();

    // TODO: Gửi notification cho độc giả rằng yêu cầu đã được xác nhận

    return updatedLoan;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const processReturn = async (loanId, staffUserId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const loan = await loanRepository.getLoanById(loanId);
    if (!loan) {
      throw new Error('Loan not found.');
    }
    if (loan.status === 'returned' || loan.status === 'cancelled') {
      throw new Error('Loan has already been returned or cancelled.');
    }

    const book = await Book.findById(loan.bookId).session(session);
    if (!book) {
      throw new Error('Associated book not found.');
    }

    const ngayTraThucTe = new Date();
    let phatTien = 0;

    // Tính tiền phạt nếu quá hạn
    if (ngayTraThucTe > loan.ngayHenTra) {
      const diffTime = Math.abs(ngayTraThucTe.getTime() - loan.ngayHenTra.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      phatTien = diffDays * OVERDUE_FINE_PER_DAY;
    }

    // Cập nhật trạng thái mượn và ngày trả thực tế, tiền phạt
    const updatedLoan = await loanRepository.updateLoan(loanId, {
      ngayTraThucTe,
      status: phatTien > 0 ? 'overdue' : 'returned', // Nếu có phạt thì set là overdue, không thì returned
      phatTien
    });

    // Tăng số lượng sách có sẵn
    book.availableCopies += 1;
    await book.save({ session });

    await session.commitTransaction();
    session.endSession();

    // TODO: Gửi notification cho độc giả về việc trả sách và tiền phạt (nếu có)
    // TODO: Nếu có phạt, cần tạo một Payment record

    return updatedLoan;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cancelLoan = async (loanId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const loan = await loanRepository.getLoanById(loanId);
        if (!loan) {
            throw new Error('Loan not found.');
        }

        // Chỉ cho phép người dùng tự hủy yêu cầu pending của mình, hoặc admin/staff hủy bất kỳ
        if (loan.userId.toString() !== userId && !['admin', 'staff'].includes(req.user.role)) {
            throw new Error('Not authorized to cancel this loan.');
        }

        if (loan.status !== 'pending') {
            throw new Error('Only pending loans can be cancelled.');
        }

        const updatedLoan = await loanRepository.updateLoan(loanId, { status: 'cancelled' });

        // Nếu đã giảm availableCopies khi request, thì phải tăng lại ở đây
        // Nhưng hiện tại logic requestLoan không giảm ngay, nên không cần tăng lại

        await session.commitTransaction();
        session.endSession();
        return updatedLoan;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};


const getLoans = async (query, pagination) => {
  return await loanRepository.getLoans(query, pagination);
};

const getUserLoans = async (userId, pagination) => {
  return await loanRepository.getLoans({ userId }, pagination);
};

const getLoansForCalendar = async (userId, year, month) => {
  return await loanRepository.getLoansForCalendar(userId, year, month);
};


module.exports = {
  requestLoan,
  confirmLoan,
  processReturn,
  cancelLoan,
  getLoans,
  getUserLoans,
  getLoansForCalendar
};