
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 

const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(cookieParser()); // Sử dụng cookie-parser

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Online Library API!');
});

// API Routes
app.use('/api/auth', authRoutes); // Sử dụng auth routes
app.use('/api/users', userRoutes);
// TODO: Import and use other API routes here

// app.use('/api/books', bookRoutes);
// app.use('/api/loans', loanRoutes);

// Error handling middleware (will create later)
// app.use(errorHandler);

module.exports = app;