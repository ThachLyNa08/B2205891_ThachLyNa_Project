const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body; // history để AI nhớ ngữ cảnh

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Chọn model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Cấu hình vai trò cho AI (System Prompt)
    const systemPrompt = `
      Bạn là 'Nexus AI', một trợ lý ảo thông minh của thư viện 'Library Nexus'.
      Nhiệm vụ của bạn là:
      1. Giúp người dùng tìm sách, gợi ý sách hay.
      2. Giải đáp thắc mắc về quy trình mượn trả sách.
      3. Luôn trả lời ngắn gọn, thân thiện, lịch sự bằng tiếng Việt.
      4. Nếu người dùng hỏi ngoài lề (như code, chính trị...), hãy khéo léo từ chối và quay lại chủ đề sách.
    `;

    // Tạo phiên chat (Chat Session)
    const chat = model.startChat({
      history: history || [], // Lịch sử chat trước đó (nếu có)
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    // Gửi tin nhắn kèm system prompt (mẹo nhỏ để nhắc role)
    const result = await chat.sendMessage(`${systemPrompt}\nUser: ${message}`);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "AI đang bận, vui lòng thử lại sau!" });
  }
};

module.exports = { chatWithAI };