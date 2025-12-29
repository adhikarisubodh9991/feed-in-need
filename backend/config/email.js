/**
 * Email Configuration using Nodemailer
 * Supports multiple providers: Gmail, Resend, Brevo, or custom SMTP
 * 
 * For production deployment, use one of these options:
 * 1. Resend (recommended): Set EMAIL_PROVIDER=resend and RESEND_API_KEY
 * 2. Brevo/Sendinblue: Set EMAIL_PROVIDER=brevo with their SMTP credentials
 * 3. Gmail with App Password: Set EMAIL_PROVIDER=gmail (may have issues on some platforms)
 */



import nodemailer from 'nodemailer';

let transporter;
const provider = process.env.EMAIL_PROVIDER;

if (provider === 'resend') {
  // Resend API (recommended)
  transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 587,
    secure: false,
    auth: {
      user: 'resend',
      pass: process.env.RESEND_API_KEY,
    },
  });
} else {
  // Fallback to SMTP (Brevo, Gmail, etc.)
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// Verify transporter connection on startup (only in production)
if (process.env.NODE_ENV === 'production') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter verification failed:', error.message);
      console.log('📧 Emails will be logged to console instead');
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
}

// Get the "from" email address
const getFromEmail = () => {
  if (provider === 'resend') {
    // Use EMAIL_FROM if set, otherwise fallback
    return process.env.EMAIL_FROM || 'Feed In Need <noreply@yourdomain.com>';
  }
  return `"Feed In Need" <${process.env.EMAIL_USER}>`;
};

// Helper function to send email with fallback logging
const sendEmail = async (mailOptions) => {
  try {
    // Add from address if not specified
    if (!mailOptions.from) {
      mailOptions.from = getFromEmail();
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${mailOptions.subject} to ${mailOptions.to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    
    // Log email content to console as fallback (useful for debugging)
    if (process.env.NODE_ENV === 'production') {
      console.log('📧 [EMAIL FALLBACK LOG]');
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log('---');
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Send email verification code
 */
export const sendEmailVerificationCode = async (email, name, code) => {
  const mailOptions = {
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

  const result = await sendEmail(mailOptions);
  return result.success;
};

/**
 * Send password reset code
 */
export const sendPasswordResetCode = async (email, name, code) => {
  const mailOptions = {
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

  const result = await sendEmail(mailOptions);
  return result.success;
};

/**
 * Send email to admin about new donation
 */
export const sendDonationNotification = async (donation, donor) => {
  const frontendUrl = process.env.FRONTEND_URL || process.env.BACKEND_URL || '';
  
  const mailOptions = {
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
            <a href="${frontendUrl}/admin/donations" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Dashboard</a>
          </p>
        </div>
      </div>
    `,
  };

  await sendEmail(mailOptions);
};

/**
 * Send email to admin about new receiver registration
 */
export const sendReceiverVerificationRequest = async (receiver) => {
  const frontendUrl = process.env.FRONTEND_URL || process.env.BACKEND_URL || '';
  
  const mailOptions = {
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
            <a href="${frontendUrl}/admin/receivers" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Now</a>
          </p>
        </div>
      </div>
    `,
  };

  await sendEmail(mailOptions);
};

/**
 * Send approval/rejection email to receiver
 */
export const sendVerificationResult = async (receiver, approved) => {
  const frontendUrl = process.env.FRONTEND_URL || process.env.BACKEND_URL || '';
  
  const mailOptions = {
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
               <p><a href="${frontendUrl}/login" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a></p>`
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

  await sendEmail(mailOptions);
};

/**
 * Send food request notification to admin
 */
export const sendFoodRequestNotification = async (request, receiver, donation) => {
  const frontendUrl = process.env.FRONTEND_URL || process.env.BACKEND_URL || '';
  
  const mailOptions = {
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
            <a href="${frontendUrl}/admin/requests" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Request</a>
          </p>
        </div>
      </div>
    `,
  };

  await sendEmail(mailOptions);
};

/**
 * Send error notification to admin for debugging
 */
export const sendErrorNotification = async (title, errorDetails) => {
  const mailOptions = {
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

  await sendEmail(mailOptions);
};

/**
 * Send admin message to user
 * Used for requesting corrections to profile information
 */
export const sendAdminMessageToUser = async (user, subject, message, actionRequired = null) => {
  const frontendUrl = process.env.FRONTEND_URL || process.env.BACKEND_URL || '';
  
  const mailOptions = {
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
            <a href="${frontendUrl}/profile" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Your Profile</a>
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

  const result = await sendEmail(mailOptions);
  return result.success;
};

export default transporter;
