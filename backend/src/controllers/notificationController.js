const Notification = require('../models/notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (error) { res.status(500).json({ message: 'Lỗi lấy thông báo' }); }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'Marked all as read' });
  } catch (error) { res.status(500).json({ message: 'Lỗi cập nhật' }); }
};