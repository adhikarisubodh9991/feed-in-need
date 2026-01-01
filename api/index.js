/**
 * Vercel Serverless Function Entry Point
 * This file allows the Express backend to run as a Vercel serverless function
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from '../backend/config/db.js';
import { notFound, errorHandler } from '../backend/middleware/errorHandler.js';
import { generalRateLimit } from '../backend/middleware/rateLimiter.js';

// Route imports
import authRoutes from '../backend/routes/authRoutes.js';
import donationRoutes from '../backend/routes/donationRoutes.js';
import requestRoutes from '../backend/routes/requestRoutes.js';
import adminRoutes from '../backend/routes/adminRoutes.js';
import notificationRoutes from '../backend/routes/notificationRoutes.js';
import ratingRoutes from '../backend/routes/ratingRoutes.js';
import messageRoutes from '../backend/routes/messageRoutes.js';
import certificateRoutes from '../backend/routes/certificateRoutes.js';
import { serveCertificateOGTags } from '../backend/controllers/certificateController.js';

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174']
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in production for flexibility
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Global rate limiting
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

// Social Share Route
app.get('/share/certificate/:certificateId', serveCertificateOGTags);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Feed In Need API is running on Vercel',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Feed In Need Backend API',
    version: '1.0.0',
    health: '/api/health'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
