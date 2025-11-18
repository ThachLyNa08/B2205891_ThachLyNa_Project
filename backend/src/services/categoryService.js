
const categoryRepository = require('../repositories/categoryRepository');

const getCategories = async () => {
  return await categoryRepository.getCategories();
};

const getCategoryById = async (id) => {
  const category = await categoryRepository.getCategoryById(id);
  if (!category) {
    throw new Error('Category not found.');
  }
  return category;
};

const createCategory = async (categoryData) => {
  const existingCategory = await categoryRepository.getCategories({ tenTheLoai: categoryData.tenTheLoai });
  if (existingCategory && existingCategory.length > 0) {
      throw new Error('Category name already exists.');
  }
  const category = await categoryRepository.createCategory(categoryData);
  return category;
};

const updateCategory = async (id, updateData) => {
  const category = await categoryRepository.updateCategory(id, updateData);
  if (!category) {
    throw new Error('Category not found.');
  }
  return category;
};

const deleteCategory = async (id) => {
  // TODO: Kiểm tra xem có sách nào thuộc thể loại này không trước khi xóa
  const result = await categoryRepository.deleteCategory(id);
  if (!result) {
    throw new Error('Category not found.');
  }
  return result;
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};