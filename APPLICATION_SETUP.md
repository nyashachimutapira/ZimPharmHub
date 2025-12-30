# Job Application Tracking - Quick Setup Guide

## What's New

Complete job application tracking system with:
- ✅ Real-time status tracking (Pending → Reviewing → Shortlisted → Interview → Accepted/Rejected)
- ✅ Interactive timeline view
- ✅ Email notifications for each status change
- ✅ Job seeker dashboard to monitor applications
- ✅ Pharmacy management dashboard for tracking applicants
- ✅ Interview scheduling system
- ✅ Job offer management

## Files Created

### Backend
```
models/Application.js                    - Application data model
routes/applications.js                   - API endpoints for applications
utils/emailService.js                   - Email notification system
```

### Frontend Components
```
client/src/components/ApplicationTimeline.js      - Status history timeline
client/src/components/ApplicationStatusBadge.js   - Status badge display
```

### Frontend Pages
```
client/src/pages/MyApplicationsPage.js                   - Job seeker dashboard
client/src/pages/MyApplicationsPage.css                  - Job seeker styles
client/src/pages/PharmacyApplicationsPage.js           - Pharmacy dashboard
client/src/pages/PharmacyApplicationsPage.css          - Pharmacy styles
```

### Documentation
```
APPLICATION_TRACKING.md                  - Complete feature documentation
APPLICATION_SETUP.md                     - This file
```

## Installation Steps

### 1. Update Environment Variables

Add to your `.env` file:

```env
# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

**For Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-factor authentication
3. Go to App passwords section
4. Generate password for "Mail"
5. Use the 16-character password as SMTP_PASS

### 2. Update Routes

In `server.js`, the application route has already been added:
```javascript
app.use('/api/applications', require('./routes/applications'));
```

### 3. Update Frontend Routes

In `client/src/App.js`, add:

```jsx
import MyApplicationsPage from './pages/MyApplicationsPage';
import PharmacyApplicationsPage from './pages/PharmacyApplicationsPage';

// In <Routes>:
<Route path="/my-applications" element={<MyApplicationsPage />} />
<Route path="/applications" element={<PharmacyApplicationsPage />} />
```

### 4. Update Navbar

In `client/src/components/Navbar.js`, add links:

```jsx
<Link to="/my-applications" className="nav-link">
  My Applications
</Link>
```

Or for pharmacy users:
```jsx
<Link to="/applications" className="nav-link">
  Manage Applications
</Link>
```

### 5. Update Job Application Flow

In `client/src/pages/JobsPage.js` or `JobDetailPage.js`, modify the apply handler:

```jsx
const handleApply = async () => {
  try {
    const response = await axios.post('/api/applications', {
      jobId: job._id,
      userId: localStorage.getItem('userId'),
      resume: resumeFile,
      coverLetter: coverLetter
    }, {
      headers: { 'user-id': localStorage.getItem('userId') }
    });

    setToast({ 
      message: 'Application submitted successfully!', 
      type: 'success' 
    });
    
    // Redirect to applications page
    navigate('/my-applications');
  } catch (error) {
    setToast({ 
      message: error.response?.data?.message || 'Failed to submit application', 
      type: 'error' 
    });
  }
};
```

### 6. Start the Application

```bash
# From root directory
npm run dev

# Or separately:
# Terminal 1
npm run server

