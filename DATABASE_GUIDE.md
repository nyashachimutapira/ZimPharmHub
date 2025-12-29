# MongoDB Database Guide - ZimPharmHub

## 📊 Database Collections Overview

Your MongoDB database will automatically create these collections when data is added:

### 1. **users** Collection
Stores all user accounts (job seekers, pharmacies, admins)

**Fields:**
- `firstName` (String, required)
- `lastName` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `userType` (Enum: 'job_seeker', 'pharmacy', 'admin', required)
- `phone` (String, optional)
- `profilePicture` (String, optional)
- `bio` (String, optional)
- `location` (String, optional)
- `certifications` (Array of Strings)
- `resume` (String, optional)
- `isVerified` (Boolean, default: false)
- `subscriptionStatus` (Enum: 'free', 'premium', 'enterprise', default: 'free')
- `savedJobs` (Array of Job IDs)
- `appliedJobs` (Array of Job IDs)
- `createdAt` (Date)
- `updatedAt` (Date)

### 2. **jobs** Collection
Stores job listings posted by pharmacies

**Fields:**
- `title` (String, required)
- `description` (String, required)
- `position` (Enum: 'Pharmacist', 'Dispensary Assistant', 'Pharmacy Manager', 'Other')
- `salary` (Object: { min, max, currency })
- `pharmacy` (ObjectId, ref: User)
- `location` (Object: { city, province, address })
- `requirements` (Array of Strings)
- `responsibilities` (Array of Strings)
- `employmentType` (Enum: 'Full-time', 'Part-time', 'Contract', 'Temporary')
- `applicationDeadline` (Date, optional)
- `applicants` (Array: { userId, appliedAt, status, notes, resume, coverLetter })
- `status` (Enum: 'active', 'closed', 'filled', default: 'active')
- `featured` (Boolean, default: false)
- `views` (Number, default: 0)
- `createdAt` (Date)
- `updatedAt` (Date)

### 3. **pharmacies** Collection
Stores pharmacy business profiles

**Fields:**
- `user` (ObjectId, ref: User, required)
- `name` (String, required)
- `registrationNumber` (String, unique)
- `phone`, `email`, `website` (Strings)
- `address`, `city`, `province`, `zipCode` (Strings)
- `operatingHours` (Object with days: { open, close })
- `services` (Array of Strings)
- `logo`, `backgroundImage` (Strings)
- `description` (String)
- `licenses` (Array of Strings)
- `staff` (Array: { name, position, qualifications })
- `subscriptionPlan` (Enum: 'free', 'premium', 'enterprise')
- `ratings` (Number, 0-5)
- `totalReviews` (Number)
- `isVerified` (Boolean, default: false)
- `createdAt`, `updatedAt` (Dates)

### 4. **products** Collection
Stores pharmacy product listings

**Fields:**
- `name` (String, required)
- `description` (String)
- `category` (Enum: 'Medications', 'Supplements', 'Medical Devices', 'Personal Care', 'OTC')
- `pharmacy` (ObjectId, ref: Pharmacy)
- `price` (Object: { amount, currency })
- `stock` (Number, default: 0)
- `images` (Array of Strings)
- `manufacturer`, `dosage`, `sideEffects`, `warnings` (Strings)
- `rating` (Number, 0-5)
- `reviews` (Array: { userId, rating, comment, createdAt })
- `available` (Boolean, default: true)
- `featured` (Boolean)
- `createdAt`, `updatedAt` (Dates)

### 5. **articles** Collection
Stores educational articles and resources

**Fields:**
- `title` (String, required)
- `content` (String, required)
- `author` (ObjectId, ref: User)
- `category` (String)
- `tags` (Array of Strings)
- `published` (Boolean, default: false)
- `views` (Number, default: 0)
- `createdAt`, `updatedAt` (Dates)

### 6. **events** Collection
Stores pharmacy events and conferences

**Fields:**
- `title` (String, required)
- `description` (String)
- `organizer` (ObjectId, ref: User)
- `date` (Date)
- `location` (Object: { city, venue })
- `category` (String)
- `featured` (Boolean)
- `registeredUsers` (Array of User IDs)
- `createdAt`, `updatedAt` (Dates)

### 7. **forumposts** Collection
Stores forum discussion posts

**Fields:**
- `title` (String, required)
- `content` (String, required)
- `author` (ObjectId, ref: User)
- `category` (String)
- `tags` (Array of Strings)
- `likes` (Number, default: 0)
- `comments` (Array: { userId, content, createdAt })
- `createdAt`, `updatedAt` (Dates)

### 8. **notifications** Collection
Stores user notifications

**Fields:**
- `userId` (ObjectId, ref: User)
- `type` (Enum: 'job_application', 'job_alert', 'message', 'forum_reply', 'event_reminder', 'system')
- `title` (String, required)
- `message` (String, required)
- `link` (String, optional)
- `relatedId` (ObjectId, optional)
- `isRead` (Boolean, default: false)
- `createdAt` (Date)

