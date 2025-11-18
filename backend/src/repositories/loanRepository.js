
const Loan = require('../models/loan');

const getLoans = async (query = {}, pagination = {}) => {
  const total = await Loan.countDocuments(query);
  const loans = await Loan.find(query)
    .populate('userId', 'username email hoLot ten') // Lấy thông tin cơ bản của user
    .populate('bookId', 'tenSach maSach tacGia coverUrl') // Lấy thông tin cơ bản của sách
    .sort({ ngayMuon: -1 }) // Sắp xếp theo ngày mượn mới nhất
    .skip((pagination.page - 1) * pagination.limit)
    .limit(pagination.limit);
  return { loans, total };
};

const getLoanById = async (id) => {
  return await Loan.findById(id)
    .populate('userId', 'username email hoLot ten')
    .populate('bookId', 'tenSach maSach tacGia coverUrl');
};

const createLoan = async (loanData) => {
  const newLoan = new Loan(loanData);
  return await newLoan.save();
};

const updateLoan = async (id, updateData) => {
  return await Loan.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const deleteLoan = async (id) => {
  return await Loan.findByIdAndDelete(id);
};

// Lấy lịch mượn theo tháng/năm
const getLoansForCalendar = async (userId, year, month) => {
  const startDate = new Date(year, month - 1, 1); // Tháng trong JS là 0-11
  const endDate = new Date(year, month, 0); // Ngày cuối của tháng

  const query = {
    $or: [
      { ngayMuon: { $gte: startDate, $lte: endDate } },
      { ngayHenTra: { $gte: startDate, $lte: endDate } }
    ]
  };
  if (userId) {
    query.userId = userId;
  }

  return await Loan.find(query)
    .populate('bookId', 'tenSach')
    .select('ngayMuon ngayHenTra status bookId userId');
};


module.exports = {
  getLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  getLoansForCalendar
};