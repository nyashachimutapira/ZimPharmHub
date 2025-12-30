# Job Alerts API - Complete Endpoint Reference

## Endpoint Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/job-alerts` | Create new alert | ✅ |
| GET | `/api/job-alerts` | List all alerts | ✅ |
| GET | `/api/job-alerts/:id` | Get specific alert | ✅ |
| PUT | `/api/job-alerts/:id` | Update alert | ✅ |
| DELETE | `/api/job-alerts/:id` | Delete alert | ✅ |
| POST | `/api/job-alerts/:id/check-matches` | Check matching jobs | ✅ |
| POST | `/api/job-alerts/:id/send-test` | Send test notification | ✅ |
| GET | `/api/job-alerts/:id/matches` | Get matches count | ✅ |

---

## 1. Create Job Alert (POST)

```
POST /api/job-alerts
Content-Type: application/json
user-id: {userId}

Request Body:
{
  "name": "Senior Pharmacist in Harare",
  "description": "Looking for senior positions in Zimbabwe's capital",
  "positions": ["Pharmacist"],
  "locations": ["Harare"],
  "salaryMin": 5000,
  "salaryMax": 15000,
  "employmentTypes": ["Full-time"],
  "notificationMethod": "email",
  "frequency": "daily",
  "digestTime": "09:00",
  "digestDay": "Monday"
}

Response: 201 Created
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439011",
  "name": "Senior Pharmacist in Harare",
  "description": "Looking for senior positions...",
  "isActive": true,
  "positions": ["Pharmacist"],
  "locations": ["Harare"],
  "salaryMin": 5000,
  "salaryMax": 15000,
  "employmentTypes": ["Full-time"],
  "notificationMethod": "email",
  "frequency": "daily",
  "digestTime": "09:00",
  "digestDay": "Monday",
  "matchingJobs": [],
  "lastDigestSent": null,
  "lastJobMatched": null,
  "totalMatches": 0,
  "totalNotificationsSent": 0,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}

Errors:
- 400: Alert name already exists for user
- 400: Missing required field
- 401: No user-id header
- 500: Database error
```

### Request Field Reference

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| name | string | ✅ | - | Unique per user |
| description | string | ❌ | - | Optional description |
| positions | array | ❌ | [] | Job positions to match |
| locations | array | ❌ | [] | Cities/locations to match |
| salaryMin | number | ❌ | null | Minimum salary |
| salaryMax | number | ❌ | null | Maximum salary |
| employmentTypes | array | ❌ | [] | Full-time, Part-time, etc |
| notificationMethod | string | ❌ | email | email or sms |
| frequency | string | ❌ | daily | instant, daily, or weekly |
| digestTime | string | ❌ | 09:00 | HH:mm format |
| digestDay | string | ❌ | - | For weekly: Mon-Sun |

---

## 2. Get All Job Alerts (GET)

```
GET /api/job-alerts?activeOnly=true
user-id: {userId}

Query Parameters:
  - activeOnly: true/false (default: false)

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Senior Pharmacist in Harare",
    "positions": ["Pharmacist"],
    "locations": ["Harare"],
    "frequency": "daily",
    "isActive": true,
    "totalMatches": 5,
    "lastJobMatched": "2024-01-15T08:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439021",
    "name": "Any Pharmacy Job",
    "positions": [],
    "locations": [],
    "frequency": "weekly",
    "isActive": true,
    "totalMatches": 12,
    "lastJobMatched": "2024-01-14T14:20:00.000Z",
    "createdAt": "2024-01-10T09:00:00.000Z"
  }
]

Errors:
- 401: No user-id header
- 500: Database error
```

---

## 3. Get Specific Job Alert (GET)

```
GET /api/job-alerts/{alertId}
user-id: {userId}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439011",
  "name": "Senior Pharmacist in Harare",
  "description": "Looking for senior positions...",
  "isActive": true,
  "positions": ["Pharmacist"],
  "locations": ["Harare"],
  "salaryMin": 5000,
  "salaryMax": 15000,
  "employmentTypes": ["Full-time"],
  "notificationMethod": "email",
  "frequency": "daily",
  "digestTime": "09:00",
  "digestDay": null,
  "matchingJobs": [
    {
      "jobId": "507f1f77bcf86cd799439012",
      "matchedAt": "2024-01-15T08:30:00.000Z",
      "notificationSent": true,
      "sentAt": "2024-01-15T08:35:00.000Z"
    }
  ],
  "lastDigestSent": "2024-01-15T09:00:00.000Z",
  "lastJobMatched": "2024-01-15T08:30:00.000Z",
  "totalMatches": 5,
  "totalNotificationsSent": 5,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}

Errors:
- 401: No user-id header
- 403: Forbidden (accessing other's alert)
- 404: Alert not found
- 500: Database error
```

