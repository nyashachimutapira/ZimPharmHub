# Saved Jobs API - Endpoint Reference

## Quick Endpoint List

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/saved-jobs` | Save/bookmark a job | ✅ |
| GET | `/api/saved-jobs` | Get all saved jobs | ✅ |
| GET | `/api/saved-jobs/:id` | Get specific saved job | ✅ |
| PUT | `/api/saved-jobs/:id` | Update notes/reminders | ✅ |
| DELETE | `/api/saved-jobs/:id` | Remove saved job | ✅ |
| GET | `/api/saved-jobs/check/:jobId` | Check if saved | ✅ |
| GET | `/api/saved-jobs/stats/count` | Count saved jobs | ✅ |
| POST | `/api/saved-jobs/reminders/send` | Send reminder emails | ⚠️ |
| GET | `/api/dashboard` | Get full dashboard | ✅ |
| GET | `/api/dashboard/saved-jobs-section` | Get saved jobs section | ✅ |

**Auth Legend**: ✅ = Requires user-id header, ⚠️ = Admin/server only

---

## Detailed Endpoint Reference

### 1. Save a Job (POST)
```
POST /api/saved-jobs
Content-Type: application/json
user-id: {userId}

Request Body:
{
  "jobId": "507f1f77bcf86cd799439012",
  "notes": "Optional personal notes",
  "emailReminderEnabled": true,
  "reminderFrequency": "weekly"
}

Response: 201 Created
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "jobId": "507f1f77bcf86cd799439012",
  "notes": "Optional personal notes",
  "emailReminderEnabled": true,
  "reminderFrequency": "weekly",
  "lastReminderSent": null,
  "savedAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z"
}

Errors:
- 400: Job already saved
- 400: Missing jobId
- 401: No user-id header
- 404: Job not found
- 500: Database error
```

### 2. Get All Saved Jobs (GET)
```
GET /api/saved-jobs
user-id: {userId}

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "jobId": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Senior Pharmacist",
      "position": "Pharmacist",
      "description": "...",
      "locationCity": "Harare",
      "locationProvince": "Harare",
      "locationAddress": "123 Main St",
      "employmentType": "Full-time",
      "salaryMin": 5000,
      "salaryMax": 7000,
      "salaryCurrency": "ZWL",
      "pharmacy": {
        "_id": "507f1f77bcf86cd799439014",
        "firstName": "ABC",
        "lastName": "Pharmacy",
        "email": "hr@abcpharmacy.com"
      },
      "requirements": ["Pharmacy Degree", "5+ years experience"],
      "responsibilities": ["Manage inventory", "Consult customers"],
      "applicationDeadline": "2024-02-15T00:00:00.000Z",
      "status": "active",
      "featured": true,
      "views": 45,
      "createdAt": "2024-01-10T08:00:00.000Z"
    },
    "notes": "Great company, good salary",
    "emailReminderEnabled": true,
    "reminderFrequency": "weekly",
    "lastReminderSent": "2024-01-14T08:15:00.000Z",
    "savedAt": "2024-01-15T10:30:00.000Z"
  }
]

Errors:
- 401: No user-id header
- 500: Database error
```

### 3. Get Specific Saved Job (GET)
```
GET /api/saved-jobs/{savedJobId}
user-id: {userId}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "jobId": { /* full job object */ },
  "notes": "Great company",
  "emailReminderEnabled": true,
  "reminderFrequency": "weekly",
  "lastReminderSent": "2024-01-14T08:15:00.000Z",
  "savedAt": "2024-01-15T10:30:00.000Z"
}

Errors:
- 401: No user-id header
- 403: Forbidden (accessing other's save)
- 404: Saved job not found
- 500: Database error
```

### 4. Update Saved Job (PUT)
```
PUT /api/saved-jobs/{savedJobId}
Content-Type: application/json
user-id: {userId}

Request Body (all optional):
{
  "notes": "Updated personal notes",
  "emailReminderEnabled": false,
  "reminderFrequency": "daily"
}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439013",
  "notes": "Updated personal notes",
  "emailReminderEnabled": false,
  "reminderFrequency": "daily",
  "lastReminderSent": "2024-01-14T08:15:00.000Z",
  "savedAt": "2024-01-15T10:30:00.000Z"
}

