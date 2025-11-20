// backend/check_models.js
const axios = require('axios');

// Key của bạn (Lưu ý: Tuyệt đối không chia sẻ Key này công khai)
const API_KEY = 'AIzaSyC82reaSK7WnqaeuSS4c4lLfsFp7TjLHcQ'; 

async function checkAvailableModels() {
  try {
    console.log("⏳ Đang kết nối đến Google API để lấy danh sách model...");
    
    // Gọi API lấy danh sách models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const response = await axios.get(url);
    
    const models = response.data.models;

    console.log("\n✅ KẾT NỐI THÀNH CÔNG! Dưới đây là các model bạn có thể dùng:\n");

    // Lọc ra các model dùng để chat/tạo nội dung (generateContent)
    const chatModels = models.filter(m => 
      m.supportedGenerationMethods && 
      m.supportedGenerationMethods.includes("generateContent")
    );

    chatModels.forEach(model => {
      // model.name sẽ có dạng "models/gemini-1.5-flash"
      // Khi dùng trong code, bạn bỏ chữ "models/" đi
      const shortName = model.name.replace('models/', '');
      console.log(`🔹 Tên đầy đủ: ${model.name}`);
      console.log(`   👉 Tên dùng trong code: "${shortName}"`);
      console.log(`   📝 Mô tả: ${model.displayName}`);
      console.log('-----------------------------------');
    });

  } catch (error) {
    console.error("\n❌ KHÔNG THỂ LẤY DANH SÁCH MODEL!");
    if (error.response) {
      console.error(`Lỗi HTTP ${error.response.status}:`, error.response.data);
    } else {
      console.error("Lỗi kết nối:", error.message);
    }
  }
}

checkAvailableModels();