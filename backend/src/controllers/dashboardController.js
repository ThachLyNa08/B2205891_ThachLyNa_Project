const Book = require('../models/book');
const User = require('../models/user');
const Loan = require('../models/loan');
const Payment = require('../models/payment'); // Import model Payment

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. THỐNG KÊ SỐ LƯỢNG CƠ BẢN
    const [
      totalBooks,
      totalUsers,
      borrowedLoans,
      overdueLoans,
      newBooksThisMonth,
      newUsersThisMonth
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'reader' }),
      Loan.countDocuments({ status: 'borrowed' }),
      Loan.countDocuments({ 
        $or: [
           { status: 'overdue' },
           { status: 'borrowed', ngayHenTra: { $lt: new Date() } }
        ]
      }),
      Book.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ role: 'reader', createdAt: { $gte: startOfMonth } })
    ]);

    // 2. TOP SÁCH MƯỢN NHIỀU
    const trendingBooks = await Loan.aggregate([
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
          title: "$bookInfo.tenSach",
          author: "$bookInfo.tacGia",
          coverUrl: "$bookInfo.coverUrl",
          stock: "$bookInfo.soQuyen",
          borrowedCount: "$count"
        }
      }
    ]);

    // 3. TOP ĐỘC GIẢ TÍCH CỰC
    const topReaders = await Loan.aggregate([
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo" },
        {
            $project: {
                username: "$userInfo.username",
                email: "$userInfo.email",
                avatar: "$userInfo.avatar",
                borrowedCount: "$count"
            }
        }
    ]);

    // 4. HOẠT ĐỘNG GẦN ĐÂY
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

    // 5. THỐNG KÊ DOANH THU 6 THÁNG (Revenue Stats)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const revenueStats = await Payment.aggregate([
        { 
            $match: { 
                status: 'completed',
                createdAt: { $gte: sixMonthsAgo } 
            } 
        },
        {
            $group: {
                _id: { 
                    month: { $month: "$createdAt" }, 
                    year: { $year: "$createdAt" } 
                },
                totalAmount: { $sum: "$amount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 6. TỔNG TIỀN PHẠT ĐÃ THU (Lấy từ bảng Loan cho chính xác)
    const fineStats = await Loan.aggregate([
        { $match: { isFinePaid: true } }, 
        { $group: { _id: null, total: { $sum: "$phatTien" } } }
    ]);
    const totalFineCollected = fineStats.length > 0 ? fineStats[0].total : 0;

    // 7. BIỂU ĐỒ TĂNG TRƯỞNG (Loan Growth Chart)
    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - (4 * 7)); 

    const weeklyLoans = await Loan.aggregate([
      { $match: { createdAt: { $gte: weeksAgo } } },
      { $group: { _id: { week: { $week: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.week": 1 } } 
    ]);

    const statusDist = await Loan.aggregate([
       { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Tính toán % tăng trưởng (Chỉ khai báo 1 lần tại đây)
    const bookGrowth = totalBooks > 0 ? ((newBooksThisMonth / totalBooks) * 100).toFixed(1) : 0;
    const userGrowth = totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1) : 0;

    // TRẢ VỀ KẾT QUẢ
    res.json({
      stats: {
        totalBooks, 
        totalUsers, 
        borrowedLoans, 
        overdueLoans, 
        bookGrowth, 
        userGrowth,
        totalFineCollected, // Tổng tiền phạt
        monthlyLoans: weeklyLoans,       
        statusDist 
      },
      trendingBooks,
      topReaders,
      activities,
      revenueStats
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê' });
  }
};