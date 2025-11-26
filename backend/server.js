
require('dotenv').config(); // Load environment variables from .env file
const app = require('./src/app');
const mongoose = require('mongoose');
const setupCronJobs = require('./src/cron/cronJobs');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.DB_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB'); 
    // Start the server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process if DB connection fails
  });
  setupCronJobs();