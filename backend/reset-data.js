import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Donation from './models/Donation.js';
import Request from './models/Request.js';

dotenv.config();

const resetData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/feed-in-need');
    console.log('Connected to MongoDB');

    const donationResult = await Donation.deleteMany({});
    console.log(`✓ Deleted ${donationResult.deletedCount} donations from database`);

    const requestResult = await Request.deleteMany({});
    console.log(`✓ Deleted ${requestResult.deletedCount} food requests from database`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting data:', error);
    process.exit(1);
  }
};

resetData();