Errors:
- 400: Invalid frequency
- 401: No user-id header
- 403: Forbidden
- 404: Saved job not found
- 500: Database error
```

### 5. Delete Saved Job (DELETE)
```
DELETE /api/saved-jobs/{savedJobId}
user-id: {userId}

Response: 200 OK
{ "message": "Saved job removed" }

Errors:
- 401: No user-id header
- 403: Forbidden
- 404: Saved job not found
- 500: Database error
```

### 6. Check if Job is Saved (GET)
```
GET /api/saved-jobs/check/{jobId}
user-id: {userId}

Response: 200 OK
{
  "isSaved": true,
  "savedJob": {
    "_id": "507f1f77bcf86cd799439013",
    "jobId": "507f1f77bcf86cd799439012",
    "notes": "...",
    "emailReminderEnabled": true,
    "reminderFrequency": "weekly",
    "lastReminderSent": "2024-01-14T08:15:00.000Z",
    "savedAt": "2024-01-15T10:30:00.000Z"
  }
}

OR

{
  "isSaved": false,
  "savedJob": null
}

Errors:
- 401: No user-id header
- 500: Database error
```

### 7. Get Saved Jobs Count (GET)
```
GET /api/saved-jobs/stats/count
user-id: {userId}

Response: 200 OK
{ "count": 12 }

Errors:
- 401: No user-id header
- 500: Database error
```

### 8. Send Reminder Emails (POST)
```
POST /api/saved-jobs/reminders/send
Content-Type: application/json

Optional Request Body:
{
  "frequency": "daily"  // or "weekly" or "once"
}

Response: 200 OK
{
  "message": "Reminder emails sent",
  "sent": 25,
  "failed": 2,
  "skipped": 8,
  "total": 35
}

Errors:
- 500: Database error
- 500: Email service error

Note: No authentication required (use with API key or firewall rule)
```

### 9. Get Dashboard (GET)
```
GET /api/dashboard
user-id: {userId}

Response: 200 OK
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "userType": "job_seeker"
  },
  "savedJobs": {
    "count": 12,
    "recentItems": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "jobId": { /* full job object */ },
        "notes": "Great opportunity",
        "emailReminderEnabled": true,
        "reminderFrequency": "weekly",
        "savedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  "applications": {
    "recentItems": [
      {
        "id": "507f1f77bcf86cd799439015",
        "jobId": "507f1f77bcf86cd799439012",
        "job": { /* job details */ },
        "status": "pending",
        "appliedAt": "2024-01-12T14:20:00.000Z"
      }
    ],
    "stats": {
      "pending": 5,
      "reviewing": 2,
      "shortlisted": 1,
      "interview": 0,
      "accepted": 0,
      "rejected": 1
    },
    "total": 9
  },
  "recommendedJobs": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "title": "Pharmacist",
      "position": "Pharmacist",
      "locationCity": "Bulawayo",
      "createdAt": "2024-01-15T08:00:00.000Z"
    }
  ]
}

Errors:
- 401: No user-id header
- 404: User not found
- 500: Database error
```

### 10. Get Saved Jobs Section (GET)
```
GET /api/dashboard/saved-jobs-section
user-id: {userId}

Response: 200 OK
{
  "savedJobs": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "jobId": { /* full job with pharmacy */ },
      "notes": "Great opportunity",
      "emailReminderEnabled": true,
      "reminderFrequency": "weekly",
      "lastReminderSent": "2024-01-14T08:15:00.000Z",
      "savedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 12
}

Errors:
- 401: No user-id header
- 500: Database error
```

---

## Authentication & Headers

All endpoints except `/reminders/send` require:
```
Headers:
  user-id: {userId}  // MongoDB ObjectId as string
```

Example with curl:
```bash
curl -H "user-id: 507f1f77bcf86cd799439011" \
     http://localhost:5000/api/saved-jobs
