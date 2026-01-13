# User Engagement Features - Quick Reference Guide

## 🚀 Getting Started (5 Minutes)

### 1. Deploy Database Migration
```bash
cd /path/to/ZimPharmHub
npm run migrate
```

### 2. Test Endpoints
```bash
# Test real-time notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/realtime-notifications

# Test reviews
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/reviews/pharmacy/PHARMACY_ID

# Test CPD
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/cpd/my-records
```

---

## 📊 Feature Quick Links

### Real-time Notifications
**Port:** `/api/realtime-notifications`

| Action | Endpoint | Method |
|--------|----------|--------|
| Get notifications | `/` | GET |
| Get unread count | `/unread/count` | GET |
| Mark as read | `/:id/read` | PATCH |
| Mark all read | `/read-all` | PATCH |
| Get by type | `/type/:type` | GET |

**Notification Types:**
- `job_alert` - New job match
- `new_message` - New message
- `pharmacy_update` - Pharmacy updated
- `mentorship_request` - Mentorship request
- `cpd_reminder` - CPD deadline
- `application_update` - Application status
- `review_posted` - Review approved
- `system_notification` - System message

---

### Pharmacy Reviews
**Port:** `/api/reviews`

| Action | Endpoint | Method |
|--------|----------|--------|
| Get reviews | `/pharmacy/:id` | GET |
| Create review | `/` | POST |
| Update review | `/:id` | PUT |
| Delete review | `/:id` | DELETE |
| Approve review | `/:id/approve` | PATCH |
| Mark helpful | `/:id/helpful` | PATCH |
| Get stats | `/stats/:id` | GET |

**Key Data:**
- Rating: 1-5 stars
- Title: Review heading
- Comment: Review body
- isPharmacist: Auto-flagged
- verified: Admin approval

---

### Mentorship Matching
**Port:** `/api/mentorship`

| Action | Endpoint | Method |
|--------|----------|--------|
| Browse mentors | `/mentors` | GET |
| Request mentorship | `/request` | POST |
| My matches | `/my-matches` | GET |
| Respond to request | `/:id/respond` | PATCH |
| Log session | `/:id/session` | POST |
| Rate mentorship | `/:id/rate` | PATCH |
| End mentorship | `/:id/end` | PATCH |

**Match Status:**
- `pending` - Awaiting mentor response
- `active` - Ongoing mentorship
- `completed` - Finished
- `rejected` - Declined

---

### CPD Tracking
**Port:** `/api/cpd`

| Action | Endpoint | Method |
|--------|----------|--------|
| My records | `/my-records` | GET |
| Create activity | `/` | POST |
| Get stats | `/stats/summary` | GET |
| Update record | `/:id` | PUT |
| Delete record | `/:id` | DELETE |
| Pending (admin) | `/admin/pending` | GET |
| Verify record | `/:id/verify` | PATCH |

**Activity Types:**
- workshop, seminar, conference
- online_course, publication, presentation
- research, certification
- professional_meeting, mentoring

**Compliance:** 30 hours/year (15 mandatory)

---

### Job Analytics
**Port:** `/api/job-analytics`

| Action | Endpoint | Method |
|--------|----------|--------|
| Job analytics | `/job/:id` | GET |
| Dashboard | `/dashboard/overview` | GET |
| Track view | `/track/view` | POST |
| Track application | `/track/application` | POST |
| Track conversion | `/track/conversion` | POST |
| Compare jobs | `/comparison/jobs` | GET |
| Application stats | `/applications/stats` | GET |

**Key Metrics:**
- Views: Total listings shown
- Applications: Total applications
- Conversions: Jobs filled
- Application Rate: (Apps/Views)×100
- Conversion Rate: (Conversions/Apps)×100

---

## 🔧 Common API Patterns

