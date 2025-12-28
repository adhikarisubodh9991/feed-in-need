/**
 * Script to set up the superadmin user
 * Run this script to make adhikarsubodh999@gmail.com a superadmin
 * 
 * Usage: node setup-superadmin.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPERADMIN_EMAIL = 'adhikarisubodh999@gmail.com';

const setupSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/feed_in_need';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the User collection directly
    const User = mongoose.connection.collection('users');

    // Check if user exists
    const existingUser = await User.findOne({ email: SUPERADMIN_EMAIL });

    if (existingUser) {
      // Update existing user to superadmin
      await User.updateOne(
        { email: SUPERADMIN_EMAIL },
        { $set: { role: 'superadmin' } }
      );
      console.log(`✅ User ${SUPERADMIN_EMAIL} has been updated to superadmin role`);
    } else {
      console.log(`❌ User with email ${SUPERADMIN_EMAIL} not found.`);
      console.log('Please register this user first, then run this script again.');
      console.log('Or you can create the superadmin manually by running:');
      console.log(`
      db.users.updateOne(
        { email: "${SUPERADMIN_EMAIL}" },
        { $set: { role: "superadmin" } }
      )
      `);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

setupSuperAdmin();