```

---

## Reminder Frequencies

Valid values for `reminderFrequency`:
- `"daily"` - Sends reminder every 24 hours
- `"weekly"` - Sends reminder every 7 days
- `"once"` - Sends reminder only once

---

## Error Responses

All errors follow standard HTTP status codes:

### 400 Bad Request
```json
{
  "message": "Specific error description",
  "error": "Additional error details"
}
```

### 401 Unauthorized
```json
{
  "message": "User authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Saved job not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

---

## Testing with cURL

### Save a job
```bash
curl -X POST http://localhost:5000/api/saved-jobs \
  -H "Content-Type: application/json" \
  -H "user-id: 507f1f77bcf86cd799439011" \
  -d '{
    "jobId": "507f1f77bcf86cd799439012",
    "notes": "Great job",
    "emailReminderEnabled": true,
    "reminderFrequency": "weekly"
  }'
```

### Get all saved jobs
```bash
curl http://localhost:5000/api/saved-jobs \
  -H "user-id: 507f1f77bcf86cd799439011"
```

### Check if saved
```bash
curl http://localhost:5000/api/saved-jobs/check/507f1f77bcf86cd799439012 \
  -H "user-id: 507f1f77bcf86cd799439011"
```

### Update reminder settings
```bash
curl -X PUT http://localhost:5000/api/saved-jobs/507f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -H "user-id: 507f1f77bcf86cd799439011" \
  -d '{
    "emailReminderEnabled": true,
    "reminderFrequency": "daily"
  }'
```

### Remove saved job
```bash
curl -X DELETE http://localhost:5000/api/saved-jobs/507f1f77bcf86cd799439013 \
  -H "user-id: 507f1f77bcf86cd799439011"
```

### Get dashboard
```bash
curl http://localhost:5000/api/dashboard \
  -H "user-id: 507f1f77bcf86cd799439011"
```

### Send reminders (admin)
```bash
curl -X POST http://localhost:5000/api/saved-jobs/reminders/send \
  -H "Content-Type: application/json" \
  -d '{"frequency": "daily"}'
```

---

## Rate Limiting (Recommended)

Consider implementing rate limiting:
- Save: 10 per minute per user
- Get: 30 per minute per user
- Send reminders: 1 per hour (system-wide)

---

## Response Time Expectations

| Operation | Time |
|-----------|------|
| Save job | <100ms |
| Get all saved | <200ms |
| Get one saved | <50ms |
| Update | <100ms |
| Delete | <50ms |
| Check if saved | <50ms |
| Get count | <100ms |
| Get dashboard | <500ms |
| Send reminders | <5s (batch) |

---

## Database Indexes

For optimal performance, ensure these indexes exist:

```javascript
// In SavedJob collection:
db.savedjobs.createIndex({ userId: 1 })
db.savedjobs.createIndex({ userId: 1, jobId: 1 }, { unique: true })
db.savedjobs.createIndex({ emailReminderEnabled: 1 })
db.savedjobs.createIndex({ reminderFrequency: 1 })
db.savedjobs.createIndex({ lastReminderSent: 1 })
```

---

## Common Use Cases

### Use Case 1: Save a job from job detail page
```javascript
const response = await fetch('/api/saved-jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'user-id': userId
  },
  body: JSON.stringify({
    jobId: jobId,
    notes: userNotes,
    emailReminderEnabled: true,
    reminderFrequency: 'weekly'
  })
});
const savedJob = await response.json();
```

### Use Case 2: Check if job is saved before showing button
```javascript
const response = await fetch(
  `/api/saved-jobs/check/${jobId}`,
  { headers: { 'user-id': userId } }
);
const { isSaved } = await response.json();
// Show "Save" or "Saved" button based on isSaved
```

### Use Case 3: Display saved jobs in dashboard
```javascript
const response = await fetch('/api/dashboard', {
  headers: { 'user-id': userId }
});
const dashboard = await response.json();
const savedJobs = dashboard.savedJobs.recentItems;
```

### Use Case 4: Update reminder settings
```javascript
const response = await fetch(
  `/api/saved-jobs/${savedJobId}`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId
    },
    body: JSON.stringify({
      emailReminderEnabled: enabled,
      reminderFrequency: frequency
    })
  }
);
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0  
**Status**: Complete