### Authentication Header
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Success Response
```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Pagination
```json
{
  "success": true,
  "data": [ /* ... */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## 💡 Usage Examples

### Create a Review
```javascript
const createReview = async (pharmacyId) => {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      pharmacyId,
      rating: 5,
      title: 'Great service',
      comment: 'Staff was very helpful'
    })
  });
  return await res.json();
};
```

### Request Mentorship
```javascript
const requestMentorship = async (mentorId) => {
  const res = await fetch('/api/mentorship/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      mentorId,
      goals: 'Learn clinical pharmacy',
      frequency: 'weekly',
      specializations: ['clinical']
    })
  });
  return await res.json();
};
```

### Submit CPD Activity
```javascript
const submitCPD = async () => {
  const res = await fetch('/api/cpd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      activityType: 'workshop',
      title: 'Advanced Pharmacotherapy',
      hoursEarned: 8,
      activityDate: new Date().toISOString(),
      category: 'mandatory'
    })
  });
  return await res.json();
};
```

### Track Job View
```javascript
const trackView = async (jobId) => {
  await fetch('/api/job-analytics/track/view', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ jobId })
  });
};
```

### Get Notifications
```javascript
const getNotifications = async () => {
  const res = await fetch(
    '/api/realtime-notifications?limit=10',
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return await res.json();
};
```

---

## 📱 Frontend Components Needed

### Page: Pharmacy Profile
```
├── Rating Display
├── Review Section
│   ├── Review List (paginated)
│   ├── Write Review Button
│   └── Review Form (modal)
└── Statistics
```

### Page: Mentorship Hub
```
├── Mentor Discovery
│   ├── Search/Filter
│   └── Mentor Cards
├── My Mentorships
│   ├── Pending Requests
│   ├── Active Matches
│   └── History
└── Session Tracker
```

### Page: CPD Dashboard
```
├── Compliance Status
│   ├── Progress Bar
│   └── Hours Breakdown
├── Activities List
├── Submit Activity Form
└── Statistics by Type
```

### Page: Job Analytics
```
├── Dashboard Metrics
│   ├── Views, Applications, Conversions
│   └── Rates (application, conversion)
├── Charts
│   ├── Trend Chart
│   └── Funnel Chart
├── Top Performing Jobs
└── Job Comparison Table
```

### Component: Notification Bell
```
├── Icon with Badge
├── Dropdown Menu
│   ├── Notification List
│   └── Mark All Read Button
└── Notification Center Link
```

---

## 🔐 Permission Matrix Quick Reference

### Reviews
| Action | User | Owner | Admin |
|--------|------|-------|-------|
| Create | ✅ | ✅ | ✅ |
| View published | ✅ | ✅ | ✅ |
| View pending | ❌ | ✅ | ✅ |
| Approve | ❌ | ✅ | ✅ |
| Delete own | ✅ | ❌ | ✅ |

### Mentorship
| Action | Mentee | Mentor | Admin |
|--------|--------|--------|-------|
| Browse | ✅ | ❌ | ✅ |
| Request | ✅ | ❌ | ❌ |
| Respond | ❌ | ✅ | ✅ |
| Rate | ✅ | ✅ | ❌ |
| End | ✅ | ✅ | ✅ |

### CPD
| Action | User | Admin |
|--------|------|-------|
| Create | ✅ | ✅ |
| View own | ✅ | ✅ |
| Verify | ❌ | ✅ |
| Delete | ✅ | ✅ |

### Job Analytics
| Action | Employer | Admin |
|--------|----------|-------|
| View own | ✅ | ✅ |
| View all | ❌ | ✅ |
| Track | Anyone | Anyone |

### Notifications
| Action | User | Admin |
|--------|------|-------|
| View own | ✅ | ✅ |
| Read/dismiss | ✅ | ❌ |
| Delete | ✅ | ✅ |

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Review not showing | Check if approved by pharmacy owner |
| Mentorship not appearing | Ensure mentor response sent |
| CPD hours not counting | Records must be verified by admin |
| Analytics showing zeros | Ensure tracking calls implemented |
| Notifications not received | Check user preferences enabled |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `USER_ENGAGEMENT_FEATURES.md` | Complete reference |
| `QUICK_START_REVIEWS.md` | Reviews deep dive |
| `QUICK_START_MENTORSHIP.md` | Mentorship deep dive |
| `QUICK_START_CPD.md` | CPD deep dive |
| `QUICK_START_JOB_ANALYTICS.md` | Analytics deep dive |
| `QUICK_START_REALTIME_NOTIFICATIONS.md` | Notifications deep dive |
| `USER_ENGAGEMENT_IMPLEMENTATION_CHECKLIST.md` | Implementation roadmap |
| `USER_ENGAGEMENT_SUMMARY.md` | Project overview |

---

## 🎯 Quick Implementation Checklist

- [ ] Run migration: `npm run migrate`
- [ ] Test API endpoints with curl/Postman
- [ ] Update User model fields
- [ ] Create review component
- [ ] Create mentorship interface
- [ ] Build CPD dashboard
- [ ] Build analytics dashboard
- [ ] Add notification UI
- [ ] Test all features end-to-end
- [ ] Deploy to staging
- [ ] Gather user feedback
- [ ] Deploy to production

---

## 📞 Quick Support

**API Issues?**
- Check authentication header
- Verify endpoint URL
- Check request body format
- Review validation rules

**Database Issues?**
- Verify migration ran
- Check connection string
- Verify indexes created
- Check table structure

**Feature Questions?**
- Read feature-specific quick start
- Check usage examples
- Review business logic
- Consult implementation checklist

---

## ⚡ Performance Tips

1. **Add pagination** - Default limit of 20
2. **Cache results** - Use Redis for frequently accessed data
3. **Use indexes** - Pre-built on all key fields
4. **Batch operations** - Combine multiple operations
5. **Lazy load** - Load components on demand
6. **Debounce events** - Prevent excessive API calls
7. **Compress responses** - Enable gzip compression

---

## 🚀 Production Checklist

- [ ] Database backups configured
- [ ] Error monitoring enabled (Sentry)
- [ ] Performance monitoring active
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Email service connected
- [ ] Logs being collected
- [ ] Health checks enabled
- [ ] Rollback plan prepared

---

## 📊 Monitoring Dashboards

Track these metrics:
- API response times
- Error rates by endpoint
- Database query times
- Notification delivery rates
- Feature adoption rates
- User engagement metrics

---

## 🔄 Regular Maintenance

**Daily:** Monitor error logs
**Weekly:** Review performance metrics
**Monthly:** Optimize slow queries
**Quarterly:** Security audit
**Yearly:** Architecture review

---

## 📝 Notes

- All endpoints require authentication (JWT)
- Input validation on all fields
- Database indexes on common queries
- Automatic timestamps on records
- Soft deletes not implemented (hard deletes)
- Pagination default limit: 20 items

---

**Last Updated:** January 10, 2024
**Status:** ✅ Production Ready
**Support:** See documentation files
