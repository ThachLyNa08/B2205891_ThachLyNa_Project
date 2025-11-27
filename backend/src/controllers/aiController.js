const { GoogleGenerativeAI } = require("@google/generative-ai");
const Book = require("../models/book");

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // [QUAN TRỌNG] Sử dụng model có trong danh sách của bạn
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // --- BƯỚC 1: TRÍCH XUẤT TỪ KHÓA THÔNG MINH ---
    const extractPrompt = `
      Nhiệm vụ: Trích xuất TỪ KHÓA TÌM KIẾM CỐT LÕI (Tên sách hoặc Tác giả) từ câu của người dùng.
      
      QUY TẮC LOẠI BỎ:
      1. Bỏ các từ chỉ định dạng: "khổ nhỏ", "bìa cứng", "tái bản", "tập 1", "bộ 2", "full", "pdf", "sách", "truyện".
      2. Bỏ các từ cảm thán/hỏi: "có không", "tìm giúp", "cho mình hỏi", "là gì".
      3. Bỏ năm tháng: "2022", "2020".
      4. Bỏ nội dung trong ngoặc đơn () hoặc ngoặc vuông [].
      
      Ví dụ:
      - "Sách Đắc Nhân Tâm (Khổ Nhỏ) (Tái bản 2022) có hong" -> Output: "Đắc Nhân Tâm"
      - "Tìm cuốn Nhà Giả Kim bản mới nhất" -> Output: "Nhà Giả Kim"
      - "Nguyễn Nhật Ánh có truyện gì" -> Output: "Nguyễn Nhật Ánh"
      - "Hello bot" -> Output: "null"
      
      Câu user: "${message}"
      Output (Chỉ 1 cụm từ):
    `;

    const extractionResult = await model.generateContent(extractPrompt);
    let keyword = extractionResult.response.text().trim();
    
    // Làm sạch từ khóa
    keyword = keyword.replace(/^"|"$/g, '').replace(/\(.*?\)/g, '').trim();
    console.log(`🔍 AI Extracted: "${keyword}"`);

    // --- BƯỚC 2: TÌM KIẾM TRONG DB ---
    let foundBooks = [];
    
    if (keyword !== "null" && keyword.length > 0) {
        const searchRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        
        foundBooks = await Book.find({
             $or: [
                { tenSach: { $regex: searchRegex } },
                { tacGia: { $elemMatch: { $regex: searchRegex } } }, 
                { tacGia: { $regex: searchRegex } }
             ]
        }).limit(8).select('tenSach tacGia availableCopies _id pricePerDay coverUrl');
    }

    // Fallback: Tìm "mở rộng" nếu từ khóa dài
    if (foundBooks.length === 0 && keyword.includes(' ')) {
        const shortKeyword = keyword.split(' ').slice(0, 2).join(' ');
        if (shortKeyword.length > 3) {
             const shortRegex = new RegExp(shortKeyword, 'i');
             foundBooks = await Book.find({ tenSach: { $regex: shortRegex } }).limit(5);
        }
    }

    // Nếu vẫn không có, lấy sách mới nhất
    if (foundBooks.length === 0) {
        foundBooks = await Book.find().sort({ createdAt: -1 }).limit(5).select('tenSach tacGia availableCopies _id pricePerDay');
    }

    // --- BƯỚC 3: TẠO CONTEXT ---
    let bookContext = foundBooks.length > 0 
        ? "Dữ liệu sách tìm được trong thư viện:\n" 
        : "Không tìm thấy sách khớp từ khóa, đây là các sách mới nhất:\n";

    foundBooks.forEach(book => {
        const status = book.availableCopies > 0 ? "✅ Còn sách" : "❌ Hết hàng";
        const tacGiaStr = Array.isArray(book.tacGia) ? book.tacGia.join(', ') : book.tacGia;
        bookContext += `- Tên: "${book.tenSach}" | Tác giả: ${tacGiaStr} | ID: ${book._id} | ${status}\n`;
    });

    // --- BƯỚC 4: TRẢ LỜI ---
    const systemPrompt = `
      Bạn là 'Nexus AI'.
      
      THÔNG TIN SÁCH TỪ HỆ THỐNG:
      ${bookContext}

      YÊU CẦU TRẢ LỜI VỚI USER ("${message}"):
      1. Dựa vào danh sách trên để trả lời.
      2. Nếu tìm thấy sách đúng tên ("${keyword}"), xác nhận là CÓ.
      3. BẮT BUỘC tạo link: [Xem sách](/books/ID_SÁCH).
      4. Nếu không đúng sách họ tìm, hãy xin lỗi và gợi ý sách khác trong danh sách.
      5. Ngắn gọn, vui vẻ.
    `;

    const chat = model.startChat({ history: history || [] });
    const result = await chat.sendMessage(systemPrompt);
    const response = result.response.text();

    res.status(200).json({ reply: response });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ reply: "Hệ thống đang bận, bạn thử lại sau nhé! 🤖" });
  }
};

module.exports = { chatWithAI };