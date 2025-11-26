const Publisher = require('../models/publisher');

const getPublishers = async () => {
  // Sắp xếp mới nhất lên đầu (-1)
  return await Publisher.find().sort({ createdAt: -1 });
};

const getPublisherById = async (id) => {
  return await Publisher.findById(id);
};

const createPublisher = async (publisherData) => {
  const newPublisher = new Publisher(publisherData);
  return await newPublisher.save();
};

const updatePublisher = async (id, updateData) => {
  return await Publisher.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const deletePublisher = async (id) => {
  return await Publisher.findByIdAndDelete(id);
};

module.exports = {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher
};