### 9. **conversations** Collection
Stores messaging conversations

**Fields:**
- `participants` (Array of User IDs)
- `lastMessage` (ObjectId, ref: Message)
- `lastMessageAt` (Date)
- `relatedJob` (ObjectId, ref: Job, optional)
- `createdAt` (Date)

### 10. **messages** Collection
Stores individual messages

**Fields:**
- `conversationId` (ObjectId, ref: Conversation)
- `sender` (ObjectId, ref: User)
- `recipient` (ObjectId, ref: User)
- `content` (String, required)
- `isRead` (Boolean, default: false)
- `createdAt` (Date)

### 11. **newsletters** Collection
Stores newsletter subscriptions

**Fields:**
- `email` (String, required, unique)
- `firstName`, `lastName` (Strings)
- `categories` (Object: { jobs, products, news, events })
- `isActive` (Boolean, default: true)
- `createdAt` (Date)

### 12. **savedsearches** Collection
Stores user saved search queries

**Fields:**
- `userId` (ObjectId, ref: User)
- `name` (String, required)
- `searchParams` (Object/Mixed)
- `isActive` (Boolean, default: true)
- `lastSearched` (Date)
- `createdAt` (Date)

---

## 🚀 Quick Setup with Sample Data

### Option 1: Use the Seed Script (Recommended)

1. Make sure your `.env` file is configured with MongoDB connection
2. Run the seed script:

```bash
node seedDatabase.js
```

This will create:
- ✅ 1 Admin user
- ✅ 2 Job Seeker users
- ✅ 2 Pharmacy users with pharmacy profiles
- ✅ 3 Job listings
- ✅ 3 Product listings
- ✅ 2 Articles
- ✅ 2 Events
- ✅ 2 Forum posts

**Sample Login Credentials:**
- Admin: `admin@zimpharmhub.com` / `password123`
- Job Seeker: `john.moyo@example.com` / `password123`
- Pharmacy: `michael@healthplus.co.zw` / `password123`

### Option 2: Add Data Manually Through the App

1. **Register Users:**
   - Go to `/register` and create accounts
   - Choose user type: Job Seeker or Pharmacy

2. **Create Jobs:**
   - Login as Pharmacy user
   - Go to Jobs section
   - Click "Post Job" and fill in details

3. **Create Products:**
   - Login as Pharmacy user
   - Go to Products section
   - Add product listings

4. **Create Content:**
   - Login as Admin user
   - Create articles, events, forum posts through respective sections

---

## 📝 What Data to Add

### For Testing/Development:

**Minimum Required:**
1. ✅ At least 1 Admin user (for admin panel access)
2. ✅ At least 1 Pharmacy user (to post jobs)
3. ✅ At least 1 Job Seeker user (to apply for jobs)
4. ✅ 2-3 Job listings (to test job features)
5. ✅ 1-2 Products (to test product listings)

**Recommended for Full Testing:**
- 3-5 Users (mix of job seekers and pharmacies)
- 5-10 Job listings
- 10+ Products
- 3-5 Articles
- 2-3 Events
- 5-10 Forum posts

### For Production:

- Let users register through the app
- Content will be created organically by users
- Admin should moderate content regularly

---

## 🔍 Viewing Data in MongoDB

### Using MongoDB Compass (GUI):

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string from `.env`
3. Browse collections and documents

### Using MongoDB Shell:

```bash
# Connect to database
mongosh

# Or with connection string
mongosh "mongodb://localhost:27017/zimpharmhub"

# List databases
show dbs

# Use your database
use zimpharmhub

# List collections
show collections

# View users
db.users.find().pretty()

# View jobs
db.jobs.find().pretty()

# Count documents
db.users.countDocuments()
db.jobs.countDocuments()
```

---

## 🔐 Creating an Admin User Manually

If you need to create an admin user manually in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  password: "$2a$10$hashedpassword...", // Use bcrypt hash
  userType: "admin",
  isVerified: true,
  subscriptionStatus: "enterprise",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the registration endpoint and then update in database:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { userType: "admin", isVerified: true } }
)
```

---

## 📊 Database Indexes (Automatically Created)

MongoDB will create indexes for:
- `users.email` (unique)
- `jobs.pharmacy` (for queries)
- `products.pharmacy` (for queries)
- References between collections

---

## 🧹 Clearing Database

**Warning: This will delete all data!**

```bash
# Using MongoDB shell
mongosh
use zimpharmhub
db.dropDatabase()

# Or delete specific collections
db.users.deleteMany({})
db.jobs.deleteMany({})
```

---

## ✅ Database Health Check

Run this to verify your database:

```bash
# Check connection
node -e "require('mongoose').connect('YOUR_MONGODB_URI').then(() => console.log('✅ Connected')).catch(e => console.log('❌ Error:', e))"

# Or use the seed script (it will show errors if connection fails)
node seedDatabase.js
```

---

**Need Help?** Check the error logs if database operations fail, or verify your MongoDB connection string in `.env`.

