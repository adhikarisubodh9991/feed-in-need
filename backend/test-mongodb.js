// Test MongoDB Configuration
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

console.log('Testing MongoDB Configuration...\n');

console.log('MONGODB_URI:', process.env.MONGODB_URI ? '***SET***' : '***NOT SET***');

console.log('\nConnecting to MongoDB...');

try {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connection SUCCESS!');
  console.log('Host:', conn.connection.host);
  console.log('Database:', conn.connection.name);
  
  // List collections
  const collections = await conn.connection.db.listCollections().toArray();
  console.log('\nCollections in database:');
  collections.forEach(c => console.log(' -', c.name));
  
  // Count documents
  const donationCount = await conn.connection.db.collection('donations').countDocuments();
  const userCount = await conn.connection.db.collection('users').countDocuments();
  console.log('\nDocument counts:');
  console.log(' - Users:', userCount);
  console.log(' - Donations:', donationCount);
  
  await mongoose.disconnect();
  console.log('\n✅ MongoDB test complete!');
} catch (error) {
  console.log('❌ MongoDB Connection FAILED:', error.message);
}
