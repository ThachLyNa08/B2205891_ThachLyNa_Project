const Review = require('../models/review');
const Book = require('../models/book');

// 1. Thêm đánh giá
exports.addReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const userId = req.user._id;

    // Kiểm tra xem user đã review chưa (nếu muốn giới hạn)
    const existingReview = await Review.findOne({ userId, bookId });
    if (existingReview) {
        return res.status(400).json({ message: 'Bạn đã đánh giá sách này rồi.' });
    }

    const review = await Review.create({ userId, bookId, rating, comment });

    res.status(201).json({ message: 'Đánh giá thành công!', review });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 2. Lấy đánh giá của 1 cuốn sách
exports.getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
      .populate('userId', 'username avatar') // Lấy tên và avatar người review
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy đánh giá' });
  }
};

// 3. Lấy TẤT CẢ đánh giá (Cho Admin)
exports.getAllReviews = async (req, res) => {
    try {
      const reviews = await Review.find()
        .populate('userId', 'username email')
        .populate('bookId', 'tenSach')
        .sort({ createdAt: -1 });
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
    }
};

// 4. Xóa đánh giá (Cho Admin hoặc chính chủ)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy' });

    // Chỉ cho phép Admin hoặc người viết xóa
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && review.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Không có quyền xóa' });
    }

    await review.deleteOne();
    res.status(200).json({ message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa' });
  }
};