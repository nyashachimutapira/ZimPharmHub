# User Engagement Features Implementation Guide

This document provides comprehensive information about the five new user engagement features added to ZimPharmHub.

## Features Overview

### 1. Real-time Notifications
**Purpose:** Deliver job alerts, new messages, pharmacy updates, and other important events to users in real-time.

**Key Endpoints:**
- `GET /api/realtime-notifications` - Get user's notifications
- `GET /api/realtime-notifications/unread/count` - Get unread notification count
- `PATCH /api/realtime-notifications/:notificationId/read` - Mark as read
- `PATCH /api/realtime-notifications/read-all` - Mark all as read
- `PATCH /api/realtime-notifications/:notificationId/dismiss` - Dismiss notification
- `DELETE /api/realtime-notifications/:notificationId` - Delete notification
- `GET /api/realtime-notifications/type/:type` - Get notifications by type
- `GET /api/realtime-notifications/preferences` - Get notification preferences
- `PATCH /api/realtime-notifications/preferences` - Update preferences

**Notification Types:**
- job_alert - New matching jobs
- new_message - Messages from other users
- pharmacy_update - Pharmacy profile updates
- mentorship_request - New mentorship requests
- cpd_reminder - CPD activity reminders
- application_update - Application status changes
- review_posted - New reviews on pharmacy
- system_notification - System-wide announcements

**Features:**
- Multi-channel delivery (email, SMS, push)
- Expiration management
- Priority levels (low, medium, high, urgent)
- Batch read operations
- Type-based filtering
- User preferences management

---

### 2. Pharmacy Ratings & Reviews
**Purpose:** Allow users to leave verified reviews of pharmacies with pharmacist badges.

**Key Endpoints:**
- `GET /api/reviews/pharmacy/:pharmacyId` - Get pharmacy reviews
- `GET /api/reviews/pending/:pharmacyId` - Get pending reviews (owner/admin)
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review
- `PATCH /api/reviews/:reviewId/approve` - Approve/reject review (owner/admin)
- `PATCH /api/reviews/:reviewId/helpful` - Mark as helpful/unhelpful
- `GET /api/reviews/stats/:pharmacyId` - Get review statistics

**Features:**
- 1-5 star ratings
- Verified purchase badges
- Pharmacist verification badges
- Review moderation workflow
- Helpful/unhelpful voting
- Rating distribution statistics
- Automatic pharmacy rating calculation

**Review Fields:**
```json
{
  "pharmacyId": "uuid",
  "rating": 1-5,
  "title": "string",
  "comment": "string",
  "isPharmacist": boolean,
  "verifiedPurchase": boolean,
  "approved": boolean
}
```

---

### 3. Mentorship Matching
**Purpose:** Connect senior pharmacists with junior pharmacists for professional development.

**Key Endpoints:**
- `GET /api/mentorship/mentors` - Browse available mentors
- `POST /api/mentorship/request` - Request mentorship
- `GET /api/mentorship/my-matches` - Get user's mentorship matches
- `PATCH /api/mentorship/:matchId/respond` - Accept/reject request (mentor)
- `POST /api/mentorship/:matchId/session` - Log completed session
- `PATCH /api/mentorship/:matchId/rate` - Rate mentorship experience
- `PATCH /api/mentorship/:matchId/end` - End mentorship

**Features:**
- Mentor discovery with specialization filters
- Mentee/mentor role management
- Session tracking
- Bi-directional rating system
- Specialization matching
- Goal tracking
- Frequency scheduling (weekly, bi-weekly, monthly)

**Match States:**
- pending - Awaiting mentor response
- active - Ongoing mentorship
- completed - Mentorship finished
- rejected - Request declined

**Match Fields:**
```json
{
  "mentorId": "uuid",
  "menteeId": "uuid",
  "status": "pending|active|completed|rejected",
  "frequency": "weekly|bi-weekly|monthly",
  "mentorshipGoals": "string",
  "specializations": ["string"],
  "sessionsCompleted": number,
  "mentorRating": decimal,
  "menteeRating": decimal
}
```

