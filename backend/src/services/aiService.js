const { GoogleGenerativeAI } = require("@google/generative-ai");
const Book = require("../models/book");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateResponse = async (userMessage) => {
  try {
    // 1. TÌM KIẾM SÁCH LIÊN QUAN (RAG - Retrieval Augmented Generation đơn giản)
    // Tìm các sách có tên hoặc tác giả gần giống với câu hỏi của user
    const books = await Book.find({
      $or: [
        { tenSach: { $regex: userMessage, $options: "i" } },
        { tacGia: { $regex: userMessage, $options: "i" } },
        { moTa: { $regex: userMessage, $options: "i" } } // Thêm tìm trong mô tả
      ]
    }).limit(10).select('tenSach tacGia availableCopies _id pricePerDay'); // Lấy nhiều hơn chút để AI chọn

    // Nếu không tìm thấy theo từ khóa, lấy random sách "Thịnh hành" để gợi ý
    let contextBooks = books;
    if (books.length === 0) {
        const randomBooks = await Book.aggregate([{ $sample: { size: 5 } }]);
        // Map lại cấu trúc cho giống find()
        contextBooks = randomBooks.map(b => ({
            tenSach: b.tenSach,
            tacGia: b.tacGia,
            availableCopies: b.availableCopies,
            _id: b._id,
            pricePerDay: b.pricePerDay
        }));
    }

    // 2. TẠO CONTEXT (NGỮ CẢNH) CHO AI
    let contextData = contextBooks.map(b => 
        `- Tên: "${b.tenSach}"
         - Tác giả: ${Array.isArray(b.tacGia) ? b.tacGia.join(', ') : b.tacGia}
         - ID Sách: ${b._id}
         - Giá thuê: ${b.pricePerDay} đ/ngày
         - Trạng thái: ${b.availableCopies > 0 ? 'Có sẵn' : 'Hết hàng'}`
    ).join('\n\n');

    // 3. CẤU HÌNH PROMPT (CÂU LỆNH HỆ THỐNG)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Bạn là "Nexus Bot" - Trợ lý ảo thông minh của thư viện Library Nexus.
      
      DƯỚI ĐÂY LÀ DỮ LIỆU SÁCH TÌM ĐƯỢC TỪ HỆ THỐNG (Dùng dữ liệu này để trả lời):
      -------------------
      ${contextData}
      -------------------

      CÂU HỎI CỦA NGƯỜI DÙNG: "${userMessage}"

      QUY TẮC TRẢ LỜI BẮT BUỘC:
      1. Nếu người dùng hỏi về sách, HÃY DỰA VÀO DỮ LIỆU TRÊN để trả lời.
      2. Khi nhắc đến tên một cuốn sách cụ thể, BẮT BUỘC phải định dạng link Markdown như sau:
         👉 [Tên Sách](/books/ID_CỦA_SÁCH)
         (Ví dụ: Bạn nên đọc cuốn [Nhà Giả Kim](/books/65f1a2b3c4d5e6f7)...)
      3. Nếu danh sách rỗng hoặc không liên quan, hãy xin lỗi và gợi ý các sách có trong danh sách "Thịnh hành" (nếu có dữ liệu random ở trên).
      4. Cung cấp thêm thông tin giá thuê và trạng thái (còn hàng hay không) để người dùng biết.
      5. Giọng điệu: Thân thiện, chuyên nghiệp, ngắn gọn, dùng emoji 📚✨.
      6. Tuyệt đối không bịa ra sách không có trong danh sách trên.
    `;

    // 4. GỬI YÊU CẦU
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("AI Service Error:", error);
    return "Hệ thống AI đang quá tải hoặc gặp sự cố. Bạn vui lòng thử tìm kiếm thủ công nhé! 😓";
  }
};

module.exports = { generateResponse }; // Export đúng tên hàm dùng ở Controller