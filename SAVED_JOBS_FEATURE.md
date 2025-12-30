# Saved Jobs & Bookmarks Feature Implementation

## Overview
This feature enables job seekers to save jobs for later, add personal notes, and receive email reminders about their saved positions. This increases return visits and engagement.

## Features Implemented

### 1. Save/Bookmark Jobs
- Users can save jobs to their personal list
- Prevents duplicate saves with unique constraint on (userId, jobId)
- Includes optional personal notes for each saved job
- Save/unsave operations with instant feedback

### 2. Saved Jobs Dashboard Section
- Dedicated "Saved Jobs" section in user dashboard
- Displays all saved jobs with job details and pharmacy information
- Shows count of total saved jobs
- Recent saved jobs listed with newest first
- Quick access to job details and application button

### 3. Email Reminders for Saved Jobs
- Three reminder frequency options:
  - **Daily**: Sends reminder every 24 hours
  - **Weekly**: Sends reminder every 7 days
  - **Once**: Sends reminder only once after saving
- Users can enable/disable reminders per saved job
- Tracks last reminder sent to avoid duplicate emails
- Beautiful HTML email template with job details

### 4. Dashboard Integration
- Comprehensive dashboard showing:
  - User profile info
  - Saved jobs summary (count + recent items)
  - Application history with status breakdown
  - Recommended jobs based on saved preferences

## Database Schema

### SavedJob Model (MongoDB)
```javascript
{
  userId: ObjectId,           // Reference to User
  jobId: ObjectId,            // Reference to Job
  notes: String,              // User's personal notes
  emailReminderEnabled: Boolean,
  reminderFrequency: String,  // 'daily', 'weekly', 'once'
  lastReminderSent: Date,     // Track reminder history
  savedAt: Date,
  createdAt: Date
}
```

**Indexes:**
- Unique compound index on (userId, jobId) to prevent duplicate saves

## API Endpoints

### Save/Unsave Jobs
**POST** `/api/saved-jobs`
- Save a job for later
- Request body: `{ jobId, notes?, emailReminderEnabled?, reminderFrequency? }`
- Response: Newly created SavedJob document

**DELETE** `/api/saved-jobs/:savedJobId`
- Remove a saved job
- Returns: Success message

### Retrieve Saved Jobs
**GET** `/api/saved-jobs`
- Get all saved jobs for authenticated user
- Returns: Array of SavedJob documents with populated job details

**GET** `/api/saved-jobs/:savedJobId`
- Get specific saved job details
- Returns: Single SavedJob with full job and pharmacy info

**GET** `/api/saved-jobs/check/:jobId`
- Check if a specific job is saved by user
- Returns: `{ isSaved: boolean, savedJob: object|null }`

### Update Saved Job
**PUT** `/api/saved-jobs/:savedJobId`
- Update notes or reminder settings
- Request body: `{ notes?, emailReminderEnabled?, reminderFrequency? }`
- Returns: Updated SavedJob document

### Statistics
**GET** `/api/saved-jobs/stats/count`
- Get total count of saved jobs
- Returns: `{ count: number }`

### Send Reminders (Manual Trigger)
**POST** `/api/saved-jobs/reminders/send`
- Manually trigger reminder emails
- Optional request body: `{ frequency?: 'daily'|'weekly'|'once' }`
- Returns: `{ sent: number, failed: number, total: number }`

## Dashboard Endpoints

**GET** `/api/dashboard`
- Comprehensive dashboard data including saved jobs section
- Returns user info, saved jobs, applications, and recommended jobs

**GET** `/api/dashboard/saved-jobs-section`
- Get just the saved jobs section with all details
- Returns: `{ savedJobs: [...], count: number }`

## Backend Implementation Files

### New Models
- `models/SavedJob.js` - Mongoose schema for saved jobs

### New Routes
- `routes/savedJobs.js` - All saved job operations
- `routes/dashboard.js` - Dashboard endpoint with saved jobs integration

### Utilities
- `utils/reminderScheduler.js` - Scheduled reminder email job (requires node-cron)

### Server Configuration
- Updated `server.js` to register new routes

## Email Reminders Setup

### Option 1: Scheduled Reminders (Recommended)
Install node-cron for automatic scheduled reminders:
```bash
npm install node-cron
```

Then in your server initialization, call:
```javascript
const { initializeReminderScheduler } = require('./utils/reminderScheduler');
initializeReminderScheduler(); // Call once on app startup
```

This will automatically send reminders:
- **Daily**: Every day at 8:00 AM
- **Weekly**: Every Monday at 9:00 AM

### Option 2: Manual Trigger
Send reminders manually via the API:
```bash
# Send all pending reminders
POST /api/saved-jobs/reminders/send

# Send only daily reminders
POST /api/saved-jobs/reminders/send
Body: { frequency: 'daily' }
```

### Option 3: Cron Job (Production)
Set up an external cron job (AWS CloudWatch, GitHub Actions, etc.) to call the endpoint periodically:
```bash
# Daily at 8 AM
0 8 * * * curl -X POST http://api.zimpharmhub.local/api/saved-jobs/reminders/send

# Weekly on Monday at 9 AM
0 9 * * 1 curl -X POST http://api.zimpharmhub.local/api/saved-jobs/reminders/send
```

## Frontend Integration Guide

### Key UI Components to Build