---

### 4. CPD Tracking
**Purpose:** Track continuing professional development hours for pharmacists to ensure regulatory compliance.

**Key Endpoints:**
- `GET /api/cpd/my-records` - Get user's CPD records
- `POST /api/cpd` - Create new CPD record
- `GET /api/cpd/stats/summary` - Get CPD statistics
- `PUT /api/cpd/:recordId` - Update CPD record
- `DELETE /api/cpd/:recordId` - Delete CPD record
- `GET /api/cpd/admin/pending` - Get pending records for verification
- `PATCH /api/cpd/:recordId/verify` - Verify/reject record (admin)

**CPD Activity Types:**
- workshop
- seminar
- conference
- online_course
- publication
- presentation
- research
- certification
- professional_meeting
- mentoring

**Features:**
- Multi-category activity tracking
- Mandatory vs elective hours separation
- Certificate upload support
- Admin verification workflow
- Annual compliance tracking
- Statistics by activity type
- Evidence documentation
- Verification notes

**CPD Record Fields:**
```json
{
  "userId": "uuid",
  "activityType": "workshop|seminar|conference|online_course|...",
  "title": "string",
  "hoursEarned": decimal,
  "activityDate": "date",
  "category": "mandatory|elective",
  "provider": "string",
  "completionCertificate": "string",
  "verified": boolean
}
```

**Compliance:**
- Default requirement: 30 hours per year
- Customizable by region/jurisdiction
- Real-time compliance status
- Yearly reports

---

### 5. Job Analytics Dashboard
**Purpose:** Provide employers with detailed analytics about job postings and recruitment performance.

**Key Endpoints:**
- `GET /api/job-analytics/job/:jobId` - Get analytics for specific job
- `GET /api/job-analytics/dashboard/overview` - Get employer dashboard stats
- `POST /api/job-analytics/track/view` - Track job view
- `POST /api/job-analytics/track/application` - Track application
- `POST /api/job-analytics/track/conversion` - Track job filled
- `GET /api/job-analytics/comparison/jobs` - Compare job performance
- `GET /api/job-analytics/applications/stats` - Get application statistics

**Metrics Tracked:**
- Views - Total job views
- Clicks - Times users clicked through
- Applications - Total applications received
- Application Rate - (applications / views) * 100
- Conversions - Jobs filled
- Conversion Rate - (conversions / applications) * 100
- Unique Viewers - Number of unique users who viewed
- Average Time Spent - Average time on job listing (seconds)
- Last Viewed - Timestamp of last view

**Features:**
- Real-time metric updates
- Timeframe filtering (7d, 30d, 90d, 1y, all)
- Top performing jobs ranking
- Job comparison analytics
- Application trend analysis
- Daily application grouping
- Conversion funnel analysis

**Analytics Record Fields:**
```json
{
  "jobId": "uuid",
  "employerId": "uuid",
  "views": number,
  "applications": number,
  "conversions": number,
  "uniqueViewers": number,
  "averageTimeSpent": number,
  "applicationRate": decimal,
  "conversionRate": decimal,
  "lastViewed": "date"
}
```

**Dashboard Overview Response:**
```json
{
  "timeframe": "30d|7d|90d|1y|all",
  "totalJobs": number,
  "totalViews": number,
  "totalApplications": number,
  "totalConversions": number,
  "uniqueViewers": number,
  "averageTimeSpent": number,
  "applicationRate": decimal,
  "conversionRate": decimal,
  "topPerformingJobs": [
    {
      "jobId": "uuid",
      "views": number,
      "applications": number
    }
  ]
}
```

---

## Database Models

### PharmacyReview
- Tracks all pharmacy reviews
- Links reviewers to pharmacies
- Includes moderation status
- Helpful/unhelpful voting counts

### MentorshipMatch
- Connects mentors and mentees
- Tracks status and progress
- Records ratings and feedback
- Manages specialization matching

