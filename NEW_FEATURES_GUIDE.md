# ZimPharmHub - New Features Implementation Guide

## Overview
This document outlines all new features added to ZimPharmHub, including professional services, e-commerce enhancements, and engagement features.

## Table of Contents
1. [Professional Services](#professional-services)
2. [E-Commerce Enhancement](#e-commerce-enhancement)
3. [Engagement & Monetization](#engagement--monetization)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Database Models](#database-models)

---

## Professional Services

### 1. Certification Verification System

**Purpose**: Verify pharmacy licenses and professional credentials

**Models**:
- `Certification` - Stores certification details with verification status

**Key Fields**:
- `certificationName` - Name of the certification
- `licenseNumber` - Unique license number
- `status` - pending, verified, rejected, expired
- `verifiedBy` - Admin user who verified
- `verifiedAt` - Verification timestamp

**API Endpoints**:
```
GET    /api/certifications/:userId          # Get user certifications
GET    /api/certifications/admin/pending    # Get pending (admin only)
POST   /api/certifications                  # Submit new certification
PUT    /api/certifications/:id/verify       # Verify (admin only)
PUT    /api/certifications/:id/reject       # Reject (admin only)
```

**Frontend**: Add certification upload form in user profile

---

### 2. Pharmacy Directory

**Purpose**: Searchable directory of verified pharmacies with location, services, and ratings

**Models**:
- `Pharmacy` - Pharmacy business information
- `SupplierRating` - Ratings for suppliers

**Key Fields**:
- `pharmacyName` - Business name
- `registrationNumber` - Official registration
- `address`, `city`, `province`, `latitude`, `longitude` - Location data
- `services` - Array of services offered
- `operatingHours` - JSON with opening times
- `rating`, `totalReviews` - Quality metrics
- `isVerified` - Admin approval status

**API Endpoints**:
```
GET    /api/pharmacies                      # Search pharmacies (filters: city, province, rating)
GET    /api/pharmacies/:id                  # Get pharmacy details
POST   /api/pharmacies                      # Create pharmacy listing
PUT    /api/pharmacies/:id                  # Update pharmacy info
```

**Frontend**: `PharmacyDirectoryPage.js`
- Search and filter by location, services, rating
- Display pharmacy cards with maps integration (optional)
- Show operating hours and services

---

### 3. Continuing Education (CPD) Marketplace

**Purpose**: Online platform for CPD courses with enrollment and ratings

**Models**:
- `CPDCourse` - Course offerings by instructors

**Key Fields**:
- `instructorId` - Creating instructor
- `title`, `description`, `category` - Course info
- `startDate`, `endDate`, `duration` - Scheduling
- `cpdPoints` - Professional development credit
- `price` - Course cost
- `level` - beginner, intermediate, advanced
- `status` - upcoming, ongoing, completed, cancelled
- `enrolledCount`, `maxParticipants` - Capacity management
- `rating`, `totalReviews` - Quality metrics

**API Endpoints**:
```
GET    /api/cpd-courses                     # List courses (filters: category, level, status)
GET    /api/cpd-courses/:id                 # Get course details
POST   /api/cpd-courses                     # Create course (instructor only)
PUT    /api/cpd-courses/:id                 # Update course
POST   /api/cpd-courses/:courseId/enroll    # Enroll in course
```

**Frontend**: `CPDCoursesPage.js`
- Browse available courses
- Filter by category, level, date
- Enrollment tracking
- Course ratings and reviews

---

### 4. Skills Endorsement System

**Purpose**: Peer verification of pharmacist competencies

**Models**:
- `SkillEndorsement` - Endorsement records

**Key Fields**:
- `skillOwnerId` - Pharmacist being endorsed
- `endorsedByUserId` - Endorsing pharmacist
- `skillName` - Skill being endorsed
- `skillCategory` - Category (clinical, dispensing, etc.)
- `proficiencyLevel` - beginner to expert
- `status` - pending, approved, rejected

**Use Cases**:
- Pharmacists endorse each other's skills
- Build professional credibility
- Searchable skill profiles

---

## E-Commerce Enhancement

### 1. Pharmacy Inventory Management

**Purpose**: Track product stock levels in pharmacies

**Models**:
- `InventoryItem` - Stock tracking per pharmacy

**Key Fields**:
- `pharmacyId`, `productId` - References
- `quantity` - Current stock level
- `reorderLevel` - Threshold for alerts
- `unitPrice`, `retailPrice` - Pricing
- `expiryDate`, `batchNumber` - Product details
- `status` - in_stock, low_stock, out_of_stock

**Features**:
- Real-time stock tracking
- Low stock alerts
- Batch number and expiry management
- Supplier tracking

---

### 2. Prescription Fulfillment Tracking

**Purpose**: Order status updates for prescription orders

**Models**:
- `PrescriptionOrder` - Prescription order records

**Key Fields**:
- `orderNumber` - Unique order ID
- `prescriptionFile` - Uploaded prescription image
- `medications` - JSON list of requested medications
- `status` - submitted → verified → processing → ready_for_pickup → delivered
- `pharmacyVerifiedBy` - Verifying pharmacist

**API Endpoints**:
```
POST   /api/prescriptions                   # Submit prescription
GET    /api/prescriptions/:id               # Check order status
PUT    /api/prescriptions/:id/status        # Update status (pharmacy only)
```

---

### 3. Bulk Ordering for Pharmacies

**Purpose**: Wholesale orders with special pricing

**Models**:
- `BulkOrder` - Large quantity orders

**Key Fields**:
- `pharmacyId` - Ordering pharmacy
- `supplierUserId` - Supplier
- `items` - JSON array of products and quantities
- `discountPercentage` - Wholesale discount
- `paymentTerms` - Credit terms
- `status` - pending → quoted → confirmed → shipped → delivered

**Features**:
- Bulk pricing
- Quote generation
- Payment terms negotiation
- Delivery scheduling

---

### 4. Supplier Ratings & Reviews

**Purpose**: Quality feedback for suppliers

**Models**:
- `SupplierRating` - Rating records

**Key Fields**:
- `supplierId` - Rated supplier
- `qualityRating`, `deliveryRating`, `priceRating`, `serviceRating` - 1-5 scale
- `overallRating` - Calculated average
- `wouldRecommend` - Boolean flag
- `comment` - Review text

---

## Engagement & Monetization

### 1. Mentorship Marketplace

**Purpose**: Connect experienced mentors with mentees

**Models**:
- `Mentorship` - Mentorship relationships

**Key Fields**:
- `mentorId`, `menteeId` - Participants
- `title`, `description` - Engagement details
- `focusAreas` - JSON array of focus topics
- `duration`, `frequency` - Scheduling
- `price` - Mentorship cost
- `status` - available → in_progress → completed
- `rating`, `review` - Mentee feedback

**API Endpoints**:
```
GET    /api/mentorship/mentors               # Browse available mentors
GET    /api/mentorship/my                    # Get my mentorships
POST   /api/mentorship                       # Create mentorship
PUT    /api/mentorship/:id/review            # Post mentee review
```

**Frontend**: `MentorshipPage.js`
- Search mentors by expertise
- View mentor profiles and ratings
- Request mentorship
- Track active mentorships

---

### 2. Events & Workshop Listings

**Purpose**: Discover conferences, trainings, and networking events

**Models**:
- `Event` - Event information

**Key Fields**:
- `organizerId` - Event creator
- `title`, `description`, `category` - Event details
- `startDate`, `endDate`, `location` - Scheduling and venue
- `eventType` - conference, workshop, seminar, training, networking
- `capacity`, `attendeesCount` - Capacity tracking
- `price` - Registration fee
- `agenda`, `speakers` - JSON event details
- `status` - upcoming → ongoing → completed

**API Endpoints**:
```
GET    /api/events                           # List events (filters: type, city, date)
POST   /api/events                           # Create event
POST   /api/events/:eventId/register         # Register for event
```

**Frontend**: `EventsPage.js`
- Filter by type, location, date
- View event details and speakers
- Registration management
- Calendar view (optional)

---

### 3. Job Application Tracking Dashboard

**Purpose**: Track application status through the hiring process

**Models**:
- `JobApplication` - Application records

**Key Fields**:
- `jobId` - Applied job
- `userId` - Applicant
- `applicationNumber` - Unique ID
- `status` - applied → reviewed → shortlisted → interviewed → offered → rejected
- `coverLetter`, `resumeUrl` - Application materials
- `interviewDate`, `interviewNotes` - Interview details
- `feedback`, `offerDetails` - Communication

**API Endpoints**:
```
GET    /api/job-applications/my              # My applications
GET    /api/job-applications/job/:jobId      # Applications for a job (employer only)
POST   /api/job-applications                 # Submit application
PUT    /api/job-applications/:id/status      # Update status
PUT    /api/job-applications/:id/shortlist   # Shortlist candidate
PUT    /api/job-applications/:id/reject      # Reject with reason
```

**Frontend**: `JobApplicationsPage.js`
- View all submitted applications
- Track status for each application
- See employer feedback
- Filter by status
- View interview schedules

---

### 4. Premium Job Postings

**Purpose**: Featured job listings with promotional features

**Models**:
- `PremiumJobPosting` - Premium listing metadata

**Key Fields**:
- `jobId` - Job reference
- `premiumTier` - basic, standard, premium, featured
- `durationDays` - How long listing runs
- `features` - JSON array of enabled features
- `price` - Tier cost
- `applicantsViewed`, `applicantsCount` - Analytics
- `paymentStatus` - pending, paid, failed, refunded
- `featured` - Homepage feature flag

**Premium Features**:
- Homepage visibility
- Higher search ranking
- Larger applicant pool
- Analytics dashboard
- Featured badge
- Extended duration

**API Endpoints**:
```
POST   /api/jobs/:jobId/make-premium         # Create premium posting
PUT    /api/jobs/:jobId/premium              # Update premium tier
GET    /api/jobs/premium                     # Browse premium listings
```

---

## API Endpoints Summary

### Authentication Required (unless noted)
All endpoints except GET operations require authentication token in headers:
```
Authorization: Bearer <token>
```

### Common Response Format
```json
{
  "total": 100,
  "data": [...]
}
```

---

## Frontend Components

### New Pages
1. `PharmacyDirectoryPage.js` - Pharmacy listings with filters
2. `CPDCoursesPage.js` - Course marketplace
3. `MentorshipPage.js` - Mentor browse and management
4. `EventsPage.js` - Event listings and registration
5. `JobApplicationsPage.js` - Application tracking

### Integration Points
Update these files to add navigation links:
- `Navbar.js` - Add links to new features
- `routes/index.js` - Add routes for new pages
- Dashboard - Add shortcuts for pharmacists

---

## Database Models

All models follow Sequelize ORM convention with:
- UUID primary keys
- `createdAt`, `updatedAt` timestamps
- Proper relationships and foreign keys
- Validation rules

### Model Relationships
```
User → Certification (1:M)
User → Pharmacy (1:M)
User → CPDCourse (1:M as instructor)
User → SkillEndorsement (2 relations: owner, endorser)
User → Mentorship (2 relations: mentor, mentee)
User → Event (1:M as organizer)
User → JobApplication (1:M)
Pharmacy → InventoryItem (1:M)
Pharmacy → BulkOrder (1:M)
Product → InventoryItem (1:M)
User → SupplierRating (1:M as supplier)
```

---

## Implementation Checklist

- [x] Create all data models
- [x] Create API routes and controllers
- [x] Create React components and pages
- [x] Add route registrations to server.js
- [ ] Update Navbar with navigation links
- [ ] Add model relationships/associations
- [ ] Create migrations for new tables
- [ ] Test all endpoints
- [ ] Add form validations
- [ ] Implement file uploads for certifications
- [ ] Add payment integration for CPD/mentorship/premium jobs
- [ ] Create admin dashboard for verifications
- [ ] Add email notifications
- [ ] Setup real-time updates with Socket.io

---

## Next Steps

1. **Register Routes**: Add links in `Navbar.js`
2. **Database Sync**: Run `npm run seed` after updating .env
3. **Frontend Routes**: Update `App.js` with new page routes
4. **Test APIs**: Use Postman/Insomnia for endpoint testing
5. **Frontend Testing**: Test all pages with sample data
6. **Admin Dashboard**: Create verification UI for certifications
7. **Payments**: Integrate Stripe for premium features
8. **Notifications**: Set up email/SMS for key events

---

## Support
Refer to individual component/route files for detailed implementation notes.
