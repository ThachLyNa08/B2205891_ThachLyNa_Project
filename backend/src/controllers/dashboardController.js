const Book = require('../models/book');
const User = require('../models/user');
const Loan = require('../models/loan');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. THỐNG KÊ SỐ LƯỢNG (Dùng Promise.all để chạy song song cho nhanh)
    const [
      totalBooks,
      totalUsers,
      borrowedLoans,
      overdueLoans,
      newBooksThisMonth,
      newUsersThisMonth
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'reader' }), // Chỉ đếm độc giả
      Loan.countDocuments({ status: 'borrowed' }),
      // Đếm sách quá hạn (status là borrowed VÀ ngày hẹn < hôm nay)
      Loan.countDocuments({ 
        $or: [
           { status: 'overdue' },
           { status: 'borrowed', ngayHenTra: { $lt: new Date() } }
        ]
      }),
      Book.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ role: 'reader', createdAt: { $gte: startOfMonth } })
    ]);

    // 2. TOP SÁCH MƯỢN NHIỀU (Trending)
    // Gom nhóm theo bookId trong bảng Loan và đếm
    const trendingBooks = await Loan.aggregate([
      { $group: { _id: "$bookId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, // Sắp xếp giảm dần
      { $limit: 5 },            // Lấy top 5
      { 
        $lookup: { // Join với bảng Books để lấy tên sách
          from: "books", 
          localField: "_id", 
          foreignField: "_id", 
          as: "bookInfo" 
        } 
      },
      { $unwind: "$bookInfo" },
      {
        $project: {
          title: "$bookInfo.tenSach",
          author: "$bookInfo.tacGia",
          stock: "$bookInfo.stock",
          borrowedCount: "$count"
        }
      }
    ]);

    // 3. HOẠT ĐỘNG GẦN ĐÂY (Recent Activities)
    // Lấy 5 phiếu mượn mới nhất
    const recentLoans = await Loan.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('userId', 'username')
      .populate('bookId', 'tenSach');

    const activities = recentLoans.map(loan => {
      let actionText = '';
      let color = '';
      if (loan.status === 'pending') { actionText = 'requested'; color = 'orange'; }
      else if (loan.status === 'borrowed') { actionText = 'borrowed'; color = 'blue'; }
      else if (loan.status === 'returned') { actionText = 'returned'; color = 'green'; }
      else if (loan.status === 'overdue') { actionText = 'is overdue on'; color = 'red'; }
      
      return {
        user: loan.userId ? loan.userId.username : 'Unknown User',
        action: `${actionText} "${loan.bookId ? loan.bookId.tenSach : 'Deleted Book'}"`,
        time: loan.updatedAt,
        color: color
      };
    });

    // Tính toán % tăng trưởng giả định (Ví dụ: so với tổng số)
    const bookGrowth = totalBooks > 0 ? ((newBooksThisMonth / totalBooks) * 100).toFixed(1) : 0;
    const userGrowth = totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1) : 0;
    // 4. BIỂU ĐỒ TĂNG TRƯỞNG (Mượn sách 6 tháng gần nhất)
    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - (4 * 7)); // 8 tuần

    const weeklyLoans = await Loan.aggregate([
      { 
        $match: { createdAt: { $gte: weeksAgo } } // Chỉ lấy dữ liệu 8 tuần gần nhất
      },
      {
        $group: {
          // Gom nhóm theo Tuần trong năm (week)
          _id: { 
             week: { $week: "$createdAt" }, 
             year: { $year: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } } // Sắp xếp tăng dần
    ]);


    const statusDist = await Loan.aggregate([
       { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({
      stats: {
        totalBooks,
        totalUsers,
        borrowedLoans,
        overdueLoans,
        bookGrowth,
        userGrowth,
        monthlyLoans: weeklyLoans,       
        statusDist 
      },
      trendingBooks,
      activities
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê' });
  }
};