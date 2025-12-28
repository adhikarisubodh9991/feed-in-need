// Check users and create admin if needed
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB\n');

// List all users
const users = await User.find({}, 'name email role verificationStatus');
console.log('Existing Users:');
users.forEach(u => console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`));

// Check if admin exists
const adminExists = await User.findOne({ role: 'admin' });

if (!adminExists) {
  console.log('\n⚠️ No admin user found.');
  console.log('To create an admin run `node update-admin.js` with the environment variable `FORCE_CREATE_ADMIN=true`.');
  console.log('Example: `FORCE_CREATE_ADMIN=true node update-admin.js`');
} else {
  console.log('\n✅ Admin already exists:', adminExists.email);
}

await mongoose.disconnect();
console.log('\nDone!');
