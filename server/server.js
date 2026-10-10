require('dotenv').config();
const validateEnv = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

validateEnv();

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`KSV Skill Sets server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
