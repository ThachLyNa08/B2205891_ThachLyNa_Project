// backend/src/scripts/enrichData.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const Book = require('../models/book');

// Kết nối Database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

// Hàm gọi Google Books API
const fetchBookInfo = async (query) => {
    try {
        // Tìm kiếm chính xác theo tên sách
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1&langRestrict=vi`;
        const res = await axios.get(url);
        
        if (res.data.items && res.data.items.length > 0) {
            const info = res.data.items[0].volumeInfo;
            return {
                authors: info.authors || ['Unknown Author'],
                image: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null, // Lấy ảnh HTTPS
                description: info.description ? info.description.substring(0, 500) + '...' : null,
                publishedDate: info.publishedDate
            };
        }
    } catch (error) {
        // Bỏ qua lỗi mạng để chạy tiếp
    }
    return null;
};

const run = async () => {
    await connectDB();

    console.log("🔍 Scanning database for missing data...");

    // 1. Lấy tất cả sách chưa có tác giả hoặc đang là "Unknown Author"
    // Hoặc bạn có thể bỏ bộ lọc để cập nhật lại toàn bộ sách
    const books = await Book.find({
        $or: [
            { tacGia: { $size: 0 } },          // Mảng tác giả rỗng
            { tacGia: 'Unknown Author' },      // Tác giả chưa biết
            // { coverUrl: '' }                // Hoặc thiếu ảnh (bật lên nếu muốn)
        ]
    }).limit(500); // Giới hạn 500 cuốn mỗi lần chạy để tránh spam API Google

    console.log(`📚 Found ${books.length} books to enrich.`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const book of books) {
        process.stdout.write(`Processing: "${book.tenSach}"... `);

        const googleInfo = await fetchBookInfo(book.tenSach);

        if (googleInfo) {
            let updateFields = {};

            // Cập nhật Tác giả (nếu tìm thấy)
            if (googleInfo.authors && !googleInfo.authors.includes('Unknown Author')) {
                updateFields.tacGia = googleInfo.authors;
            }

            // Cập nhật Ảnh bìa (nếu ảnh cũ rỗng hoặc muốn ưu tiên ảnh Google)
            // Dòng dưới đây sẽ GHI ĐÈ ảnh cũ bằng ảnh Google (thường chất lượng hơn Fahasa)
            if (googleInfo.image) {
                updateFields.coverUrl = googleInfo.image; 
            }
            
            // Cập nhật Mô tả (nếu mô tả cũ ngắn hoặc là link rác)
            if (googleInfo.description && (!book.moTa || book.moTa.includes('http'))) {
                updateFields.moTa = googleInfo.description;
            }

            if (Object.keys(updateFields).length > 0) {
                await Book.updateOne({ _id: book._id }, { $set: updateFields });
                console.log(`✅ Updated`);
                updatedCount++;
            } else {
                console.log(`Pass (No new data)`);
                skippedCount++;
            }
        } else {
            console.log(`❌ Not Found on Google`);
            skippedCount++;
        }

        // Nghỉ 0.5s để tránh bị Google chặn (Rate Limit)
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\n🎉 Finished! Updated: ${updatedCount} | Skipped/Not Found: ${skippedCount}`);
    process.exit();
};

run();