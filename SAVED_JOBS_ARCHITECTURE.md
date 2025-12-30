# Saved Jobs Feature - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │  Job Detail Page │  │  Dashboard Page  │  │ Saved Jobs   │   │
│  │  - Save Button   │  │  - Saved Jobs    │  │ - List View  │   │
│  │  - Check Status  │  │    Section       │  │ - Edit Notes │   │
│  │  - Add Notes     │  │  - Recommended   │  │ - Reminders  │   │
│  │  - Set Reminders │  │    Jobs          │  │ - Delete Job │   │
│  └──────────────────┘  └──────────────────┘  └──────────────┘   │
│           │                    │                     │           │
└─────────────────────────────────────────────────────────────────┘
             │                    │                     │
             └────────────────────┼─────────────────────┘
                          │
                   ╔══════╩═══════╗
                   ║              ║
              HTTP API Calls   WebSocket
                   ║              ║
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           API ROUTES (routes/)                          │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  savedJobs.js          dashboard.js                     │    │
│  │  ├─ POST /              ├─ GET /                        │    │
│  │  ├─ GET /               ├─ GET /saved-jobs-section      │    │
│  │  ├─ GET /:id                                            │    │
│  │  ├─ PUT /:id            Routes Handler:                 │    │
│  │  ├─ DELETE /:id         ├─ Validate userId             │    │
│  │  ├─ GET /check/:jobId   ├─ Query SavedJob model        │    │
│  │  ├─ GET /stats/count    ├─ Populate job details        │    │
│  │  └─ POST /reminders/send├─ Enrich pharmacy info        │    │
│  │                         └─ Return formatted response     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                    ╔═══════╩═════════╗                          │
│                    │                 │                          │
│              ┌─────▼────────┐  ┌────▼──────────┐               │
│              │  DATABASE    │  │  EMAIL SERVICE │               │
│              │  (MongoDB)   │  │  (nodemailer)  │               │
│              └──────────────┘  └────────────────┘               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
             │                         │
        ╔════╩════╗               ╔════╩════╗
        ║          ║               ║          ║
┌───────▼──────┐ ┌─▼─────────┐  ┌─▼──────┐ ┌─▼──────┐
│ SavedJob     │ │ User      │  │ Job    │ │ SMTP   │
│ Documents    │ │ Documents │  │ Records│ │ Server │
│              │ │           │  │        │ │        │
│ - userId     │ │ ✓ Linked  │  │ ✓ Linked           │
│ - jobId      │ │ - profile │  │ - title            │
│ - notes      │ │ - email   │  │ - location         │
│ - reminders  │ │ - prefs   │  │ - pharmacy         │
│ - lastSent   │ │           │  │ - salary           │
└──────────────┘ └───────────┘  └────────┘ └────────┘
```

## Data Flow Diagrams

### Save Job Flow
```
User Click "Save"
         │
         ▼
Frontend: Check if saved
         │
         ├─ YES ─▶ Show "Already Saved"
         │
         └─ NO ─▶ POST /api/saved-jobs
                  {jobId, notes?, reminderEnabled?, frequency?}
                        │
                        ▼
                  Validate jobId exists
                        │
                        ▼
                  Check for duplicate (userId, jobId)
                        │
                        ├─ EXISTS ─▶ Return 400 "Already saved"
                        │
                        └─ NEW ─▶ Create SavedJob document
                                  {
                                    userId,
                                    jobId,
                                    notes,
                                    emailReminderEnabled,
                                    reminderFrequency,
                                    savedAt: now()
                                  }
                                       │
                                       ▼
                                  Return 201 + savedJob
                                       │
                                       ▼
                                  Frontend: Update UI
                                  - Show "❤️ Saved"
                                  - Update count
                                  - Show in dashboard
```

### View Dashboard Flow
```
User navigates to Dashboard
         │
         ▼
Frontend: GET /api/dashboard
         │
         ▼
Backend: Fetch dashboard data
├─ Query User by ID
├─ Count SavedJobs where userId
├─ Get 5 most recent SavedJobs
│  └─ Populate job details
│  └─ Fetch pharmacy info
├─ Get 5 recent JobApplications
├─ Count applications by status
└─ Get recommended jobs (based on last saved)
         │
         ▼
Return aggregated response:
{
  user: {...},
  savedJobs: {
    count: 12,
    recentItems: [
      {
        _id, userId, jobId,
        jobId: { title, location, pharmacy, ... },
        notes, emailReminderEnabled,
        reminderFrequency, lastReminderSent
      }, ...
    ]
  },
  applications: {...},
  recommendedJobs: [...]
}
         │
         ▼
Frontend: Render Saved Jobs Section
├─ Display count "You have 12 saved jobs"
├─ List recent 5 jobs
├─ Show "View All" link
└─ Display reminder status for each
```

### Email Reminder Flow
```
Scheduled Time Reached (8 AM daily or 9 AM weekly)
         │
         ▼
Scheduler: Call sendSavedJobReminders('daily')
         │
         ▼
Query SavedJobs where:
├─ emailReminderEnabled = true
├─ reminderFrequency = 'daily'
└─ lastReminderSent < 24 hours ago
         │
         ▼
For each matching SavedJob:
├─ Fetch User and Job details
├─ Check time since last reminder
│  ├─ If too soon ─▶ Skip
│  └─ If ready ─▶ Continue
├─ Generate HTML email
├─ Send via nodemailer (SMTP)
└─ Update lastReminderSent timestamp
         │
         ▼