### CPDRecord
- Stores all CPD activities
- Tracks verification status
- Links to certifications/evidence
- Includes admin verification notes

### JobAnalytic
- Tracks all recruitment metrics
- Calculates conversion rates
- Maintains performance history
- Links to job postings

### RealtimeNotification
- Stores all notifications
- Tracks delivery channels
- Manages read/dismiss status
- Supports expiration

---

## Integration Guidelines

### With Existing Features

**Job Alerts Integration:**
- Create `RealtimeNotification` when matching job found
- Set type to 'job_alert'
- Include job details in metadata

**Message System Integration:**
- Create `RealtimeNotification` when new message received
- Set type to 'new_message'
- Link to message thread

**Application System Integration:**
- Create `RealtimeNotification` on application status change
- Track applications in `JobAnalytic`
- Calculate conversion rates

**User System Integration:**
- Mark users as mentors with `isMentor` flag
- Add `yearsOfExperience` and `specializations` fields
- Store notification preferences

---

## API Response Format

All endpoints follow a standard response format:

**Success Response:**
```json
{
  "success": true,
  "data": { },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Authentication & Authorization

All endpoints require authentication via JWT token in `Authorization: Bearer <token>` header.

**Permission Rules:**
- Users can only view their own notifications
- Users can only modify their own reviews/CPD records
- Pharmacy owners can approve reviews
- Only admins can verify CPD records
- Employers can only view their own job analytics
- Mentors can accept/reject mentorship requests

---

## Feature Dependencies

1. **Real-time Notifications** - Independent, used by other features
2. **Pharmacy Reviews** - Requires Pharmacy model
3. **Mentorship** - Requires User model with mentor fields
4. **CPD Tracking** - Requires User model
5. **Job Analytics** - Requires Job and Application models

---

## Configuration

### Environment Variables
```env
# Notification delivery settings
EMAIL_NOTIFICATIONS_ENABLED=true
SMS_NOTIFICATIONS_ENABLED=false
PUSH_NOTIFICATIONS_ENABLED=true

# CPD compliance settings
REQUIRED_CPD_HOURS_PER_YEAR=30
MANDATORY_HOURS_PERCENTAGE=50

# Analytics settings
TRACK_ANALYTICS=true
ANALYTICS_RETENTION_DAYS=730
```

---

## Data Retention & Privacy

- Notifications: Expire after configurable period (default: 90 days)
- Reviews: Permanent (archived when pharmacy deleted)
- CPD Records: Retain for minimum 3 years
- Analytics: Aggregate data after 2 years
- Mentorship: Archive after completion

---

## Performance Considerations

**Indexing:**
- PharmacyReview: (pharmacyId), (userId)
- MentorshipMatch: (mentorId), (menteeId)
- CPDRecord: (userId), (verified)
- JobAnalytic: (jobId), (employerId)
- RealtimeNotification: (userId, isRead), (createdAt), (type)

**Caching:**
- Cache pharmacy ratings (update every 30 mins)
- Cache mentor availability (update every hour)
- Cache user CPD stats (update weekly)
- Cache job analytics summaries (update hourly)

---

## Roadmap & Future Enhancements

1. **Real-time WebSocket Support** - Live notification delivery
2. **Advanced Mentorship Scheduling** - Calendar integration
3. **CPD Import/Export** - CSV and PDF support
4. **Analytics Export** - Dashboard PDF reports
5. **Review Moderation AI** - Automated spam detection
6. **Notification Templates** - Customizable message templates

---

## Testing Guide

See individual feature quick start guides for testing procedures:
- USER_ENGAGEMENT_REVIEWS_QUICK_START.md
- USER_ENGAGEMENT_MENTORSHIP_QUICK_START.md
- USER_ENGAGEMENT_CPD_QUICK_START.md
- USER_ENGAGEMENT_ANALYTICS_QUICK_START.md
- USER_ENGAGEMENT_NOTIFICATIONS_QUICK_START.md