---

## 4. Update Job Alert (PUT)

```
PUT /api/job-alerts/{alertId}
Content-Type: application/json
user-id: {userId}

Request Body (all optional):
{
  "name": "Updated Alert Name",
  "description": "Updated description",
  "positions": ["Pharmacist", "Pharmacy Manager"],
  "locations": ["Harare", "Bulawayo"],
  "salaryMin": 6000,
  "salaryMax": 20000,
  "employmentTypes": ["Full-time", "Contract"],
  "frequency": "weekly",
  "digestDay": "Monday",
  "digestTime": "10:00",
  "isActive": false
}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439020",
  "name": "Updated Alert Name",
  "positions": ["Pharmacist", "Pharmacy Manager"],
  "locations": ["Harare", "Bulawayo"],
  "frequency": "weekly",
  "digestDay": "Monday",
  "digestTime": "10:00",
  "isActive": false,
  "updatedAt": "2024-01-15T11:00:00.000Z"
}

Errors:
- 400: Invalid data
- 401: No user-id header
- 403: Forbidden
- 404: Alert not found
- 500: Database error
```

---

## 5. Delete Job Alert (DELETE)

```
DELETE /api/job-alerts/{alertId}
user-id: {userId}

Response: 200 OK
{
  "message": "Job alert deleted"
}

Errors:
- 401: No user-id header
- 403: Forbidden
- 404: Alert not found
- 500: Database error
```

---

## 6. Check Matching Jobs (POST)

```
POST /api/job-alerts/{alertId}/check-matches
user-id: {userId}

Response: 200 OK
{
  "totalMatches": 8,
  "newMatches": 3,
  "matchingJobs": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Senior Pharmacist",
      "position": "Pharmacist",
      "location": "Harare Harare",
      "salary": "5000-7000"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "title": "Pharmacist",
      "position": "Pharmacist",
      "location": "Harare",
      "salary": "6000-8000"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "title": "Lead Pharmacist",
      "position": "Pharmacist",
      "location": "Harare",
      "salary": "7000-10000"
    }
  ]
}

Errors:
- 401: No user-id header
- 403: Forbidden
- 404: Alert not found
- 500: Database error
```

---

## 7. Send Test Notification (POST)

```
POST /api/job-alerts/{alertId}/send-test
user-id: {userId}

Response: 200 OK
{
  "message": "Test email sent",
  "jobsPreview": 3
}

Response if no matches:
400 Bad Request
{
  "message": "No matching jobs found for preview"
}

Errors:
- 401: No user-id header
- 403: Forbidden
- 404: Alert not found or user not found
- 500: Database/email error
```

**Email Content Sample:**
```
Subject: [TEST] Job Alert: Senior Pharmacist in Harare

Body:
Hi John,

Here's a preview of your "Senior Pharmacist in Harare" job alert 
with matching opportunities:

Matching Jobs (3 shown):
- Senior Pharmacist (Pharmacist) - Harare
- Pharmacist (Pharmacist) - Harare  
- Lead Pharmacist (Pharmacist) - Harare

[Browse All Jobs Button]

This is a test email. Your actual alerts will be sent based on 
your notification preferences.
```

---

## 8. Get Matches Count (GET)

```
GET /api/job-alerts/{alertId}/matches
user-id: {userId}

Response: 200 OK
{
  "alertId": "507f1f77bcf86cd799439020",
  "alertName": "Senior Pharmacist in Harare",
  "totalMatches": 8,
  "matchedAt": "2024-01-15T14:30:00.000Z",
  "recentMatches": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Senior Pharmacist",
      "position": "Pharmacist",
      "location": "Harare"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "title": "Pharmacist",
      "position": "Pharmacist",
      "location": "Harare"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "title": "Lead Pharmacist",
      "position": "Pharmacist",
      "location": "Harare"
    },
    {
      "id": "507f1f77bcf86cd799439015",
      "title": "Senior Pharmacist",
      "position": "Pharmacist",
      "location": "Harare"
    },
    {
      "id": "507f1f77bcf86cd799439016",
      "title": "Pharmacist Manager",
      "position": "Pharmacist",
      "location": "Harare"
    }
  ]
}

Errors:
- 401: No user-id header
- 403: Forbidden
- 404: Alert not found
- 500: Database error
```

