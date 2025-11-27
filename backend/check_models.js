const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ Chưa có GEMINI_API_KEY trong file .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        // Đây là cách lấy danh sách model (dùng fetch thủ công vì SDK đôi khi ẩn hàm này)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        console.log("✅ DANH SÁCH MODEL KHẢ DỤNG:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("Không tìm thấy model nào. Lỗi:", data);
        }
    } catch (error) {
        console.error("❌ Lỗi kiểm tra:", error.message);
    }
}

run();