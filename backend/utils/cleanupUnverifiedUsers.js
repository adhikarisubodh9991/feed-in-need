import User from '../models/User.js';

/**
 * Delete users who haven't verified their email within the specified time
 * @param {number} hoursOld - Delete users older than this many hours (default: 24)
 */
export const cleanupUnverifiedUsers = async (hoursOld = 24) => {
  try {
    const cutoffDate = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

    const result = await User.deleteMany({
      isEmailVerified: false,
      createdAt: { $lt: cutoffDate },
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} unverified user(s) older than ${hoursOld} hours`);
    }

    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up unverified users:', error);
    return 0;
  }
};

/**
 * Start the cleanup job to run periodically
 * @param {number} intervalHours - How often to run the cleanup (default: 1 hour)
 * @param {number} maxAgeHours - Delete users older than this (default: 24 hours)
 */
export const startCleanupJob = (intervalHours = 1, maxAgeHours = 24) => {
  // Run immediately on startup
  cleanupUnverifiedUsers(maxAgeHours);

  // Then run periodically
  const intervalMs = intervalHours * 60 * 60 * 1000;
  setInterval(() => {
    cleanupUnverifiedUsers(maxAgeHours);
  }, intervalMs);

  console.log(`🔄 Unverified user cleanup job started (runs every ${intervalHours} hour(s), deletes users unverified for ${maxAgeHours}+ hours)`);
};
