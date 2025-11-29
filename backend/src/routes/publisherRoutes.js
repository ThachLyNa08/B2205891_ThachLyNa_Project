
const express = require('express');
const publisherController = require('../controllers/publisherController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(publisherController.getPublishers) 
  .post(protect, authorize('admin', 'staff'), publisherController.createPublisher); 

router.route('/:id')
  .get(publisherController.getPublisher) 
  .put(protect, authorize('admin', 'staff'), publisherController.updatePublisher) 
  .delete(protect, authorize('admin'), publisherController.deletePublisher); 

module.exports = router;