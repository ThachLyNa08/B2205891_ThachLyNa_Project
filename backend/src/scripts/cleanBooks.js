// backend/src/scripts/cleanBooks.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Book = require('../models/book');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

const clean = async () => {
    await connectDB();

    console.log("🧹 Cleaning up books without valid images...");

    // Xóa sách thỏa mãn một trong các điều kiện sau
    const res = await Book.deleteMany({
        $or: [
            { coverUrl: null },               // Ảnh null
            { coverUrl: "" },                 // Ảnh rỗng
            { coverUrl: { $regex: "ring_loader", $options: "i" } }, // Ảnh là icon loading của Fahasa
            { coverUrl: { $not: { $regex: "http", $options: "i" } } } // Link không hợp lệ (không có http)
        ]
    });

    console.log(`🗑️  Deleted ${res.deletedCount} books with invalid/missing images.`);
    process.exit();
};

clean();