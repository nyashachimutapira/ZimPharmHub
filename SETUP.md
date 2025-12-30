# ZimPharmHub - Complete Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js v14+ installed
- MongoDB running locally or MongoDB Atlas account
- Git installed
- Text editor (VS Code recommended)

### 2. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd client
npm install
cd ..
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```
MONGODB_URI=mongodb://localhost:27017/zimpharmhub
JWT_SECRET=your-secure-random-key-here
PORT=5000
NODE_ENV=development
```

### 4. Start MongoDB

**Windows:**
```bash
mongod
```

**Or use MongoDB Atlas** (cloud):
Update `MONGODB_URI` in `.env` with your connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zimpharmhub
```

### 5. Run the Application

**Option A: Run backend and frontend separately**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

**Option B: Run both together**
```bash
npm run dev
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Test Accounts

### Job Seeker
- Email: seeker@test.com
- Password: test123

### Pharmacy Owner
- Email: pharmacy@test.com
- Password: test123

## Creating Test Data

### 1. Register a New Account
- Visit http://localhost:3000/register
- Fill in the form
- Choose user type (Job Seeker or Pharmacy)

### 2. Create a Job Listing
- Login as Pharmacy
- Navigate to Jobs section
- Click "Post Job"
- Fill in job details

### 3. Browse Jobs
- Go to http://localhost:3000/jobs
- Apply for jobs as a Job Seeker

## Database Models

### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  userType: 'job_seeker' | 'pharmacy' | 'admin',
  phone: String,
  bio: String,
  location: String,
  profilePicture: String,
  certifications: [String],
  resume: String,
  isVerified: Boolean,
  subscriptionStatus: 'free' | 'premium' | 'enterprise'
}
```

### Job
```javascript
{
  title: String,
  description: String,
  position: String,
  salary: { min: Number, max: Number, currency: String },
  pharmacy: ObjectId (ref: User),
  location: { city: String, province: String, address: String },
  requirements: [String],
  responsibilities: [String],
  employmentType: 'Full-time' | 'Part-time' | 'Contract',
  applicants: [{ userId: ObjectId, status: String, appliedAt: Date }],
  status: 'active' | 'closed' | 'filled',
  featured: Boolean,
  views: Number
}
```

### Product
```javascript
{
  name: String,
  description: String,
  category: 'Medications' | 'Supplements' | 'Medical Devices' | 'Personal Care',
  pharmacy: ObjectId (ref: Pharmacy),
  price: { amount: Number, currency: String },
  stock: Number,
  images: [String],
  manufacturer: String,
  dosage: String,
  rating: Number (0-5),
  reviews: [{ userId: ObjectId, rating: Number, comment: String }],
  available: Boolean
}
```

## API Testing

Use Postman or similar tool to test API endpoints:

### Test a Job Listing Request
```
GET http://localhost:5000/api/jobs
```

### Create a Job (requires authentication)
```
POST http://localhost:5000/api/jobs
Headers:
  Content-Type: application/json
  user-id: <userId>

Body:
{
  "title": "Senior Pharmacist",
  "description": "Looking for experienced pharmacist",
  "position": "Pharmacist",
  "salary": { "min": 50000, "max": 80000, "currency": "ZWL" },
  "location": { "city": "Harare", "province": "Harare", "address": "Main St" },
  "employmentType": "Full-time",
  "requirements": ["Bachelor's degree", "5 years experience"],
  "responsibilities": ["Manage pharmacy operations", "Customer service"]
}
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- For MongoDB Atlas, whitelist your IP

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=5001 npm run server
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### React Build Error
```bash
cd client
npm run build
```

## Deployment

### Heroku Deployment

1. Install Heroku CLI
2. Create Heroku app:
```bash
heroku create zimpharmhub
```

3. Set environment variables:
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret_key
```

4. Deploy:
```bash
git push heroku main
```

### MongoDB Atlas Setup
1. Create account at mongodb.com
2. Create cluster
3. Get connection string
4. Add to .env and Heroku config

## Next Steps

1. **User Authentication**
   - Implement email verification
   - Password reset functionality
   - OAuth integration (Google, LinkedIn)

2. **Payment Integration**
   - Set up Stripe account
  - Add `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` to your `.env`.
  - Configure `STRIPE_WEBHOOK_SECRET` and register the webhook endpoint at `/api/payments/webhook` in your Stripe dashboard.
  - Optionally set `FEATURE_PRICE_PER_DAY_USD` in `.env` to define per-day price for job promotion.
   - Implement subscription payments
   - Feature listing payments

3. **Notifications**
   - Email notifications for job alerts
   - In-app notifications
   - SMS notifications

4. **Admin Dashboard**
   - User management
   - Content moderation
   - Analytics dashboard

5. **Search Enhancement**
   - Elasticsearch integration
   - Advanced filtering
   - Saved searches

6. **File Uploads**
   - AWS S3 integration
   - Resume uploads
   - Image gallery for products

## Support

- Check error logs: `npm logs`
- Read API documentation in README.md
- Create GitHub issues for bugs

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Stripe Integration](https://stripe.com/docs)
