# Saved Jobs Feature - Quick Start

## What Was Added

Three core features for increasing user engagement:

1. **Saved Jobs** - Users can bookmark jobs for later
2. **Dashboard Saved Jobs Section** - View all saved jobs in one place
3. **Email Reminders** - Get reminders about saved job opportunities

## Files Added/Modified

### New Files
```
models/SavedJob.js                    # Database model for saved jobs
routes/savedJobs.js                   # API endpoints for save/unsave operations
routes/dashboard.js                   # Dashboard with saved jobs integration
utils/reminderScheduler.js            # Email reminder scheduler
SAVED_JOBS_FEATURE.md                 # Full feature documentation
SAVED_JOBS_QUICK_START.md            # This file
```

### Modified Files
```
server.js                             # Added routes for saved-jobs and dashboard
```

## Quick API Reference

### Save a Job
```
POST /api/saved-jobs
Headers: user-id: {userId}
Body: {
  jobId: "{jobId}",
  notes: "Optional notes",
  emailReminderEnabled: true,
  reminderFrequency: "weekly"  // daily, weekly, once
}
```

### Get Saved Jobs
```
GET /api/saved-jobs
Headers: user-id: {userId}
Returns: Array of saved jobs with job details
```

### Check if Job is Saved
```
GET /api/saved-jobs/check/{jobId}
Headers: user-id: {userId}
Returns: { isSaved: boolean, savedJob: object }
```

### Remove Saved Job
```
DELETE /api/saved-jobs/{savedJobId}
Headers: user-id: {userId}
```

### Update Saved Job (notes/reminders)
```
PUT /api/saved-jobs/{savedJobId}
Headers: user-id: {userId}
Body: {
  notes: "Updated notes",
  emailReminderEnabled: true,
  reminderFrequency: "daily"
}
```

### Get Dashboard (with Saved Jobs)
```
GET /api/dashboard
Headers: user-id: {userId}
Returns: {
  user: {...},
  savedJobs: { count: X, recentItems: [...] },
  applications: { recentItems: [...], stats: {...} },
  recommendedJobs: [...]
}
```

### Trigger Reminder Emails (Admin)
```
POST /api/saved-jobs/reminders/send
Body: { frequency: "daily" } // optional
Returns: { sent: X, failed: Y, total: Z }
```

## Setup Instructions

### 1. Database
The SavedJob model uses MongoDB (existing setup).
No migrations needed - documents will be created on first save.

### 2. Email Reminders (Optional)
For automatic scheduled reminders:

```bash
npm install node-cron
```

In your server startup code, add:
```javascript
const { initializeReminderScheduler } = require('./utils/reminderScheduler');
initializeReminderScheduler();
```

### 3. Frontend Integration

#### Display Save Button
```jsx
const [isSaved, setIsSaved] = useState(false);

async function checkAndLoad() {
  const res = await fetch(`/api/saved-jobs/check/${jobId}`, {
    headers: { 'user-id': userId }
  });
  const data = await res.json();
  setIsSaved(data.isSaved);
}

async function toggleSaveJob() {
  if (isSaved) {
    // Delete saved job
  } else {
    const res = await fetch('/api/saved-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId
      },
      body: JSON.stringify({ jobId })
    });
    if (res.ok) setIsSaved(true);
  }
}
```

#### Display Saved Jobs Section in Dashboard
```jsx
async function loadDashboard() {
  const res = await fetch('/api/dashboard', {
    headers: { 'user-id': userId }
  });
  const data = await res.json();
  // data.savedJobs.recentItems contains the saved jobs
  // data.savedJobs.count is total count
}
```

## Email Configuration

Reminders use existing email setup. Ensure these are in `.env`:
```
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password
EMAIL_FROM=noreply@zimpharmhub.com
FRONTEND_URL=https://zimpharmhub.com
```

## Reminder Frequency Options

- **daily**: Sends reminder every 24 hours
- **weekly**: Sends reminder every 7 days  
- **once**: Sends reminder only once

## Testing

### Save/Unsave
```bash
# Save job 123 with notes
curl -X POST http://localhost:5000/api/saved-jobs \
  -H "Content-Type: application/json" \
  -H "user-id: user-1" \
  -d '{
    "jobId": "123",
    "notes": "Interested in this position",
    "emailReminderEnabled": true,
    "reminderFrequency": "weekly"
  }'
```

### Check Saved Status
```bash
curl http://localhost:5000/api/saved-jobs/check/123 \
  -H "user-id: user-1"
```

### Get All Saved Jobs
```bash
curl http://localhost:5000/api/saved-jobs \
  -H "user-id: user-1"
```

### Get Dashboard
```bash
curl http://localhost:5000/api/dashboard \
  -H "user-id: user-1"
```

## Key Features

✅ Bookmark jobs for later  
✅ Add personal notes to saved jobs  
✅ Enable/disable email reminders  
✅ Choose reminder frequency (daily/weekly/once)  
✅ View all saved jobs in dashboard  
✅ Prevent duplicate saves  
✅ Track reminder history  
✅ Beautiful HTML email templates  

## Email Reminder Details

Reminders include:
- Job title, position, location
- Employment type and salary range
- User's personal notes
- Direct link to job listing
- Professional HTML formatting

## Troubleshooting

**Reminders not sending?**
- Check email is configured in `.env`
- Verify `emailReminderEnabled: true` on saved job
- Check MongoDB connection

**Saved job not appearing in dashboard?**
- Verify correct `userId` header
- Check saved job exists in database
- Ensure job still exists in Job collection

**Duplicate saves happening?**
- Clear invalid documents from database
- Unique index should prevent this

## Full Documentation

See `SAVED_JOBS_FEATURE.md` for complete documentation including:
- Database schema details
- All API endpoints with examples
- Advanced configuration
- Future enhancement ideas
