const { GoogleGenerativeAI } = require("@google/generative-ai");
const Book = require("../models/book.js"); // Import Model Sách

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // --- BƯỚC 1: TÌM SÁCH TRONG DB LIÊN QUAN ĐẾN CÂU HỎI ---
    // Tạo từ khóa tìm kiếm đơn giản từ tin nhắn người dùng
    // (Lấy các sách có tên hoặc tác giả chứa từ khóa trong tin nhắn)
    // Ví dụ: User hỏi "Có sách Harry Potter không?", ta tìm chữ "Harry Potter"
    
    // Lấy tối đa 10 cuốn sách ngẫu nhiên hoặc khớp từ khóa để làm ngữ cảnh
    // Ở đây mình dùng RegExp đơn giản để tìm sách có tên khớp với nội dung chat
    const searchRegex = new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    
    let foundBooks = await Book.find({
        $or: [
            { tenSach: { $regex: searchRegex } },
            { tacGia: { $in: [searchRegex] } },
            { 'categories.tenTheLoai': { $regex: searchRegex } }
        ]
    }).limit(5).select('tenSach tacGia stock _id');

    // Nếu không tìm thấy sách nào khớp (ví dụ user chào hỏi), 
    // ta lấy đại 5 cuốn sách mới nhất để AI có dữ liệu giới thiệu
    if (foundBooks.length === 0) {
        foundBooks = await Book.find().sort({ createdAt: -1 }).limit(5).select('tenSach tacGia stock _id');
    }

    // --- BƯỚC 2: TẠO CONTEXT (NGỮ CẢNH) CHO AI ---
    let bookContext = "Dưới đây là danh sách các sách hiện có trong thư viện:\n";
    foundBooks.forEach(book => {
        const status = book.stock > 0 ? "Còn sách" : "Hết hàng";
        bookContext += `- Tên: "${book.tenSach}", Tác giả: ${book.tacGia}, ID: ${book._id}, Trạng thái: ${status}\n`;
    });

    // --- BƯỚC 3: CẤU HÌNH SYSTEM PROMPT ---
    const systemPrompt = `
      Bạn là 'Nexus AI', thủ thư ảo của thư viện 'Library Nexus'.
      
      DỮ LIỆU SÁCH CỦA THƯ VIỆN:
      ${bookContext}

      NHIỆM VỤ CỦA BẠN:
      1. Trả lời câu hỏi của người dùng dựa trên danh sách sách ở trên.
      2. Nếu người dùng hỏi về sách có trong danh sách, hãy giới thiệu nó và cung cấp đường dẫn mượn sách theo định dạng: [Mượn ngay](/books/ID_SÁCH).
      3. Ví dụ: "Cuốn Harry Potter rất hay. Bạn có thể xem tại đây: [Xem sách](/books/12345)".
      4. Nếu sách hết hàng, hãy báo cho họ biết.
      5. Nếu không có sách nào phù hợp trong danh sách trên, hãy xin lỗi và gợi ý họ tìm kiếm trên thanh Catalog.
      6. Trả lời ngắn gọn, thân thiện bằng tiếng Việt.
    `;

    // --- BƯỚC 4: GỌI GEMINI ---
    // Dùng model mới nhất để tránh lỗi 404
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    const chat = model.startChat({
      history: history || [],
    });

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