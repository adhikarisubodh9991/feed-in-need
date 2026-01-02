/**
 * Feed In Need - Food Donation Platform
 * Main Server Entry Point
 */

// Load environment variables FIRST (this import runs immediately)
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js'; 
import { generalRateLimit } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import { serveCertificateOGTags } from './controllers/certificateController.js';

// Utility imports
import { startCleanupJob } from './utils/cleanupUnverifiedUsers.js';

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Start cleanup job for unverified users (runs every 1 hour, deletes users unverified for 24+ hours)
startCleanupJob(1, 24);

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174']
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in production for flexibility
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Global rate limiting (DDoS protection)
app.use(generalRateLimit);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/certificates', certificateRoutes);

// Social Share Route (serves OG meta tags for crawlers, redirects users to frontend)
app.get('/share/certificate/:certificateId', serveCertificateOGTags);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Feed In Need API is running',
    timestamp: new Date().toISOString(),
  });
});

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle React routing - return index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes and share routes
    if (req.path.startsWith('/api') || req.path.startsWith('/share')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
} else {
  // Welcome route for development
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Welcome to Feed In Need API',
      documentation: '/api/health',
      version: '1.0.0',
    });
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║                                            ║
  ║   🍲 Feed In Need Server Started! 🍲       ║
  ║                                            ║
  ║   Port: ${PORT}                               ║
  ║   Mode: ${process.env.NODE_ENV || 'development'}                        ║
  ║                                            ║
  ╚════════════════════════════════════════════╝
  `);
});

export default app;
