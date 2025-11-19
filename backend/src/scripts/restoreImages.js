// backend/src/scripts/restoreImages.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
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

const restore = async () => {
  await connectDB();

  const results = [];
  const filePath = path.join(__dirname, '../../../fahasa_books.csv');

  console.log("🔄 Reading CSV to restore images...");

  fs.createReadStream(filePath)
    .pipe(csv({
        mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, '')
    }))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      let count = 0;
      
      // Dùng for...of để chạy tuần tự, tránh quá tải DB
      for (const row of results) {
        const tenSach = row['Tên sách']?.trim();
        const anhGoc = row['Ảnh']?.trim();

        if (tenSach && anhGoc) {
            // Tìm sách và cập nhật lại ảnh từ CSV
            const res = await Book.updateOne(
                { tenSach: tenSach }, 
                { $set: { coverUrl: anhGoc } }
            );
            
            if (res.matchedCount > 0) {
                // process.stdout.write('.');
                count++;
            }
        }
      }

      console.log(`\n✅ Restored images for ${count} books from CSV.`);
      console.log("NOTE: Nếu ảnh vẫn lỗi (ô trắng), có thể do link ảnh Fahasa chặn hiển thị trên localhost (403 Forbidden).");
      process.exit();
    });
};

restore();