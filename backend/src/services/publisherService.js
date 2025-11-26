const publisherRepository = require('../repositories/publisherRepository');

const getPublishers = async () => {
  return await publisherRepository.getPublishers();
};

const getPublisherById = async (id) => {
  const publisher = await publisherRepository.getPublisherById(id);
  if (!publisher) {
    throw new Error('Publisher not found');
  }
  return publisher;
};

const createPublisher = async (data) => {
  return await publisherRepository.createPublisher(data);
};

const updatePublisher = async (id, data) => {
  const updatedPublisher = await publisherRepository.updatePublisher(id, data);
  if (!updatedPublisher) {
    throw new Error('Publisher not found');
  }
  return updatedPublisher;
};

const deletePublisher = async (id) => {
  const deletedPublisher = await publisherRepository.deletePublisher(id);
  if (!deletedPublisher) {
    throw new Error('Publisher not found');
  }
  return { message: 'Publisher deleted successfully' };
};

module.exports = {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher
};