User receives email:
┌─────────────────────────────────┐
│ Job Reminder                    │
├─────────────────────────────────┤
│ Hi John,                        │
│                                 │
│ You saved: Pharmacist           │
│ Location: Harare                │
│ Type: Full-time                 │
│ Salary: 5000-7000 ZWL           │
│                                 │
│ Your notes: "Seems great!"      │
│                                 │
│ [View Job] [Unsubscribe]       │
└─────────────────────────────────┘
```

## Component Integration

### SavedJob Model Integration
```
SavedJob ←→ User (userId reference)
         ├─ Count saved jobs per user
         ├─ Fetch user preferences
         └─ Send reminder emails

SavedJob ←→ Job (jobId reference)
         ├─ Validate job exists
         ├─ Fetch job details for display
         ├─ Track job popularity
         └─ Update when job changes
```

### Database Schema Relationships
```
┌──────────────┐         ┌─────────────┐         ┌──────────────┐
│    User      │         │  SavedJob   │         │     Job      │
├──────────────┤         ├─────────────┤         ├──────────────┤
│ _id          │◄────────┤ userId      │         │ _id          │
│ email        │         │ jobId       ├────────►│ title        │
│ firstName    │         │ notes       │         │ location     │
│ ...          │         │ reminder... │         │ pharmacy     │
└──────────────┘         │ lastSent    │         │ ...          │
                         │ savedAt     │         └──────────────┘
                         │ createdAt   │
                         └─────────────┘
                         
                    Unique Index:
                    (userId, jobId)
                    prevents duplicates
```

## Request/Response Flow

### Save Job Request
```json
POST /api/saved-jobs
Headers: {
  "Content-Type": "application/json",
  "user-id": "507f1f77bcf86cd799439011"
}
Body: {
  "jobId": "507f1f77bcf86cd799439012",
  "notes": "Great company, good salary",
  "emailReminderEnabled": true,
  "reminderFrequency": "weekly"
}

Response: 201 Created
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "jobId": "507f1f77bcf86cd799439012",
  "notes": "Great company, good salary",
  "emailReminderEnabled": true,
  "reminderFrequency": "weekly",
  "lastReminderSent": null,
  "savedAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Get Saved Jobs Request
```json
GET /api/saved-jobs
Headers: { "user-id": "507f1f77bcf86cd799439011" }

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "jobId": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Senior Pharmacist",
      "position": "Pharmacist",
      "locationCity": "Harare",
      "locationProvince": "Harare",
      "employmentType": "Full-time",
      "salaryMin": 5000,
      "salaryMax": 7000,
      "pharmacy": {
        "_id": "507f1f77bcf86cd799439014",
        "firstName": "ABC",
        "lastName": "Pharmacy",
        "email": "hr@abcpharmacy.com"
      },
      "description": "...",
      "requirements": ["..."],
      "createdAt": "2024-01-10T08:00:00.000Z"
    },
    "notes": "Great company, good salary",
    "emailReminderEnabled": true,
    "reminderFrequency": "weekly",
    "lastReminderSent": null,
    "savedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

## Email Reminder Template Flow

```
reminderScheduler.js:
  ├─ Query SavedJobs with reminders enabled
  ├─ Check if reminder should be sent (frequency logic)
  ├─ Build HTML template
  │  ├─ User first name
  │  ├─ Job title, position, location
  │  ├─ Employment type, salary
  │  ├─ User's personal notes
  │  └─ "View Job" link to frontend
  ├─ Send via mailer.js
  │  └─ nodemailer → SMTP server
  ├─ Update lastReminderSent
  └─ Log result (success/failure)
```

## Error Handling

```
SaveJob Errors:
├─ 401: No user-id header
├─ 400: Missing jobId
├─ 404: Job not found
├─ 400: Job already saved (duplicate)
└─ 500: Database error

Reminder Errors:
├─ Missing user email ─▶ Skip
├─ Missing job data ─▶ Skip
├─ SMTP failure ─▶ Log but continue
├─ MongoDB error ─▶ Log and return error
└─ Schedule error ─▶ Log warning
```

## Scalability Considerations

### Database Indexing
```javascript
SavedJob:
  - Index on userId (for queries)
  - Index on userId + jobId (unique, prevents duplicates)
  - Index on emailReminderEnabled (for reminder queries)
  - Index on reminderFrequency (for reminder filtering)
  - Index on lastReminderSent (for reminder scheduling)
```

### Performance Optimizations
```
Query Optimization:
├─ Populate only needed fields
├─ Limit results (e.g., 5 recent jobs)
├─ Use database indexes
└─ Cache user preferences

Email Batching:
├─ Send in batches (not individually)
├─ Rate limit to avoid SMTP issues
├─ Queue failed sends for retry
└─ Log all email attempts
```

### Load Distribution
```
High Traffic:
├─ Read replicas for queries
├─ Write to primary database
├─ Queue reminder emails
├─ Cache job details (Redis)
└─ Async email sending
```

## Security Considerations

```
Authentication:
├─ Verify user-id header matches request
├─ Prevent accessing others' saved jobs
├─ Validate jobId exists before saving

Authorization:
├─ Only users can see their own saved jobs
├─ Only pharmacy owners can see job details

Data Validation:
├─ Validate jobId format
├─ Limit notes length (e.g., 500 chars)
├─ Validate reminder frequency enum
└─ Sanitize inputs before saving
```

## Monitoring & Logging

```
Metrics to Track:
├─ Total saved jobs created
├─ Saves per user (distribution)
├─ Reminders sent (daily/weekly)
├─ Reminder email failures
├─ Save-to-apply conversion rate
└─ Most saved jobs (trending)

Logs:
├─ Save job success/failure
├─ Reminder trigger events
├─ Email send status
├─ Database errors
└─ Performance metrics
```
