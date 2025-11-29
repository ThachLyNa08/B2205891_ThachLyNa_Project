const cron = require('node-cron');
const Loan = require('../models/loan');
const Notification = require('../models/notification');

const setupCronJobs = () => {
  // Chạy vào 00:00 (nửa đêm) hàng ngày
  // Cấu trúc cron: 'phút giờ ngày tháng thứ' -> '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('--- [CRON] Bắt đầu kiểm tra hạn trả sách ---');
    
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // TÌM SÁCH SẮP HẾT HẠN (Còn 1 ngày)
      // Logic: status = borrowed VÀ ngayHenTra nằm trong ngày mai
      const startOfTomorrow = new Date(tomorrow.setHours(0,0,0,0));
      const endOfTomorrow = new Date(tomorrow.setHours(23,59,59,999));

      const dueSoonLoans = await Loan.find({
        status: 'borrowed',
        ngayHenTra: { $gte: startOfTomorrow, $lte: endOfTomorrow }
      }).populate('bookId');

      for (const loan of dueSoonLoans) {
        // Tạo thông báo
        await Notification.create({
          userId: loan.userId,
          title: 'Sắp đến hạn trả sách',
          message: `Cuốn sách "${loan.bookId.tenSach}" cần được trả vào ngày mai.`,
          type: 'warning',
          link: '/my-loans'
        });
      }
      console.log(`-> Đã gửi thông báo sắp hết hạn cho ${dueSoonLoans.length} phiếu.`);

      // 2. TÌM SÁCH QUÁ HẠN (Vừa qua hạn hôm qua hoặc đang quá hạn mà chưa trả)
      // Logic: status = borrowed VÀ ngayHenTra < hôm nay
      // Để tránh spam ngày nào cũng báo, bạn có thể thêm logic kiểm tra xem đã báo chưa.
      const overdueLoans = await Loan.find({
        status: 'borrowed',
        ngayHenTra: { $lt: new Date().setHours(0,0,0,0) }
      }).populate('bookId');

      for (const loan of overdueLoans) {
        // Cập nhật trạng thái loan sang 'overdue' nếu chưa đổi
        if (loan.status !== 'overdue') {
            loan.status = 'overdue';
            await loan.save();
        }

        // Tạo thông báo
        await Notification.create({
          userId: loan.userId,
          title: 'Sách đã QUÁ HẠN',
          message: `Cuốn sách "${loan.bookId.tenSach}" đã quá hạn. Vui lòng trả ngay để tránh phí phạt tăng thêm.`,
          type: 'error',
          link: '/my-loans'
        });
      }
      console.log(`-> Đã xử lý quá hạn cho ${overdueLoans.length} phiếu.`);

    } catch (error) {
      console.error('[CRON ERROR]', error);
    }
  });
};

module.exports = setupCronJobs;