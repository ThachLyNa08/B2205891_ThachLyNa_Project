const Category = require('../models/Category');

const getCategories = async (filter = {}) => {
  return await Category.find(filter);
};

const getCategoryById = async (id) => {
  return await Category.findById(id);
};

const createCategory = async (categoryData) => {
  const newCategory = new Category(categoryData);
  return await newCategory.save();
};

const updateCategory = async (id, updateData) => {
  return await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};