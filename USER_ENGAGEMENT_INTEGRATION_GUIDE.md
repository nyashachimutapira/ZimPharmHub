# User Engagement Features - Integration Guide

## Overview
This guide explains how the five new user engagement features integrate with each other and with existing ZimPharmHub systems.

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   User Engagement System                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Real-time Notifications (Core Hub)            │  │
│  │  • Central notification dispatch system               │  │
│  │  • Multi-channel delivery (Email, SMS, Push)         │  │
│  │  • Event subscription system                          │  │
│  └───────────┬──────────────────────────────────────────┘  │
│              │                                               │
│    ┌─────────┼──────────────┬─────────────┬──────────────┐ │
│    │         │              │             │              │ │
│    ▼         ▼              ▼             ▼              ▼ │
│  ┌────┐  ┌────────┐  ┌──────────┐  ┌───────┐  ┌─────────┐ │
│  │    │  │        │  │          │  │       │  │         │ │
│  │    │  │        │  │          │  │       │  │         │ │
│  └────┘  └────────┘  └──────────┘  └───────┘  └─────────┘ │
│ Reviews  Mentorship    CPD       Analytics  External        │
│                                             Systems          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Feature Interactions

### 1. Notifications ↔ Reviews

**When:** User submits a review
```javascript
// In POST /api/reviews
const review = await PharmacyReview.create({...});

// Create notification for pharmacy owner
await RealtimeNotification.create({
  userId: pharmacy.ownerId,
  type: 'review_posted',
  title: 'New Review Submitted',
  message: `New review submitted for ${pharmacy.name}`,
  relatedId: review.id,
  relatedType: 'review',
  actionUrl: `/reviews/pending/${pharmacy.id}`,
  priority: 'high'
});
```

**When:** Pharmacy owner approves review
```javascript
// In PATCH /api/reviews/:id/approve
await review.update({ approved: true });

// Notify reviewer
await RealtimeNotification.create({
  userId: review.userId,
  type: 'review_posted',
  title: 'Your Review Was Approved',
  message: `Your review has been published`,
  relatedId: review.id,
  priority: 'medium'
});
```

**When:** Review is rejected
```javascript
// Notify reviewer of rejection
await RealtimeNotification.create({
  userId: review.userId,
  type: 'system_notification',
  title: 'Review Not Approved',
  message: 'Your review did not meet our guidelines',
  priority: 'low'
});
```

### 2. Notifications ↔ Mentorship

**When:** Mentee requests mentorship
```javascript
// In POST /api/mentorship/request
const match = await MentorshipMatch.create({
  mentorId,
  menteeId: req.user.id,
  status: 'pending'
});

// Notify mentor
await RealtimeNotification.create({
  userId: mentorId,
  type: 'mentorship_request',
  title: 'Mentorship Request',
  message: `${mentee.firstName} has requested mentorship`,
  relatedId: match.id,
  relatedType: 'mentorship',
  priority: 'high'
});
```

**When:** Mentor approves mentorship
```javascript
// In PATCH /api/mentorship/:id/respond
if (approved) {
  await match.update({
    status: 'active',
    startDate: new Date()
  });

  // Notify mentee
  await RealtimeNotification.create({
    userId: match.menteeId,
    type: 'mentorship_request',
    title: 'Mentorship Approved',
    message: 'Your mentorship request has been accepted',
    relatedId: match.id,
    priority: 'high'
  });
}
```

**When:** Mentorship ends
```javascript
// In PATCH /api/mentorship/:id/end
await match.update({
  status: 'completed',
  endDate: new Date()
});

// Notify both parties
await RealtimeNotification.create({
  userId: match.mentorId,
  type: 'system_notification',
  title: 'Mentorship Complete',
  message: 'Mentorship with ' + mentee.name + ' has ended'
});

await RealtimeNotification.create({
  userId: match.menteeId,
  type: 'system_notification',
  title: 'Mentorship Complete',
  message: 'Mentorship with ' + mentor.name + ' has ended'
});
```

