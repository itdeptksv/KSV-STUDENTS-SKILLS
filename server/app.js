const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Global rate limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// Health check
app.get('/api/v1/health', (req, res) => res.json({ success: true, message: 'KSV Skill Sets API running', timestamp: new Date() }));

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/academic', require('./routes/academic'));
app.use('/api/v1/classes', require('./routes/classes'));
app.use('/api/v1/students', require('./routes/students'));
app.use('/api/v1/skills', require('./routes/skills'));
app.use('/api/v1/assessments', require('./routes/assessments'));
app.use('/api/v1/competitions', require('./routes/competitions'));
app.use('/api/v1/gallery', require('./routes/gallery'));
app.use('/api/v1/reports', require('./routes/reports'));
app.use('/api/v1', require('./routes/misc'));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use(errorHandler);

module.exports = app;
