const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const blogRoutes = require('./routes/blogRoutes');
const contactRoutes = require('./routes/contactRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

// Initialize express app
const app = express();

// Trust proxy - required for Render and rate limiting
app.set('trust proxy', 1);

// Connect to database
connectDB();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// MongoDB injection prevention is handled by Mongoose's built-in sanitization
// express-mongo-sanitize has compatibility issues with Express 5.x

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',      // Next.js dev
      'https://akoot.tech',          // Production
      'https://www.akoot.tech',      // Production with www
      process.env.RENDER_EXTERNAL_URL // Render URL (auto-set by Render)
    ].filter(Boolean); // Remove undefined values
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/blogs', blogRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