### 3. CPD ↔ Mentorship

**When:** Mentor logs CPD for mentoring activity
```javascript
// In POST /api/cpd
const cpdRecord = await CPDRecord.create({
  userId: req.user.id,
  activityType: 'mentoring',
  title: `Mentored ${menteeName} for 6 weeks`,
  hoursEarned: 12,
  activityDate: new Date(),
  category: 'elective',
  verified: true // Auto-verify mentoring
});
```

**Requirements:**
- Mentorship must be completed
- Hours calculated from mentorship duration
- Auto-verified for mentoring activities
- Counted toward CPD requirement

### 4. Notifications ↔ Job Analytics

**When:** Job posted (future integration)
```javascript
// In POST /api/jobs (existing jobs route)
// Create analytics record
await JobAnalytic.create({
  jobId: job.id,
  employerId: job.employerId
});

// Notify employer
await RealtimeNotification.create({
  userId: job.employerId,
  type: 'system_notification',
  title: 'Job Posted Successfully',
  message: `${job.title} is now live`,
  actionUrl: `/analytics/${job.id}`
});
```

**When:** Application received
```javascript
// In POST /api/applications (existing route)
// Track in analytics
await JobAnalytic.findOne({ where: { jobId } })
  .then(a => a.increment('applications'));

// Notify employer
await RealtimeNotification.create({
  userId: job.employerId,
  type: 'application_update',
  title: 'New Application',
  message: `${applicant.name} applied for ${job.title}`,
  relatedId: application.id,
  relatedType: 'application',
  actionUrl: `/applications/${application.id}`,
  priority: 'high'
});
```

**When:** Job filled
```javascript
// In PATCH /api/jobs/:id/close (existing route)
// Track conversion
await JobAnalytic.findOne({ where: { jobId } })
  .then(a => a.increment('conversions'));

// Notify employer
await RealtimeNotification.create({
  userId: job.employerId,
  type: 'application_update',
  title: 'Job Filled',
  message: `${job.title} has been filled`,
  priority: 'medium'
});
```

### 5. Notifications ↔ Messages

**When:** User receives message
```javascript
// In POST /api/messages (existing messages route)
const message = await Message.create({...});

// Create notification
await RealtimeNotification.create({
  userId: message.recipientId,
  type: 'new_message',
  title: 'New Message',
  message: `${sender.firstName} sent you a message`,
  relatedId: message.id,
  relatedType: 'message',
  actionUrl: `/messages/${message.conversationId}`,
  priority: 'medium'
});
```

### 6. CPD ↔ Job Alerts

**When:** CPD non-compliance detected
```javascript
// In scheduled job (new)
// Check all users' CPD compliance
const users = await User.findAll({ where: { userType: 'pharmacist' } });

for (const user of users) {
  const stats = await calculateCPDCompliance(user.id, currentYear);
  
  if (!stats.compliant) {
    await RealtimeNotification.create({
      userId: user.id,
      type: 'cpd_reminder',
      title: 'CPD Non-Compliance Alert',
      message: `You need ${stats.hoursNeeded} more hours to comply`,
      priority: 'high',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }
}
```

## Integration Points with Existing Systems

### Job Alerts Integration

**Current System:** `/api/job-alerts`
**Integration Point:** Create notification when alert triggers

```javascript
// In job matching algorithm (existing jobAlerts route)
const matchingJobs = await findMatchingJobs(user.criteria);

for (const job of matchingJobs) {
  // Create alert record (existing)
  const alert = await JobAlert.create({...});

  // NEW: Create notification (integrated)
  await RealtimeNotification.create({
    userId: user.id,
    type: 'job_alert',
    title: 'New Job Match',
    message: `${job.title} in ${job.location} matches your search`,
    relatedId: job.id,
    relatedType: 'job',
    actionUrl: `/jobs/${job.id}`,
    priority: 'high'
  });
}
```

