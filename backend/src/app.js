
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Online Library API!');
});

// TODO: Import and use API routes here
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/loans', loanRoutes);

// Error handling middleware (will create later)
// app.use(errorHandler);

module.exports = app;