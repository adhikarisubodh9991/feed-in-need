import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Donation from './models/Donation.js';

dotenv.config();

const resetDonations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/feed-in-need');
    console.log('Connected to MongoDB');

    const result = await Donation.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} donations from database`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting donations:', error);
    process.exit(1);
  }
};

resetDonations();