### Applications Integration

**Current System:** `/api/applications`
**Integration Points:**

1. **Track Application in Analytics**
```javascript
// In POST /api/applications
const application = await Application.create({...});

// Track in job analytics
await trackApplicationInAnalytics(application.jobId);
```

2. **Notify Employer**
```javascript
// NEW: Create notification
await RealtimeNotification.create({
  userId: job.employerId,
  type: 'application_update',
  title: 'New Application',
  message: `${applicant.name} applied for ${job.title}`
});
```

3. **Update Application Status**
```javascript
// In PATCH /api/applications/:id/status
await application.update({ status: newStatus });

// NEW: Notify applicant
await RealtimeNotification.create({
  userId: application.userId,
  type: 'application_update',
  title: 'Application Status Updated',
  message: `Your application is now ${newStatus}`,
  relatedId: application.id
});
```

### Forum Integration

**Current System:** `/api/forum`
**Integration Points:**

**When:** New forum reply
```javascript
// In POST /api/forum/posts/:id/reply
const reply = await ForumReply.create({...});

// Notify post author (existing)
// Already handled in forum routes

// NEW: Create notification
await RealtimeNotification.create({
  userId: post.userId,
  type: 'system_notification',
  title: 'Forum Reply',
  message: `${reply.author.name} replied to your post`,
  relatedId: reply.id,
  actionUrl: `/forum/${post.id}`
});
```

### Messages Integration

**Current System:** `/api/messages`
**Integration Points:**

**When:** New direct message
```javascript
// In POST /api/messages
const message = await Message.create({...});

// NEW: Create notification
await RealtimeNotification.create({
  userId: message.recipientId,
  type: 'new_message',
  title: 'New Message',
  message: `${message.sender.firstName} sent you a message`,
  relatedId: message.conversationId,
  actionUrl: `/messages/${message.conversationId}`
});
```

## Data Flow Examples

### Complete Job Application Flow with Integrations

```
1. User views job
   ↓
2. Track view in JobAnalytics
   └─→ views++
   
3. User applies
   ↓
4. Create Application
   ├─→ Track in JobAnalytics (applications++)
   └─→ Create notification for employer
   
5. Employer reviews applications
   
6. Employer shortlists applicant
   ├─→ Update application status
   └─→ Notify applicant with status change
   
7. Application is accepted
   ├─→ Update application status
   ├─→ Notify applicant
   └─→ Track conversion in JobAnalytics (conversions++)
   
8. Job is filled
   ├─→ Update job status
   ├─→ Notify all applicants
   └─→ Final conversion tracked
```

### Complete Mentorship Flow with Integrations

```
1. Senior pharmacist enables mentoring
   
2. Junior pharmacist browses mentors
   
3. Junior requests mentorship
   ├─→ Create MentorshipMatch (pending)
   └─→ Notify senior pharmacist
   
4. Senior accepts request
   ├─→ Update status to 'active'
   ├─→ Set start date
   └─→ Notify junior pharmacist
   
5. Sessions occur and are logged
   └─→ sessionsCompleted++
   
6. Mentorship ends
   ├─→ Update status to 'completed'
   ├─→ Set end date
   ├─→ Both provide ratings
   ├─→ Create notification to both
   └─→ Can create CPD record for mentor
```

### Complete CPD Compliance Flow

```
1. Pharmacist attends workshop
   
2. Pharmacist submits CPD record
   ├─→ Create CPDRecord (unverified)
   └─→ Notify admin
   
3. Admin reviews and verifies
   ├─→ Update verified=true
   ├─→ Set verifiedBy and verificationDate
   └─→ Notify pharmacist of approval
   
4. System calculates compliance
   ├─→ Count verified records for year
   ├─→ Sum hours by category
   └─→ Compare against requirement
   
5. Notification sent if non-compliant
   └─→ Create reminder notification
```

## API Call Sequences

