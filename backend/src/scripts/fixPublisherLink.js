// backend/src/scripts/fixPublisherLink.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Book = require('../models/book');
const Publisher = require('../models/publisher');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

const fixData = async () => {
    await connectDB();

    // 1. Nhập tên Nhà Xuất Bản bạn vừa tạo lại vào đây
    const TARGET_PUBLISHER_NAME = 'Fahasa'; 

    try {
        // Tìm ID của NXB mới
        const publisher = await Publisher.findOne({ 
            tenNXB: { $regex: new RegExp(TARGET_PUBLISHER_NAME, 'i') } 
        });

        if (!publisher) {
            console.error(`❌ Không tìm thấy NXB nào tên là "${TARGET_PUBLISHER_NAME}". Hãy tạo nó trong trang Admin trước!`);
            process.exit(1);
        }

        console.log(`Found Publisher: ${publisher.tenNXB} (ID: ${publisher._id})`);
        console.log("Updating books...");

        // 2. Cập nhật TẤT CẢ sách về NXB này
        // (Hoặc bạn có thể lọc chỉ cập nhật những sách chưa có NXB hợp lệ nếu muốn)
        const result = await Book.updateMany(
            {}, // Lọc: Tất cả sách
            { $set: { maNXB: publisher._id } } // Set về ID mới
        );

        console.log(`✅ Đã cập nhật lại liên kết NXB cho ${result.modifiedCount} cuốn sách.`);

    } catch (error) {
        console.error("Fix failed:", error);
    } finally {
        process.exit();
    }
};

fixData();