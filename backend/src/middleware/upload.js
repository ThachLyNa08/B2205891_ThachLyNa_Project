const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Xác định đường dẫn tuyệt đối đến thư mục uploads
// __dirname là thư mục hiện tại (src/middleware), lùi ra 2 cấp để về root (backend)
const uploadDir = path.join(__dirname, '../../uploads');

// 2. Kiểm tra nếu chưa có thư mục thì tự động tạo
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 3. Cấu hình Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Lưu vào đường dẫn tuyệt đối đã xác định
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique: timestamp-random-tengoc
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 4. Bộ lọc file (Chỉ nhận ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, jpeg, webp)!'), false);
  }
};

// 5. Khởi tạo Multer (Thêm giới hạn dung lượng để bảo mật)
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

module.exports = upload;