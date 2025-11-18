
const publisherRepository = require('../repositories/publisherRepository');

const getPublishers = async () => {
  return await publisherRepository.getPublishers();
};

const getPublisherById = async (id) => {
  const publisher = await publisherRepository.getPublisherById(id);
  if (!publisher) {
    throw new Error('Publisher not found.');
  }
  return publisher;
};

const createPublisher = async (publisherData) => {
  const existingPublisher = await publisherRepository.getPublishers({ tenNXB: publisherData.tenNXB });
  if (existingPublisher && existingPublisher.length > 0) {
      throw new Error('Publisher name already exists.');
  }
  const publisher = await publisherRepository.createPublisher(publisherData);
  return publisher;
};

const updatePublisher = async (id, updateData) => {
  const publisher = await publisherRepository.updatePublisher(id, updateData);
  if (!publisher) {
    throw new Error('Publisher not found.');
  }
  return publisher;
};

const deletePublisher = async (id) => {
  // TODO: Kiểm tra xem có sách nào thuộc NXB này không trước khi xóa
  const result = await publisherRepository.deletePublisher(id);
  if (!result) {
    throw new Error('Publisher not found.');
  }
  return result;
};

module.exports = {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher
};