#### 1. Save Job Button
```jsx
<button onClick={handleSaveJob}>
  {isSaved ? '❤️ Saved' : '🤍 Save'}
</button>
```

#### 2. Saved Jobs Section in Dashboard
```jsx
<section className="saved-jobs">
  <h2>Saved Jobs ({count})</h2>
  <div className="job-list">
    {savedJobs.map(saved => (
      <JobCard 
        job={saved.jobId}
        notes={saved.notes}
        reminderEnabled={saved.emailReminderEnabled}
        onUpdate={handleUpdate}
        onRemove={handleRemove}
      />
    ))}
  </div>
</section>
```

#### 3. Reminder Toggle
```jsx
<label>
  <input 
    type="checkbox" 
    checked={reminderEnabled}
    onChange={handleReminderToggle}
  />
  Email me reminders
  <select onChange={handleFrequencyChange} value={frequency}>
    <option value="daily">Daily</option>
    <option value="weekly">Weekly</option>
    <option value="once">Once</option>
  </select>
</label>
```

### API Integration Examples

#### Check if job is saved
```javascript
async function checkJobSaved(jobId) {
  const response = await fetch(`/api/saved-jobs/check/${jobId}`, {
    headers: { 'user-id': userId }
  });
  return response.json(); // { isSaved, savedJob }
}
```

#### Save a job
```javascript
async function saveJob(jobId, notes = '') {
  const response = await fetch('/api/saved-jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId
    },
    body: JSON.stringify({
      jobId,
      notes,
      emailReminderEnabled: false
    })
  });
  return response.json();
}
```

#### Get all saved jobs
```javascript
async function getSavedJobs() {
  const response = await fetch('/api/saved-jobs', {
    headers: { 'user-id': userId }
  });
  return response.json(); // Array of saved jobs
}
```

#### Update reminder settings
```javascript
async function updateReminder(savedJobId, enabled, frequency) {
  const response = await fetch(`/api/saved-jobs/${savedJobId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId
    },
    body: JSON.stringify({
      emailReminderEnabled: enabled,
      reminderFrequency: frequency
    })
  });
  return response.json();
}
```

#### Get dashboard with saved jobs
```javascript
async function getDashboard() {
  const response = await fetch('/api/dashboard', {
    headers: { 'user-id': userId }
  });
  return response.json(); // { user, savedJobs, applications, recommendedJobs }
}
```

## Configuration

### Email Template Customization
Edit the HTML email template in `utils/reminderScheduler.js` to match your branding.

### Reminder Timing
Modify cron schedules in `utils/reminderScheduler.js`:
- `'0 8 * * *'` - Daily time (8 AM)
- `'0 9 * * 1'` - Weekly time (Monday 9 AM)

### Email Sender
Uses existing email configuration in `.env`:
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `FRONTEND_URL` (for job links in emails)

## Business Impact

✅ **Increased Return Visits**: Users revisit dashboard to check saved jobs
✅ **Better Engagement**: Email reminders prompt action on job opportunities
✅ **Reduced Job Loss**: Users don't lose track of interesting positions
✅ **Personal Connection**: Notes feature helps users remember why they saved
✅ **Job Application Conversion**: Saved jobs have higher application rates

## Testing

### Manual Testing Checklist
- [ ] Save a job from job detail page
- [ ] Verify duplicate save prevention
- [ ] Update saved job notes
- [ ] Enable/disable email reminders
- [ ] Change reminder frequency
- [ ] Remove saved job
- [ ] View saved jobs on dashboard
- [ ] Test manual reminder email trigger
- [ ] Verify email content and formatting
- [ ] Check saved jobs count updates

### API Testing
```bash
# Save a job
curl -X POST http://localhost:5000/api/saved-jobs \
  -H "Content-Type: application/json" \
  -H "user-id: {userId}" \
  -d '{"jobId": "{jobId}", "notes": "Good opportunity"}'

# Get all saved jobs
curl http://localhost:5000/api/saved-jobs \
  -H "user-id: {userId}"

# Send reminder emails
curl -X POST http://localhost:5000/api/saved-jobs/reminders/send
```

## Future Enhancements

- [ ] Bulk operations (archive multiple saved jobs, batch delete)
- [ ] Search/filter saved jobs by criteria
- [ ] Export saved jobs to PDF
- [ ] Share saved jobs with connections
- [ ] Analytics: Track which saved jobs get applied to most
- [ ] Push notifications in addition to emails
- [ ] Saved job collections/folders for organization
- [ ] Smart recommendations based on saved job patterns

## Troubleshooting

### Reminders not sending?
1. Check email configuration in `.env`
2. Verify `emailReminderEnabled: true` on saved job
3. Check `lastReminderSent` timestamp
4. Ensure sufficient time has passed since last reminder

### Duplicate saves occurring?
1. Check database unique index: `db.savedjobs.getIndexes()`
2. Verify index on (userId, jobId)

### Jobs not populating in dashboard?
1. Check MongoDB connection is active
2. Verify SavedJob documents exist in database
3. Check userId header is being sent correctly

## Related Files
- `models/SavedJob.js` - Data model
- `routes/savedJobs.js` - API endpoints
- `routes/dashboard.js` - Dashboard route
- `utils/reminderScheduler.js` - Email scheduling
- `utils/mailer.js` - Email service (existing)
- `server.js` - Main app configuration