---

## Notification Email Templates

### Instant Notification
```
Subject: [Alert: Senior Pharmacist] 2 New Matching Jobs

Body: 
Hi John,

We found 2 new job(s) matching your alert criteria:

[Job Cards with details]

[Browse All Jobs Button]

You received this email because you enabled job alerts.
```

### Daily Digest
```
Subject: Daily Job Alert Digest: Senior Pharmacist (5 jobs)

Body:
Hi John,

Here's your daily digest of matching job opportunities:

5 Jobs Found | Total Matches: 12

[Job Cards]

[View All Jobs Button]

You received this daily digest because you have job alerts enabled.
```

### Weekly Digest
```
Subject: Weekly Job Alert Digest: Senior Pharmacist (12 jobs)

Body:
Hi John,

Here's your weekly digest of matching job opportunities:

12 Jobs Found | Total Matches: 45

[Job Cards]

[View All Jobs Button]

You received this weekly digest because you have job alerts enabled.
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (missing/invalid data) |
| 401 | Unauthorized (missing user-id) |
| 403 | Forbidden (accessing other's data) |
| 404 | Not Found |
| 500 | Server Error |

---

## Testing with cURL

### Create Alert
```bash
curl -X POST http://localhost:5000/api/job-alerts \
  -H "Content-Type: application/json" \
  -H "user-id: 507f1f77bcf86cd799439011" \
  -d '{
    "name": "Pharmacist in Harare",
    "positions": ["Pharmacist"],
    "locations": ["Harare"],
    "frequency": "daily",
    "digestTime": "09:00"
  }'
```

### Get All Alerts
```bash
curl http://localhost:5000/api/job-alerts \
  -H "user-id: 507f1f77bcf86cd799439011"
```

### Get Specific Alert
```bash
curl http://localhost:5000/api/job-alerts/507f1f77bcf86cd799439020 \
  -H "user-id: 507f1f77bcf86cd799439011"
```

### Update Alert
```bash
curl -X PUT http://localhost:5000/api/job-alerts/507f1f77bcf86cd799439020 \
  -H "Content-Type: application/json" \
  -H "user-id: 507f1f77bcf86cd799439011" \
  -d '{
    "frequency": "weekly",
    "digestDay": "Monday"
  }'
```

### Delete Alert
```bash
curl -X DELETE http://localhost:5000/api/job-alerts/507f1f77bcf86cd799439020 \
  -H "user-id: 507f1f77bcf86cd799439011"
```

### Check Matches
```bash
curl -X POST http://localhost:5000/api/job-alerts/507f1f77bcf86cd799439020/check-matches \
  -H "user-id: 507f1f77bcf86cd799439011"
```

### Send Test
```bash
curl -X POST http://localhost:5000/api/job-alerts/507f1f77bcf86cd799439020/send-test \
  -H "user-id: 507f1f77bcf86cd799439011"
```

### Get Matches
```bash
curl http://localhost:5000/api/job-alerts/507f1f77bcf86cd799439020/matches \
  -H "user-id: 507f1f77bcf86cd799439011"
```

---

## Common Use Cases

### Create Simple Alert
```json
{
  "name": "Any pharmacy job",
  "positions": ["Pharmacist", "Dispensary Assistant"],
  "frequency": "daily"
}
```

### Location-Based Alert
```json
{
  "name": "Jobs in Bulawayo",
  "locations": ["Bulawayo"],
  "frequency": "weekly",
  "digestDay": "Monday",
  "digestTime": "10:00"
}
```

### Salary-Focused Alert
```json
{
  "name": "High-paying pharmacy jobs",
  "salaryMin": 10000,
  "salaryMax": 25000,
  "frequency": "instant"
}
```

### Specific Role Alert
```json
{
  "name": "Pharmacy Manager positions",
  "positions": ["Pharmacy Manager"],
  "employmentTypes": ["Full-time"],
  "frequency": "daily",
  "digestTime": "09:00"
}
```

---

**Last Updated:** 2024-01-15  
**Version:** 1.0  
**Status:** Complete
