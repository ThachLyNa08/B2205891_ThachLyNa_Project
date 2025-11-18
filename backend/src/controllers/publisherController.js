
const publisherService = require('../services/publisherService');

// @desc    Get all publishers
// @route   GET /api/publishers
// @access  Public
const getPublishers = async (req, res, next) => {
  try {
    const publishers = await publisherService.getPublishers();
    res.status(200).json(publishers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get publisher by ID
// @route   GET /api/publishers/:id
// @access  Public
const getPublisher = async (req, res, next) => {
  try {
    const publisher = await publisherService.getPublisherById(req.params.id);
    res.status(200).json(publisher);
  } catch (error) {
    if (error.message.includes('Publisher not found')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Create a new publisher
// @route   POST /api/publishers
// @access  Private/Staff, Admin
const createPublisher = async (req, res, next) => {
  try {
    const newPublisher = await publisherService.createPublisher(req.body);
    res.status(201).json({ message: 'Publisher created successfully.', publisher: newPublisher });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.tenNXB) {
      return res.status(409).json({ message: 'Publisher name already exists.' });
    }
    next(error);
  }
};

// @desc    Update a publisher
// @route   PUT /api/publishers/:id
// @access  Private/Staff, Admin
const updatePublisher = async (req, res, next) => {
  try {
    const updatedPublisher = await publisherService.updatePublisher(req.params.id, req.body);
    res.status(200).json({ message: 'Publisher updated successfully.', publisher: updatedPublisher });
  } catch (error) {
    if (error.message.includes('Publisher not found')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Delete a publisher
// @route   DELETE /api/publishers/:id
// @access  Private/Admin
const deletePublisher = async (req, res, next) => {
  try {
    const result = await publisherService.deletePublisher(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('Publisher not found')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getPublishers,
  getPublisher,
  createPublisher,
  updatePublisher,
  deletePublisher
};