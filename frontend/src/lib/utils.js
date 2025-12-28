/**
 * Utility Functions
 */

// Format date to readable string
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate time remaining until expiry
export const getTimeRemaining = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} left`;
  }

  return `${hours}h ${minutes}m left`;
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    available: 'badge-available',
    claimed: 'badge-claimed',
    requested: 'badge-pending',
    completed: 'badge-approved',
    cancelled: 'badge-rejected',
    expired: 'badge-rejected',
  };
  return classes[status] || 'badge-pending';
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncate = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Generate share message for social media
export const generateShareMessage = (donation) => {
  return `🍲 I just donated food through Feed In Need! ${donation.foodTitle} - ${donation.quantity}. Join me in reducing food waste and helping those in need! #FeedInNeed #FoodDonation`;
};

// Get share URLs
export const getShareUrls = (message) => {
  const encodedMessage = encodeURIComponent(message);
  const url = encodeURIComponent(window.location.origin);

  return {
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedMessage}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${url}`,
  };
};

// Validate email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const regex = /^\+?[\d\s-]{10,}$/;
  return regex.test(phone);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Check if file is valid image
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  return validTypes.includes(file.type);
};

// Check if file is valid document
export const isValidDocument = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
  return validTypes.includes(file.type);
};
