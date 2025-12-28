# Feed In Need - Food Donation Platform

A full-stack web application for food donation management that connects food donors with receivers in need. Built with React, Node.js, Express, and MongoDB.

![Feed In Need](https://via.placeholder.com/800x400?text=Feed+In+Need)

## Features

### For Donors
- 🍲 Create food donations with photos, location, and expiry time
- 📍 Interactive map for setting pickup location
- 📤 Share donations on social media (WhatsApp, Facebook, Twitter)
- 📊 Dashboard to track donation status
- ✉️ Email notifications when food is requested

### For Receivers
- 🔐 Register as individual or organization
- 📋 Browse available food donations
- 🗺️ View donation locations on map
- 📩 Request food with custom messages
- ✅ Track request status

### For Admin
- 👥 Verify receiver accounts
- 📝 Approve/reject food requests
- 📈 Dashboard with statistics
- 🔍 View all donations and users

## Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **React Hot Toast** - Notifications
- **React Leaflet** - Map Integration
- **React Share** - Social Sharing
- **Axios** - HTTP Client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password Hashing
- **Multer** - File Upload
- **Cloudinary** - Image Storage
- **Nodemailer** - Email Service

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail account (for email)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/feed-in-need.git
cd feed-in-need
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/feed_in_need

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Feed In Need <your-email@gmail.com>"

# Admin
ADMIN_EMAIL=admin@example.com

# CORS
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

2. **Start Backend**
```bash
cd backend
npm run dev
```

3. **Start Frontend**
```bash
cd frontend
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register donor |
| POST | `/api/auth/register/receiver` | Register receiver |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Donations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donations` | Get all donations |
| GET | `/api/donations/:id` | Get single donation |
| POST | `/api/donations` | Create donation |
| DELETE | `/api/donations/:id` | Delete donation |
| GET | `/api/donations/user/my` | Get my donations |

### Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/requests` | Create request |
| GET | `/api/requests/my` | Get my requests |
| PUT | `/api/requests/:id/cancel` | Cancel request |
| PUT | `/api/requests/:id/complete` | Mark complete |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Get statistics |
| GET | `/api/admin/receivers` | Get all receivers |
| PUT | `/api/admin/receivers/:id/verify` | Verify receiver |
| GET | `/api/admin/requests` | Get all requests |
| PUT | `/api/admin/requests/:id` | Update request |
| GET | `/api/admin/donations` | Get all donations |

## Project Structure

```
Feed_In_Need/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   ├── db.js
│   │   │   └── email.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── donationController.js
│   │   │   └── requestController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── models/
│   │   │   ├── Donation.js
│   │   │   ├── Request.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── donationRoutes.js
│   │   │   └── requestRoutes.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── DonationCard.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ImageUpload.jsx
    │   │   ├── Loader.jsx
    │   │   ├── LocationPicker.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── SocialShare.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── lib/
    │   │   ├── axios.js
    │   │   └── utils.js
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminDonations.jsx
    │   │   │   ├── AdminReceivers.jsx
    │   │   │   └── AdminRequests.jsx
    │   │   ├── DonationDetailPage.jsx
    │   │   ├── DonationsPage.jsx
    │   │   ├── DonatePage.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── MyDonationsPage.jsx
    │   │   ├── MyRequestsPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── ReceiverRegisterPage.jsx
    │   │   └── RegisterPage.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

## User Flows

### Donor Flow
1. Register as donor → Login
2. Create donation with food details, photo, location
3. Share on social media (optional)
4. Receive email when someone requests
5. Track donation status in dashboard

### Receiver Flow
1. Register as receiver (individual/organization)
2. Wait for admin verification
3. Browse available donations
4. Request food with message
5. Wait for admin approval
6. Mark as completed when received

### Admin Flow
1. Login with admin account
2. Review pending receiver verifications
3. Approve/reject food requests
4. Monitor platform statistics

## Creating Admin Account

Run this MongoDB command to create an admin user:

```javascript
db.users.insertOne({
  name: "Admin",
  email: "admin@feedinneed.com",
  password: "$2a$10$hashedPasswordHere", // Use bcrypt to hash
  phone: "1234567890",
  role: "admin",
  createdAt: new Date()
})
```

Or modify a user's role:
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@feedinneed.com or create an issue on GitHub.

---

Made with ❤️ for reducing food waste and helping those in need.
