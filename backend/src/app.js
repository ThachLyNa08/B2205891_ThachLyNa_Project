// backend/src/app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // Bảo mật HTTP headers
const morgan = require('morgan'); // Log request để debug
const path = require('path');
const passport = require('passport');


// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes'); 
const publisherRoutes = require('./routes/publisherRoutes'); 
const loanRoutes = require('./routes/loanRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// --- MIDDLEWARES ---

// 1. Bảo mật Headers
// QUAN TRỌNG: Cần cấu hình crossOriginResourcePolicy: false 
// để Frontend (port 5173) có thể load được ảnh từ Backend (port 5000/uploads)

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// 2. Logging (Chỉ hiện trong môi trường dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. Parser
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Để đọc form data
app.use(passport.initialize());
// 4. CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Frontend Vue (Vite)
  'http://localhost:8080', // Frontend Vue (Webpack cũ nếu có)
  process.env.CLIENT_URL   // Biến môi trường (Production)
];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép các request không có origin (như Postman, Mobile App) hoặc nằm trong whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Cho phép gửi cookie (refresh token)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- ROUTES ---

// Test route
app.get('/', (req, res) => {
  res.send('Welcome to the Library Nexus API!');
});
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
// Cấu hình Static Folder cho ảnh
// Giả định cấu trúc thư mục là: backend/src/app.js và backend/uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes); 
app.use('/api/categories', categoryRoutes); 
app.use('/api/publishers', publisherRoutes); 
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes); // Đã xóa số 2 thừa ở đây
app.use('/api/ai', aiRoutes);

app.use(helmet({
  crossOriginResourcePolicy: false, 
}));
// --- ERROR HANDLING ---

// 404 Not Found Handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Chỉ log stack trace nếu không phải production
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err.message);
    if (err.stack) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

module.exports = app;