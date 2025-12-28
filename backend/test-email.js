// Test Email Configuration
import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

console.log('Testing Email Configuration...\n');

console.log('Environment Variables:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET*** (length: ' + process.env.EMAIL_PASS.length + ')' : '***NOT SET***');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log('\nTesting Email connection...');

try {
  const result = await transporter.verify();
  console.log('✅ Email Connection SUCCESS:', result);
  
  // Try sending a test email
  console.log('\nSending test email...');
  const info = await transporter.sendMail({
    from: `"Feed In Need Test" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: '🧪 Test Email - Feed In Need',
    html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>',
  });
  console.log('✅ Test Email Sent:', info.messageId);
} catch (error) {
  console.log('❌ Email Connection FAILED:', error.message);
  console.log('Full error:', error);
}
