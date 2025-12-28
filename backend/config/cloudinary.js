/**
 * Cloudinary Configuration for Image Uploads
 * Handles food photos, ID proofs, organization documents, and avatars
 */

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for food photos
const foodStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'feed_in_need/food_photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  },
});

// Storage for ID proofs and documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'feed_in_need/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
    resource_type: 'auto',
  },
});

// Storage for profile avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'feed_in_need/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
  },
});

// Multer upload middleware for food photos
export const uploadFoodPhoto = multer({
  storage: foodStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Multer upload middleware for documents
export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Multer upload middleware for avatars
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default cloudinary;
