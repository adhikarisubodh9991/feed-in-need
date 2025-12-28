/**
 * Email Configuration using Nodemailer
 * Sends notifications to admin and users
 */

import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email verification code
 */
export const sendEmailVerificationCode = async (email, name, code) => {
  const mailOptions = {
    from: `"Feed In Need" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Verify Your Email - Feed In Need',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Verify Your Email Address</h2>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 10px;">
          <p>Dear ${name},</p>
          <p>Thank you for registering with Feed In Need. Please use the following code to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #22c55e; background: #dcfce7; padding: 15px 30px; border-radius: 10px;">${code}</span>
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't create an account with Feed In Need, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
};

/**
 * Send password reset code
 */
export const sendPasswordResetCode = async (email, name, code) => {
  const mailOptions = {
    from: `"Feed In Need" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔑 Password Reset Code - Feed In Need',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Reset Your Password</h2>
        <div style="background: #eff6ff; padding: 20px; border-radius: 10px;">
          <p>Dear ${name},</p>
          <p>We received a request to reset your password. Use the following code to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3b82f6; background: #dbeafe; padding: 15px 30px; border-radius: 10px;">${code}</span>
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
};

/**
 * Send email to admin about new donation
 */
export const sendDonationNotification = async (donation, donor) => {
  const mailOptions = {
    from: `"Feed In Need" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: '🍲 New Food Donation Received!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">New Food Donation</h2>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 10px;">
          <h3 style="margin-top: 0;">Donor Details</h3>
          <p><strong>Name:</strong> ${donor.name}</p>
          <p><strong>Phone:</strong> ${donation.donorPhone}</p>
          <p><strong>Email:</strong> ${donor.email}</p>
          
          <h3>Food Details</h3>
          <p><strong>Title:</strong> ${donation.foodTitle}</p>
          <p><strong>Description:</strong> ${donation.foodDescription}</p>
          <p><strong>Quantity:</strong> ${donation.quantity}</p>
          <p><strong>Expiry:</strong> ${new Date(donation.expiryDateTime).toLocaleString()}</p>
          <p><strong>Location:</strong> ${donation.address}</p>
          
          ${donation.foodPhotos && donation.foodPhotos.length > 0 
            ? `<p><strong>Photos:</strong> ${donation.foodPhotos.map((photo, i) => `<a href="${photo}">Photo ${i + 1}</a>`).join(' | ')}</p>` 
            : donation.foodPhoto 
              ? `<p><strong>Photo:</strong> <a href="${donation.foodPhoto}">View Image</a></p>` 
              : ''}
          
          <p style="margin-top: 20px; color: #666;">
            <a href="${process.env.FRONTEND_URL}/admin/donations" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Dashboard</a>
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Donation notification sent to admin');
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

/**
 * Send email to admin about new receiver registration
 */
export const sendReceiverVerificationRequest = async (receiver) => {
  const mailOptions = {
    from: `"Feed In Need" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: '👤 New Receiver Verification Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">New Receiver Registration</h2>
        <div style="background: #eff6ff; padding: 20px; border-radius: 10px;">
          <p><strong>Type:</strong> ${receiver.receiverType}</p>
          <p><strong>Name:</strong> ${receiver.name}</p>
          <p><strong>Email:</strong> ${receiver.email}</p>
          <p><strong>Phone:</strong> ${receiver.phone}</p>
          <p><strong>Address:</strong> ${receiver.address}</p>
          
          ${receiver.idProof ? `<p><strong>ID Proof:</strong> <a href="${receiver.idProof}">View Document</a></p>` : ''}
          ${receiver.organizationDoc ? `<p><strong>Organization Doc:</strong> <a href="${receiver.organizationDoc}">View Document</a></p>` : ''}
          
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/admin/receivers" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Now</a>
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Receiver verification request sent to admin');
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

/**
 * Send approval/rejection email to receiver
 */
export const sendVerificationResult = async (receiver, approved) => {
  const mailOptions = {
    from: `"Feed In Need" <${process.env.EMAIL_USER}>`,
    to: receiver.email,
    subject: approved ? '✅ Account Verified - Feed In Need' : '❌ Account Verification Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${approved ? '#22c55e' : '#ef4444'};">
          ${approved ? 'Congratulations! Your Account is Verified' : 'Account Verification Update'}
        </h2>
        <div style="background: ${approved ? '#f0fdf4' : '#fef2f2'}; padding: 20px; border-radius: 10px;">
          <p>Dear ${receiver.name},</p>
          ${approved 
            ? `<p>Your account has been verified successfully. You can now request food donations and view donor contact details.</p>
               <p><a href="${process.env.FRONTEND_URL}/login" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a></p>`
            : `<p>Unfortunately, we couldn't verify your account at this time. This could be due to:</p>
               <ul>
                 <li>Unclear ID proof/documents</li>
                 <li>Incomplete information</li>
               </ul>
               <p>Please contact us at ${process.env.ADMIN_EMAIL} for more information.</p>`
          }
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification result sent to ${receiver.email}`);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

/**
 * Send food request notification to admin
 */
export const sendFoodRequestNotification = async (request, receiver, donation) => {
  const mailOptions = {
    from: `"Feed In Need" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: '📦 New Food Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">New Food Request</h2>
        <div style="background: #fffbeb; padding: 20px; border-radius: 10px;">
          <h3>Receiver Details</h3>
          <p><strong>Name:</strong> ${receiver.name}</p>
          <p><strong>Type:</strong> ${receiver.receiverType}</p>
          <p><strong>Phone:</strong> ${receiver.phone}</p>
          
          <h3>Requested Food</h3>
          <p><strong>Food:</strong> ${donation.foodTitle}</p>
          <p><strong>Quantity:</strong> ${donation.quantity}</p>
          <p><strong>Message:</strong> ${request.message || 'No message'}</p>
          
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/admin/requests" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Request</a>
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Food request notification sent to admin');
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

/**
 * Send error notification to admin for debugging
 */
export const sendErrorNotification = async (title, errorDetails) => {
  const mailOptions = {
    from: `"Feed In Need" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🚨 Error: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">🚨 ${title}</h2>
        <div style="background: #fef2f2; padding: 20px; border-radius: 10px;">
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Error:</strong> ${errorDetails.error}</p>
          <p><strong>User:</strong> ${errorDetails.user || 'Unknown'}</p>
          <p><strong>Files Uploaded:</strong> ${errorDetails.files || 0}</p>
          
          <h3>Request Body:</h3>
          <pre style="background: #fee2e2; padding: 10px; border-radius: 5px; overflow-x: auto; font-size: 12px;">${JSON.stringify(errorDetails.body, null, 2)}</pre>
          
          <h3>Stack Trace:</h3>
          <pre style="background: #fee2e2; padding: 10px; border-radius: 5px; overflow-x: auto; font-size: 10px; max-height: 300px;">${errorDetails.stack}</pre>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Error notification sent to admin');
  } catch (error) {
    console.error('❌ Error notification email failed:', error);
  }
};

/**
 * Send admin message to user
 * Used for requesting corrections to profile information
 */
export const sendAdminMessageToUser = async (user, subject, message, actionRequired = null) => {
  const mailOptions = {
    from: `"Feed In Need Admin" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `📬 ${subject} - Feed In Need`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Message from Feed In Need Admin</h2>
        <div style="background: #eff6ff; padding: 20px; border-radius: 10px;">
          <p>Dear ${user.name},</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          ${actionRequired ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #d97706;">⚠️ Action Required:</p>
            <p style="margin: 10px 0 0 0; color: #92400e;">${actionRequired}</p>
          </div>
          ` : ''}
          
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/profile" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Your Profile</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            If you have any questions, please reply to this email or contact our support team.
          </p>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an official message from Feed In Need administration.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Admin message sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Admin message email failed:', error);
    return false;
  }
};

export default transporter;
