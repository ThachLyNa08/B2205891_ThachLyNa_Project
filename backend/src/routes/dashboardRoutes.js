const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', protect, authorize('admin', 'staff'), dashboardController.getDashboardStats);

module.exports = router;