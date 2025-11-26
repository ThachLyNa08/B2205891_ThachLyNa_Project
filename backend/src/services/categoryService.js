
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

// [SỬA] Hàm xóa thể loại có kiểm tra ràng buộc
const deleteCategory = async (id) => {
  // 1. Kiểm tra xem có sách nào thuộc thể loại này không
  const bookCount = await Book.countDocuments({ categories: id });
  
  if (bookCount > 0) {
      throw new Error(`Cannot delete: This category is used by ${bookCount} book(s).`);
  }

  // 2. Nếu không có sách nào dùng, tiến hành xóa
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