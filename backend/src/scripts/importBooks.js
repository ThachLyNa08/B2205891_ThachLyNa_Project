const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');

// Import Models
const Book = require('../models/book');
const Category = require('../models/Category');
const Publisher = require('../models/publisher');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Hàm tạo mã sách ngẫu nhiên
const generateBookCode = () => {
  return 'B' + Math.floor(100000 + Math.random() * 900000);
};

// Hàm tạo ISBN giả ngẫu nhiên (13 số)
const generateISBN = () => {
    return '978-' + Math.floor(100000000 + Math.random() * 900000000);
};

const importData = async () => {
  await connectDB();

  let publisher = await Publisher.findOne({ tenNXB: 'Fahasa' });
  if (!publisher) {
    publisher = await Publisher.create({
      tenNXB: 'Fahasa',
      diaChi: 'TP.HCM',
      email: 'contact@fahasa.com',
      dienThoai: '1900636467'
    });
    console.log('✅ Created default Publisher: Fahasa');
  }

  const results = [];
  const filePath = path.join(__dirname, '../../../fahasa_books.csv');

  fs.createReadStream(filePath)
    .pipe(csv({
        mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, '')
    }))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Found ${results.length} rows. Importing...`);

      let successCount = 0;
      let errorCount = 0;

      for (const row of results) {
        try {
          const tenSach = row['Tên sách']?.trim();
          if (!tenSach) continue;

          //Xử lý Thể loại
          let categoryName = row['Thể loại']?.trim() || 'Khác';
          let category = await Category.findOne({ tenTheLoai: categoryName });
          if (!category) {
            category = await Category.create({ tenTheLoai: categoryName });
          }

          //Kiểm tra sách tồn tại theo tên
          const existingBook = await Book.findOne({ tenSach: tenSach });
          
          if (!existingBook) {
            const randomPrice = Math.floor(Math.random() * (200 - 50 + 1) + 50) * 1000;
            
            // Tạo MaSach và ISBN ngẫu nhiên để tránh lỗi Unique
            let newMaSach = generateBookCode();
            while (await Book.exists({ maSach: newMaSach })) {
                newMaSach = generateBookCode();
            }

            let newISBN = generateISBN();
            // Kiểm tra trùng ISBN (tuy hiếm nhưng cho chắc chắn)
            while (await Book.exists({ isbn: newISBN })) {
                newISBN = generateISBN();
            }

            await Book.create({
              maSach: newMaSach,
              isbn: newISBN, 
              tenSach: tenSach,
              coverUrl: row['Ảnh'] || '',
              categories: [category._id],
              maNXB: publisher._id,
              donGia: randomPrice,
              soQuyen: 20,
              availableCopies: 20,
              tacGia: ['Unknown Author'],
              moTa: `Sách nhập khẩu từ Fahasa. Link gốc: ${row['Link']}`,
              namXuatBan: 2023
            });
            process.stdout.write('.');
            successCount++;
          } else {
             process.stdout.write('s');
          }
        } catch (error) {
          if (error.code === 11000) { 
             // Log chi tiết hơn xem trùng trường nào
             console.error(`\nDuplicate Key Error for "${row['Tên sách']}":`, JSON.stringify(error.keyValue));
          } else {
             console.error(`\n❌ Error:`, error.message);
          }
          errorCount++;
        }
      }

      console.log(`\n\n🎉 Import Completed!`);
      console.log(`✅ Success: ${successCount}`);
      console.log(`❌ Errors/Skipped: ${errorCount}`);
      process.exit();
    });
};

importData();