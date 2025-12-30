# Job Alerts & Notifications - Quick Start

## What's Job Alerts?

Custom job search filters that automatically notify users when matching jobs are posted. Users set criteria (position, location, salary) and receive notifications instantly, daily, or weekly.

## Key Features

✅ **Custom Criteria** - Position, location, salary range, employment type  
✅ **Three Notification Types** - Instant, daily digest, weekly digest  
✅ **Multiple Methods** - Email (SMS ready for expansion)  
✅ **Smart Matching** - Auto-match new jobs to alert criteria  
✅ **Digest Emails** - Accumulated daily/weekly digests  
✅ **Test Notifications** - Preview alerts before activating  

## Quick API Reference

### Create Job Alert
```
POST /api/job-alerts
Headers: user-id: {userId}
Body: {
  "name": "Pharmacist in Harare",
  "description": "Optional description",
  "positions": ["Pharmacist"],
  "locations": ["Harare"],
  "salaryMin": 5000,
  "salaryMax": 10000,
  "employmentTypes": ["Full-time"],
  "notificationMethod": "email",
  "frequency": "daily",
  "digestTime": "09:00"
}
```

### Get All Alerts
```
GET /api/job-alerts
Headers: user-id: {userId}
```

### Get Specific Alert
```
GET /api/job-alerts/{alertId}
Headers: user-id: {userId}
```

### Update Alert
```
PUT /api/job-alerts/{alertId}
Headers: user-id: {userId}
Body: { ...fields to update... }
```

### Delete Alert
```
DELETE /api/job-alerts/{alertId}
Headers: user-id: {userId}
```

### Check Matching Jobs
```
POST /api/job-alerts/{alertId}/check-matches
Headers: user-id: {userId}
```

### Send Test Notification
```
POST /api/job-alerts/{alertId}/send-test
Headers: user-id: {userId}
```

### Get Matches Count
```
GET /api/job-alerts/{alertId}/matches
Headers: user-id: {userId}
```

## Notification Frequencies

| Frequency | Description | Use Case |
|-----------|-------------|----------|
| **instant** | Immediate email on match | Hot opportunities |
| **daily** | Once per day digest at set time | Monitor frequently |
| **weekly** | Weekly digest on set day/time | Relaxed search |

## Setup Steps

### 1. Database
MongoDB collection created automatically. No setup needed.

### 2. Email Configuration
Ensure `.env` has email settings:
```
EMAIL_HOST=your-smtp-server
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password
EMAIL_FROM=noreply@zimpharmhub.com
FRONTEND_URL=https://zimpharmhub.com
```

### 3. Scheduler (Optional)
For automatic digest emails, install and initialize cron:
```bash
npm install node-cron
```

In server startup:
```javascript
const { initializeAlertScheduler } = require('./utils/alertNotificationService');
initializeAlertScheduler(); // Call once
```

## Testing

### Create Alert
```bash
curl -X POST http://localhost:5000/api/job-alerts \
  -H "Content-Type: application/json" \
  -H "user-id: user-1" \
  -d '{
    "name": "Pharmacist in Harare",
    "positions": ["Pharmacist"],
    "locations": ["Harare"],
    "frequency": "daily"
  }'
```

### Get Alerts
```bash
curl http://localhost:5000/api/job-alerts \
  -H "user-id: user-1"
```

### Check Matches
```bash
curl -X POST http://localhost:5000/api/job-alerts/{alertId}/check-matches \
  -H "user-id: user-1"
```

### Send Test Email
```bash
curl -X POST http://localhost:5000/api/job-alerts/{alertId}/send-test \
  -H "user-id: user-1"
```

## Alert Fields Explained

### Search Criteria
- **positions** - Array of job positions (Pharmacist, Dispensary Assistant, etc.)
- **locations** - Array of cities/locations (Harare, Bulawayo, etc.)
- **salaryMin/salaryMax** - Salary range in currency units
- **employmentTypes** - Full-time, Part-time, Contract, Temporary

### Notification Settings
- **frequency** - How often to notify: instant, daily, weekly
- **notificationMethod** - Email or SMS
- **digestTime** - Time for digest emails (HH:mm format, e.g., "09:00")
- **digestDay** - Day for weekly digests (Monday, Tuesday, etc.)

### Tracking
- **totalMatches** - Count of all matching jobs found
- **lastJobMatched** - When last job was matched
- **totalNotificationsSent** - Count of notifications sent

## Frontend Integration

### Show Create Alert Button
```jsx
const createAlert = async (criteria) => {
  const res = await fetch('/api/job-alerts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId
    },
    body: JSON.stringify({
      name: criteria.name,
      positions: criteria.positions,
      locations: criteria.locations,
      salaryMin: criteria.salaryMin,
      salaryMax: criteria.salaryMax,
      frequency: 'daily'
    })
  });
  return res.json();
};
```

### List User's Alerts
```jsx
const loadAlerts = async () => {
  const res = await fetch('/api/job-alerts', {
    headers: { 'user-id': userId }
  });
  return res.json(); // Array of alerts
};
```

### Check Matches
```jsx
const checkMatches = async (alertId) => {
  const res = await fetch(
    `/api/job-alerts/${alertId}/matches`,
    { headers: { 'user-id': userId } }
  );
  return res.json(); // { totalMatches, recentMatches }
};
```

### Send Test
```jsx
const sendTestEmail = async (alertId) => {
  const res = await fetch(
    `/api/job-alerts/${alertId}/send-test`,
    {
      method: 'POST',
      headers: { 'user-id': userId }
    }
  );
  return res.json();
};
```

## Troubleshooting

**Alerts not matching?**
- Check criteria are correct
- Verify jobs exist with matching criteria
- Check MongoDB connection

**Emails not sending?**
- Verify email configuration in .env
- Check email service is configured
- Review email logs

**Duplicate alerts?**
- Should be prevented by unique index
- Check no duplicate names exist per user

## Files Created

- `models/JobAlert.js` - MongoDB schema
- `routes/jobAlerts.js` - API endpoints
- `utils/alertNotificationService.js` - Notification engine
- `JOB_ALERTS_QUICK_START.md` - This file
- `JOB_ALERTS_ENDPOINTS.md` - Complete API reference
- `JOB_ALERTS_FEATURE.md` - Full documentation

## Next Steps

1. Read JOB_ALERTS_ENDPOINTS.md for all endpoints
2. Read JOB_ALERTS_FEATURE.md for complete guide
3. Build frontend alert management UI
4. Test create/update/delete operations
5. Test notification emails
6. Deploy and monitor

## Key Differences: Alerts vs Saved Jobs

| Feature | Job Alerts | Saved Jobs |
|---------|-----------|-----------|
| **Trigger** | New jobs match criteria | Manual save |
| **Notifications** | Automatic (instant/daily/weekly) | Optional reminders |
| **Criteria** | Position, location, salary, type | None (manual) |
| **Use Case** | Passive job hunting | Active bookmarking |

---

For complete documentation, see:
- **JOB_ALERTS_ENDPOINTS.md** - All API endpoints
- **JOB_ALERTS_FEATURE.md** - Complete feature guide
