const { GoogleGenerativeAI } = require("@google/generative-ai");
const Book = require("../models/book");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (userMessage) => {
  try {
    // 1. Tìm kiếm sơ bộ sách trong DB liên quan đến câu hỏi
    // (Tìm theo tên sách hoặc tác giả hoặc thể loại có trong câu hỏi)
    const books = await Book.find({
      $or: [
        { tenSach: { $regex: userMessage, $options: "i" } },
        { tacGia: { $regex: userMessage, $options: "i" } },
        // Có thể mở rộng tìm theo mô tả nếu cần
      ]
    }).limit(5).populate('categories'); // Lấy tối đa 5 cuốn liên quan nhất

    // 2. Tạo Context (Ngữ cảnh) cho AI
    let context = "";
    if (books.length > 0) {
      context = "Dưới đây là thông tin các cuốn sách có trong thư viện phù hợp với câu hỏi:\n";
      books.forEach(b => {
        context += `- Tên: ${b.tenSach}, Tác giả: ${b.tacGia.join(', ')}, Giá thuê: ${b.pricePerDay}đ/ngày, Tình trạng: ${b.availableCopies > 0 ? 'Còn hàng' : 'Hết hàng'}.\n`;
      });
    } else {
      // Nếu không tìm thấy theo từ khóa, lấy random vài cuốn đề xuất
      const randomBooks = await Book.aggregate([{ $sample: { size: 3 } }]);
      context = "Hiện không tìm thấy sách khớp chính xác tên, nhưng có thể gợi ý các sách nổi bật này:\n";
      randomBooks.forEach(b => {
        context += `- ${b.tenSach} của ${b.tacGia}\n`;
      });
    }

    // 3. Cấu hình Model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Bạn là trợ lý ảo của thư viện sách "Library Nexus".
      Nhiệm vụ của bạn là trả lời câu hỏi của người dùng và gợi ý sách dựa trên dữ liệu được cung cấp dưới đây.
      
      DỮ LIỆU SÁCH TỪ HỆ THỐNG:
      ${context}

      CÂU HỎI CỦA NGƯỜI DÙNG: "${userMessage}"

      YÊU CẦU:
      - Trả lời ngắn gọn, thân thiện bằng tiếng Việt.
      - Chỉ gợi ý sách có trong dữ liệu trên.
      - Nếu người dùng hỏi ngoài lề, hãy lái về chủ đề sách một cách khéo léo.
      - Định dạng câu trả lời đẹp (dùng xuống dòng).
    `;

    // 4. Gửi cho AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("AI Error:", error);
    return "Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau.";
  }
};

module.exports = { chatWithAI };