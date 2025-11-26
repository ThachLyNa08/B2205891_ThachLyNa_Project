const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const notifController = require('../controllers/notificationController');

router.get('/', protect, notifController.getMyNotifications);
router.put('/read-all', protect, notifController.markAsRead);

module.exports = router;