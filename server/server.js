require('dotenv').config();
const validateEnv = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

validateEnv();

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      const mode = (process.env.LOCAL_MODE === 'true' || process.env.DEMO_MODE === 'true') ? ' (Local Mode)' : '';
      console.log(`KSV Skill Sets server running on port ${PORT} [${process.env.NODE_ENV}]${mode}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
