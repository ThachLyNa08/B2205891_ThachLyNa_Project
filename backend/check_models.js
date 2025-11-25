// File: backend/check_models.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    // Đoạn này chỉ để init, ta dùng genAI để list
    // Google SDK hiện tại chưa có hàm list trực tiếp đơn giản trong document mới nhất
    // Nhưng ta có thể test thử gọi 1 model cơ bản nhất:
    
    console.log("Đang kiểm tra model gemini-1.5-flash-latest...");
    const testModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await testModel.generateContent("Hello");
    console.log("Kết quả: Model hoạt động tốt!", result.response.text());
    
  } catch (error) {
    console.error("Lỗi:", error.message);
    console.log("Thử đổi sang 'gemini-pro' hoặc 'gemini-1.0-pro' xem sao.");
  }
}

listModels();