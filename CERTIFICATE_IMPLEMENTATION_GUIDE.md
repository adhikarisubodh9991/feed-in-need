# Donation Certificate & Social Sharing Implementation Guide

## Overview
This document describes the implementation of:
1. **Donation Certificates** - Automatically generated when donations are completed
2. **1-Click Social Sharing** - Facebook & WhatsApp sharing with Open Graph meta tags
3. **Re-verification Request** - Allow rejected users to request re-verification

---

## Folder Structure

```
backend/
├── models/
│   ├── Certificate.js          # NEW - Certificate model
│   └── Notification.js         # UPDATED - Added 'certificate' type and 'data' field
├── controllers/
│   ├── certificateController.js # NEW - Certificate CRUD and OG tag serving
│   ├── requestController.js     # UPDATED - Generate certificate on completion
│   └── authController.js        # UPDATED - Added requestReverification
├── routes/
│   ├── certificateRoutes.js     # NEW - Certificate API routes
│   └── authRoutes.js            # UPDATED - Added re-verification route
└── server.js                    # UPDATED - Added certificate routes and OG share route

frontend/
├── src/
│   ├── pages/
│   │   ├── CertificatePage.jsx      # NEW - View and share certificate
│   │   └── MyCertificatesPage.jsx   # NEW - List user's certificates
│   ├── components/
│   │   ├── DonationCertificate.jsx  # UPDATED - Proper share URLs
│   │   └── Navbar.jsx               # UPDATED - Added My Certificates link
│   ├── context/
│   │   └── AuthContext.jsx          # UPDATED - Added refreshUser function
│   └── App.jsx                      # UPDATED - Added certificate routes
```

---

## Backend API Endpoints

### Certificate Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/certificates/:certificateId/share-urls` | Get share URLs for certificate | Public |
| GET | `/api/certificates/id/:certificateId` | Get certificate by ID | Public |
| GET | `/api/certificates/my` | Get user's certificates | Donor |
| GET | `/api/certificates/received` | Get received certificates | Receiver |
| GET | `/api/certificates/donation/:donationId` | Get certificate by donation | Private |
| PUT | `/api/certificates/:certificateId/image` | Update certificate image | Owner/Admin |

### Social Share Endpoint (serves OG meta tags)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/share/certificate/:certificateId` | Serves OG tags for crawlers, redirects users to frontend |

### Re-verification Endpoint
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/request-reverification` | Request re-verification | Receiver (rejected) |

---

## How It Works

### 1. Certificate Generation
When a donation is marked as completed (`/api/requests/:id/complete` or `/api/requests/complete-qr`):
1. Request status is updated to 'completed'
2. Certificate is automatically generated with:
   - Unique certificate ID (12-char alphanumeric)
   - Donor and receiver information
   - Food details (title, quantity)
   - Completion date
3. Notification is sent to donor about the certificate

### 2. Social Sharing Flow

```
User clicks "Share on Facebook"
         ↓
Opens: https://yourbackend.com/share/certificate/ABC123XYZ456
         ↓
Facebook crawler detects as bot (user-agent check)
         ↓
Backend serves HTML with OG meta tags:
   - og:title: "John donated food through Feed In Need!"
   - og:description: "John generously donated..."
   - og:image: (certificate image URL)
   - og:url: (share URL)
         ↓
Facebook shows preview with image, title, description
         ↓
When real user clicks the link:
   - Backend detects as real user (not crawler)
   - Redirects to: https://yourfrontend.com/certificate/ABC123XYZ456
   - React app renders certificate page
```

### 3. User Agent Detection for Crawlers
```javascript
const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Pinterest|Googlebot|bingbot/i.test(userAgent);
```

---

## Environment Variables Required

Add to your `.env` file:
```env
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

For production:
```env
FRONTEND_URL=https://feedinneed.org
BACKEND_URL=https://api.feedinneed.org
```

---

## Share URL Formats

### Facebook Share
```
https://www.facebook.com/sharer/sharer.php?u=<encoded_share_url>
```

### WhatsApp Share
```
https://wa.me/?text=<encoded_message_with_url>
```

### Twitter/X Share
```
https://twitter.com/intent/tweet?text=<encoded_text>&url=<encoded_url>
```

---

## Common Mistakes to Avoid

1. **OG Image Size**: Facebook requires images to be at least **1200x630** pixels for best display
2. **Image Caching**: Facebook caches OG images. Use the Facebook Debugger to clear cache
3. **HTTPS Required**: Social media platforms require HTTPS for OG images in production
4. **URL Encoding**: Always use `encodeURIComponent()` for share text and URLs
5. **User Agent Detection**: Test with actual crawlers, not just simulated user agents

---

## Debug Facebook Preview

### Using Facebook Sharing Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your share URL: `https://yourbackend.com/share/certificate/<certificateId>`
3. Click "Debug"
4. Check if OG tags are correctly fetched
5. Click "Scrape Again" to clear Facebook's cache

### Common Issues
| Issue | Solution |
|-------|----------|
| "Image is too small" | Ensure image is at least 1200x630 |
| "Can't fetch URL" | Check if URL is publicly accessible |
| "Old preview showing" | Click "Scrape Again" to refresh cache |
| "No preview image" | Verify og:image URL is valid and accessible |

---

## Re-verification Feature

### Flow
1. Admin rejects user verification with a message
2. User sees "Verification Rejected" status on profile
3. User updates their profile information
4. User clicks "Request Re-verification" button
5. Verification status changes to "Pending"
6. Admin receives notification to review again

### UI Location
- Profile Page (`/profile`) → For rejected receivers only
- Shows amber/yellow info box with button

---

## Testing Checklist

- [ ] Create a donation and have it approved
- [ ] Create a request as receiver
- [ ] Complete the request with confirmation code
- [ ] Verify certificate is generated
- [ ] Check notification is sent to donor
- [ ] View certificate page
- [ ] Test Facebook share (check debugger)
- [ ] Test WhatsApp share
- [ ] Test certificate download
- [ ] Test re-verification request (as rejected receiver)
