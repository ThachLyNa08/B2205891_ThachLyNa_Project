// backend/src/app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes'); 
const publisherRoutes = require('./routes/publisherRoutes'); 
const loanRoutes = require('./routes/loanRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(cookieParser());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Online Library!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes); // Sử dụng book routes
app.use('/api/categories', categoryRoutes); // Sử dụng category routes
app.use('/api/publishers', publisherRoutes); // Sử dụng publisher routes
app.use('/api/loans', loanRoutes);
// TODO: Error handling middleware
// app.use(errorHandler);

module.exports = app;