### Example: Create Review and Trigger Notifications

**Request:**
```http
POST /api/reviews
Authorization: Bearer token
Content-Type: application/json

{
  "pharmacyId": "pharm-123",
  "rating": 5,
  "title": "Excellent Service",
  "comment": "Staff was very helpful"
}
```

**Server Processing:**
```javascript
1. Create PharmacyReview
2. Check if isPharmacist → auto-flag
3. Create RealtimeNotification for pharmacy owner
4. Recalculate pharmacy average rating
5. Return success response
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "review-uuid",
    "pharmacyId": "pharm-123",
    "rating": 5,
    "title": "Excellent Service",
    "approved": false
  },
  "message": "Review submitted for moderation"
}
```

## Database Relationships

```
Users
├── PharmacyReviews (1:N)
├── MentorshipMatches
│   ├── As Mentor (1:N)
│   └── As Mentee (1:N)
├── CPDRecords (1:N)
├── JobAnalytics (1:N)
└── RealtimeNotifications (1:N)

Pharmacies
└── PharmacyReviews (1:N)

Jobs
└── JobAnalytics (1:N)

Applications
└── (tracked via JobAnalytics)
```

## Performance Considerations

### Notification Delivery
- Notifications created immediately (async)
- Email delivery asynchronous (queue)
- SMS delivery conditional (opt-in)
- Push delivery optional

### Analytics Tracking
- View tracking incremental
- Application tracking incremental
- Conversion tracking incremental
- Calculations on-demand (cached)

### CPD Verification
- Bulk verification admin task
- Compliance checked annually
- Automatic reminders sent

## Error Handling

### Failed Notification
```javascript
try {
  await RealtimeNotification.create({...});
} catch (err) {
  console.error('Notification creation failed:', err);
  // Feature continues, notification not critical
}
```

### Failed Analytics Tracking
```javascript
try {
  await trackView(jobId);
} catch (err) {
  console.error('Analytics tracking failed:', err);
  // Job view not blocked, analytics not critical
}
```

### Failed CPD Verification
```javascript
try {
  await verifyCPD(recordId);
  await RealtimeNotification.create({...});
} catch (err) {
  console.error('Verification failed:', err);
  // Return error to user, transaction rolled back
}
```

## Testing Integration Points

### Test Review Creation with Notification
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "pharmacyId": "pharm-123",
    "rating": 5,
    "title": "Test Review",
    "comment": "Test comment"
  }'

# Then check notifications
curl http://localhost:5000/api/realtime-notifications/type/review_posted \
  -H "Authorization: Bearer token"
```

### Test Mentorship with Notifications
```bash
curl -X POST http://localhost:5000/api/mentorship/request \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "mentorId": "mentor-123",
    "goals": "Learn clinical pharmacy",
    "frequency": "weekly"
  }'

# Check mentor's notifications
curl http://localhost:5000/api/realtime-notifications/type/mentorship_request \
  -H "Authorization: Bearer token"
```

## Migration Path

### Phase 1: Core Notifications
- Deploy RealtimeNotifications model
- Deploy notifications endpoint
- Test basic functionality

### Phase 2: Feature Integration
- Deploy other models
- Deploy feature routes
- Add notification creation to features
- Test end-to-end flows

### Phase 3: Advanced Integration
- Email service setup
- SMS integration (optional)
- Push notifications (optional)
- Notification preferences UI

### Phase 4: Optimization
- Add caching
- Optimize queries
- Implement batch operations
- Monitor performance

## Monitoring Integration Health

**Key Metrics:**
1. Notification delivery rate
2. Feature activation rate
3. Integration error rate
4. Database performance
5. User engagement

**Alerts to Set:**
- Notification creation failure
- Analytics tracking failure
- Verification workflow failure
- High error rates

---

**Document Status:** Complete
**Last Updated:** January 10, 2024
**Integration Points:** 20+
**Features Integrated:** 5
