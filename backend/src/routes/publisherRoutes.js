
const express = require('express');
const publisherController = require('../controllers/publisherController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(publisherController.getPublishers) // Public access
  .post(protect, authorize('admin', 'staff'), publisherController.createPublisher); // Admin/Staff to create publishers

router.route('/:id')
  .get(publisherController.getPublisher) // Public access
  .put(protect, authorize('admin', 'staff'), publisherController.updatePublisher) // Admin/Staff to update publishers
  .delete(protect, authorize('admin'), publisherController.deletePublisher); // Admin to delete publishers

module.exports = router;