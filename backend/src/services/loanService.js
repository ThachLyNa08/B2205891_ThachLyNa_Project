// backend/src/services/loanService.js
const loanRepository = require('../repositories/loanRepository');
const Book = require('../models/book'); 
const User = require('../models/user'); 

const OVERDUE_FINE_PER_DAY = 10000; 

const requestLoan = async (userId, bookId, ngayHenTra) => {
    // BỎ transaction
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

    // Tạm thời chưa trừ kho ngay, hoặc trừ luôn tùy logic của bạn
    // book.availableCopies -= 1;
    // await book.save();

    return newLoan;
};

const confirmLoan = async (loanId, staffUserId) => {
    const loan = await loanRepository.getLoanById(loanId);
    if (!loan) throw new Error('Loan request not found.');
    if (loan.status !== 'pending') throw new Error('Loan is not in pending status.');
    if (loan.rentCost > 0 && !loan.isPaid) {
      throw new Error(
        `Cannot approve: User has not paid the rental fee (${loan.rentCost} VND).`
      );
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

const processReturn = async (loanId, staffUserId) => {
    const loan = await loanRepository.getLoanById(loanId);
    if (!loan) throw new Error('Loan not found.');
    if (loan.status === 'returned') throw new Error('Already returned.');

    const book = await Book.findById(loan.bookId);

    // Tính phạt
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

// Các hàm getter giữ nguyên
const getLoans = async (query, pagination) => loanRepository.getLoans(query, pagination);
const getLoanById = async (id) => loanRepository.getLoanById(id);
const getLoansForCalendar = async (userId, year, month) => loanRepository.getLoansForCalendar(userId, year, month);

module.exports = {
  requestLoan,
  confirmLoan,
  processReturn,
  cancelLoan,
  getLoans,
  getLoanById,
  getLoansForCalendar
};