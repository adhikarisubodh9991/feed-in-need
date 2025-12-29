/**
 * Certificate Controller
 * Handles donation certificate operations and social sharing
 */

import Certificate from '../models/Certificate.js';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import Request from '../models/Request.js';

/**
 * @desc    Get certificate by ID (for display)
 * @route   GET /api/certificates/:certificateId
 * @access  Public
 */
export const getCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ 
      certificateId: req.params.certificateId 
    })
      .populate('donor', 'name avatar isTrusted')
      .populate('receiver', 'name')
      .populate('donation', 'foodTitle quantity foodPhotos address createdAt');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my certificates (donor)
 * @route   GET /api/certificates/my
 * @access  Private (Donor)
 */
export const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ donor: req.user._id })
      .populate('donation', 'foodTitle quantity foodPhotos')
      .populate('receiver', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get certificates received (receiver)
 * @route   GET /api/certificates/received
 * @access  Private (Receiver)
 */
export const getReceivedCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ receiver: req.user._id })
      .populate('donation', 'foodTitle quantity foodPhotos')
      .populate('donor', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Serve Open Graph meta tags for social media crawlers
 * @route   GET /share/certificate/:certificateId
 * @access  Public
 * 
 * This route serves raw HTML with OG meta tags for social media crawlers
 * and redirects real users to the React app
 */
export const serveCertificateOGTags = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const userAgent = req.get('user-agent') || '';
    
    // Detect social media crawlers
    const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Pinterest|Googlebot|bingbot/i.test(userAgent);
    
    // Get base URL - in same-domain setup, both are the same
    // Use BACKEND_URL as the canonical URL for sharing
    const baseUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const frontendUrl = process.env.FRONTEND_URL || baseUrl;
    
    // If not a crawler, redirect to React app (same domain in production)
    if (!isCrawler) {
      // In same-domain setup, just redirect to the certificate page path
      const redirectUrl = process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL
        ? `/certificate/${certificateId}`
        : `${frontendUrl}/certificate/${certificateId}`;
      return res.redirect(redirectUrl);
    }
    
    // Fetch certificate data for crawlers
    const certificate = await Certificate.findOne({ certificateId })
      .populate('donation', 'foodTitle quantity foodPhotos');

    if (!certificate) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Certificate Not Found - Feed In Need</title>
            <meta property="og:title" content="Certificate Not Found" />
            <meta property="og:description" content="This certificate does not exist or has been removed." />
          </head>
          <body>
            <h1>Certificate Not Found</h1>
          </body>
        </html>
      `);
    }

    // Generate OG image URL (use first food photo or default)
    const ogImage = certificate.imageUrl || 
      certificate.donation?.foodPhotos?.[0] || 
      `${baseUrl}/og-certificate-default.png`;
    
    const shareUrl = `${baseUrl}/share/certificate/${certificateId}`;
    const certificatePageUrl = `${baseUrl}/certificate/${certificateId}`;
    
    // Build OG meta tags HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${certificate.donorName} donated food through Feed In Need!</title>
  <meta name="title" content="${certificate.donorName} donated food through Feed In Need!">
  <meta name="description" content="${certificate.ogDescription}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="${certificate.ogTitle}">
  <meta property="og:description" content="${certificate.ogDescription}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Feed In Need">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${shareUrl}">
  <meta property="twitter:title" content="${certificate.ogTitle}">
  <meta property="twitter:description" content="${certificate.ogDescription}">
  <meta property="twitter:image" content="${ogImage}">
  
  <!-- WhatsApp specific -->
  <meta property="og:image:type" content="image/png">
  
  <!-- Redirect for any browser that loads this page -->
  <meta http-equiv="refresh" content="0;url=${certificatePageUrl}">
</head>
<body>
  <h1>🍲 ${certificate.donorName} donated food!</h1>
  <p>${certificate.ogDescription}</p>
  <p>Redirecting to Feed In Need...</p>
  <script>window.location.href = "${certificatePageUrl}";</script>
</body>
</html>
    `.trim();

    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update certificate image URL (admin/system)
 * @route   PUT /api/certificates/:certificateId/image
 * @access  Private
 */
export const updateCertificateImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    
    const certificate = await Certificate.findOne({ 
      certificateId: req.params.certificateId 
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Only owner or admin can update
    if (certificate.donor.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    certificate.imageUrl = imageUrl;
    await certificate.save();

    res.status(200).json({
      success: true,
      message: 'Certificate image updated',
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get certificate for a specific completed donation
 * @route   GET /api/certificates/donation/:donationId
 * @access  Private
 */
export const getCertificateByDonation = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ 
      donation: req.params.donationId 
    })
      .populate('donor', 'name avatar isTrusted')
      .populate('receiver', 'name')
      .populate('donation', 'foodTitle quantity foodPhotos address createdAt');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found for this donation',
      });
    }

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate share URLs for certificate
 * @route   GET /api/certificates/:certificateId/share-urls
 * @access  Public
 */
export const getShareUrls = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await Certificate.findOne({ certificateId });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Use BACKEND_URL for share links (same as frontend in same-domain setup)
    const baseUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const shareUrl = `${baseUrl}/share/certificate/${certificateId}`;
    
    const shareText = `🍲 ${certificate.donorName} donated "${certificate.foodTitle}" through Feed In Need! Join us in fighting hunger. 💚`;
    const whatsappText = `🎉 I just donated "${certificate.foodTitle}" through Feed In Need!\n\n🍲 Food: ${certificate.foodTitle}\n📦 Quantity: ${certificate.quantity}\n\nJoin me in fighting hunger and food waste! 💚\n\n${shareUrl}\n\n#FeedInNeed #FoodDonation #ZeroHunger`;

    res.status(200).json({
      success: true,
      data: {
        certificateId,
        shareUrl,
        facebookUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        whatsappUrl: `https://wa.me/?text=${encodeURIComponent(whatsappText)}`,
        twitterUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        linkedinUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      },
    });
  } catch (error) {
    next(error);
  }
};
