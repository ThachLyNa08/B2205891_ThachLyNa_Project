const categoryService = require('../services/categoryService');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json(category);
  } catch (error) {
    if (error.message.includes('Category not found')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Staff, Admin
const createCategory = async (req, res, next) => {
  try {
    const newCategory = await categoryService.createCategory(req.body);
    res.status(201).json({ message: 'Category created successfully.', category: newCategory });
  } catch (error) {
    // [SỬA] Bắt lỗi thủ công từ Service ném ra
    if (error.message === 'Category name already exists.') {
        return res.status(409).json({ message: error.message });
    }

    // [GIỮ NGUYÊN] Bắt lỗi từ MongoDB (Duplicate Key) phòng hờ
    if (error.code === 11000 && error.keyPattern && error.keyPattern.tenTheLoai) {
      return res.status(409).json({ message: 'Category name already exists.' });
    }
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Staff, Admin
const updateCategory = async (req, res, next) => {
  try {
    const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({ message: 'Category updated successfully.', category: updatedCategory });
  } catch (error) {
    if (error.message.includes('Category not found')) {
      return res.status(404).json({ message: error.message });
    }
    // [NÊN THÊM] Bắt lỗi trùng tên khi update luôn cho chắc
    if (error.code === 11000 || error.message === 'Category name already exists.') {
        return res.status(409).json({ message: 'Category name already exists.' });
    }
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('Category not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    // [MỚI] Bắt lỗi ràng buộc dữ liệu (Nếu đang có sách thuộc thể loại này)
    if (error.message.includes('Cannot delete')) {
        return res.status(409).json({ message: error.message });
    }
    
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};