# Terminal 2
cd client && npm start
```

## Usage Guide

### For Job Seekers

1. **Apply for a Job**
   - Go to Jobs page
   - Click "Apply Now"
   - Upload resume and optional cover letter
   - Submit application

2. **Track Applications**
   - Go to "My Applications" page
   - See all your applications
   - Filter by status
   - Click "View Details" to see timeline

3. **Receive Notifications**
   - Get email for every status change
   - See interview scheduling emails
   - Receive job offer notifications

### For Pharmacies

1. **View Applications**
   - Go to "Manage Applications" page
   - See statistics dashboard
   - View all applicants in table

2. **Manage Applications**
   - Click "View" to see applicant details
   - Click "Update Status" to change status
   - For interview status: add date, time, location
   - For accepted status: add salary and start date
   - For rejected status: add feedback

3. **Monitor Pipeline**
   - See application counts by status
   - Track shortlist rate
   - Monitor interview progress

## Testing the System

### Test Case 1: Basic Application Flow

1. **Create 2 accounts:**
   - Pharmacy account (pharmacyId: 123)
   - Job seeker account (userId: 456)

2. **Create a job posting** (as pharmacy)
   - POST /api/jobs with jobId: 789

3. **Submit application** (as job seeker)
   - POST /api/applications
   - Body: { jobId: 789, userId: 456, coverLetter: "..." }
   - ✅ Should receive confirmation email

4. **Update status** (as pharmacy)
   - PUT /api/applications/{appId}/status
   - Change to "reviewing"
   - ✅ Applicant should receive email

5. **Check dashboard**
   - Job seeker: /my-applications should show app with progress
   - Pharmacy: /applications should show in stats

### Test Case 2: Interview Scheduling

1. **Update to interview status**
   - PUT /api/applications/{appId}/status
   - Body: {
       status: "interview",
       interviewDate: "2024-01-15",
       interviewTime: "10:00",
       interviewLocation: "Harare Office"
     }
   - ✅ Email should include interview details

2. **Check job seeker dashboard**
   - Should see interview date in card
   - Modal should show full details

### Test Case 3: Job Offer

1. **Update to accepted status**
   - PUT /api/applications/{appId}/status
   - Body: {
       status: "accepted",
       salary: 50000,
       startDate: "2024-02-01"
     }
   - ✅ Email should include offer details

## API Testing with Postman

### 1. Get User Applications
```
GET http://localhost:5000/api/applications/user/USER_ID
```

### 2. Create Application
```
POST http://localhost:5000/api/applications
Body: {
  "jobId": "JOB_ID",
  "userId": "USER_ID",
  "resume": "resume.pdf",
  "coverLetter": "I'm interested..."
}
```

### 3. Update Status
```
PUT http://localhost:5000/api/applications/APP_ID/status
Headers: {
  "user-id": "PHARMACY_ID"
}
Body: {
  "status": "shortlisted",
  "message": "Great application!"
}
```

### 4. Get Statistics
```
GET http://localhost:5000/api/applications/stats/PHARMACY_ID
```

## Email Templates

The system includes pre-formatted HTML emails for each status:

- **Pending**: Confirmation email
- **Reviewing**: Status update
- **Shortlisted**: Congratulation email
- **Interview**: Interview details email
- **Accepted**: Job offer email
- **Rejected**: Rejection notification with optional feedback

Each email is branded with ZimPharmHub colors and includes relevant information.

## Troubleshooting

### Emails not sending?

1. **Check .env file**
   ```bash
   # Verify these are set
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

2. **Check server logs**
   - Look for email service errors
   - Verify SMTP credentials

3. **Gmail setup**
   - Ensure 2FA is enabled
   - Generate new app password
   - Test with a simpler app first

### Application not created?

1. **Verify jobId and userId are valid**
   - Check they exist in database
   - Check format is valid MongoDB ObjectId

2. **Check user is logged in**
   - localStorage should have userId
   - JWT token should be valid

3. **Check API route**
   - Application route should be registered in server.js
   - No errors in server logs

### Status not updating?

1. **Verify application exists**
   - GET /api/applications/{appId} should return data

2. **Check pharmacy authorization**
   - user-id header must match pharmacyId of application

3. **For interview status, include all fields**
   - interviewDate (required)
   - interviewTime (required)
   - interviewLocation (required)

## Performance Tips

1. **Limit Applications Fetched**
   - Current: 100 per request
   - Add pagination for larger pharmacies

2. **Cache Statistics**
   - Statistics are computed on request
   - Consider caching for 5 minutes

3. **Email Queue**
   - Current: Sends immediately
   - Consider async queue for bulk operations

## Next Steps

1. ✅ Configure email in .env
2. ✅ Add routes to App.js
3. ✅ Add navigation links
4. ✅ Test with sample applications
5. ⭐ Consider additional features:
   - SMS notifications
   - Bulk operations
   - Advanced analytics
   - Calendar integration

## File Summary

| File | Purpose | Lines |
|------|---------|-------|
| Application.js | Data model | 50 |
| applications.js | API routes | 200+ |
| emailService.js | Email notifications | 150+ |
| ApplicationTimeline.js | Timeline component | 50 |
| ApplicationStatusBadge.js | Status badge | 30 |
| MyApplicationsPage.js | Job seeker dashboard | 250+ |
| PharmacyApplicationsPage.js | Pharmacy dashboard | 300+ |

**Total new code: ~1100 lines**

## Support

For issues:
1. Check browser console for errors
2. Check server logs for backend errors
3. Review APPLICATION_TRACKING.md for detailed docs
4. Check email configuration in .env

---

**Ready to go!** Your application tracking system is ready for deployment. 🚀
