# Job Analytics Dashboard - Quick Start

## Overview
The Job Analytics Dashboard provides employers with detailed recruitment metrics to optimize job postings and hiring performance.

## Setup

### 1. Database Migration
```bash
npm run migrate
```

Creates `JobAnalytics` table tracking:
- Views, clicks, applications
- Conversion rates
- Time spent metrics
- Unique viewer counts

### 2. Tracking Integration
Add tracking calls to:
- Job listing page load (track view)
- Application submission (track application)
- Job filled/closed (track conversion)

## Core Endpoints

### Get Job Analytics
```
GET /api/job-analytics/job/:jobId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "analytics-uuid",
    "jobId": "job-uuid",
    "employerId": "employer-uuid",
    "views": 245,
    "clicks": 89,
    "applications": 12,
    "applicationRate": 4.90,
    "conversions": 1,
    "conversionRate": 8.33,
    "uniqueViewers": 156,
    "averageTimeSpent": 87,
    "lastViewed": "2024-01-10T10:30:00Z"
  }
}
```

### Get Dashboard Overview
```
GET /api/job-analytics/dashboard/overview?timeframe=30d
```

**Query Parameters:**
- `timeframe` - 7d|30d|90d|1y|all (default: 30d)

**Response:**
```json
{
  "success": true,
  "data": {
    "timeframe": "30d",
    "totalJobs": 15,
    "totalViews": 3250,
    "totalApplications": 156,
    "totalConversions": 8,
    "uniqueViewers": 1890,
    "averageTimeSpent": 92,
    "applicationRate": 4.78,
    "conversionRate": 5.13,
    "topPerformingJobs": [
      {
        "jobId": "job-uuid",
        "views": 450,
        "applications": 28
      },
      {
        "jobId": "job-uuid2",
        "views": 380,
        "applications": 22
      }
    ]
  }
}
```

### Track Job View
```
POST /api/job-analytics/track/view
```

**Body:**
```json
{
  "jobId": "job-uuid"
}
```

**Note:** Call this when user views job listing

### Track Application
```
POST /api/job-analytics/track/application
```

**Body:**
```json
{
  "jobId": "job-uuid"
}
```

**Note:** Call this when application submitted

### Track Conversion
```
POST /api/job-analytics/track/conversion
```

**Body:**
```json
{
  "jobId": "job-uuid"
}
```

**Note:** Call when employer marks job as filled

### Get Job Comparison
```
GET /api/job-analytics/comparison/jobs
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "jobId": "job-uuid",
      "views": 450,
      "applications": 28,
      "applicationRate": 6.22,
      "conversions": 2,
      "conversionRate": 7.14
    },
    {
      "jobId": "job-uuid2",
      "views": 380,
      "applications": 22,
      "applicationRate": 5.79,
      "conversions": 1,
      "conversionRate": 4.55
    }
  ]
}
```

### Get Application Statistics
```
GET /api/job-analytics/applications/stats?timeframe=30d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timeframe": "30d",
    "totalApplications": 156,
    "byStatus": {
      "new": 45,
      "reviewed": 67,
      "shortlisted": 28,
      "rejected": 16
    },
    "dailyApplications": {
      "2024-01-10": 12,
      "2024-01-09": 8,
      "2024-01-08": 15
    }
  }
}
```

## Usage Examples

### Example 1: Track View on Job Listing Page
```javascript
// On job detail page load
useEffect(() => {
  const trackView = async () => {
    await fetch('/api/job-analytics/track/view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer TOKEN'
      },
      body: JSON.stringify({ jobId })
    });
  };
  
  trackView();
}, [jobId]);
```

### Example 2: Track Application Submission
```javascript
const submitApplication = async (formData) => {
  // Submit application
  const appResponse = await fetch('/api/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer TOKEN'
    },
    body: JSON.stringify(formData)
  });

  // Track analytics
  if (appResponse.ok) {
    await fetch('/api/job-analytics/track/application', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jobId })
    });
  }
};
```

### Example 3: View Analytics Dashboard
```javascript
const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetch(`/api/job-analytics/dashboard/overview?timeframe=${timeframe}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setAnalytics(data.data));
  }, [timeframe]);

  if (!analytics) return <Loading />;

  return (
    <div>
      <div className="timeframe-selector">
        <button onClick={() => setTimeframe('7d')}>7 Days</button>
        <button onClick={() => setTimeframe('30d')}>30 Days</button>
        <button onClick={() => setTimeframe('90d')}>90 Days</button>
        <button onClick={() => setTimeframe('1y')}>1 Year</button>
      </div>

      <MetricCard 
        label="Total Views"
        value={analytics.totalViews}
      />
      <MetricCard 
        label="Applications"
        value={analytics.totalApplications}
      />
      <MetricCard 
        label="Application Rate"
        value={analytics.applicationRate.toFixed(2) + '%'}
      />
      <MetricCard 
        label="Conversion Rate"
        value={analytics.conversionRate.toFixed(2) + '%'}
      />

      <TopJobsChart jobs={analytics.topPerformingJobs} />
    </div>
  );
};
```

### Example 4: Compare Job Performance
```javascript
const JobComparison = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch('/api/job-analytics/comparison/jobs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setJobs(data.data));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Job ID</th>
          <th>Views</th>
          <th>Applications</th>
          <th>App Rate %</th>
          <th>Conversions</th>
          <th>Conv Rate %</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map(job => (
          <tr key={job.jobId}>
            <td>{job.jobId}</td>
            <td>{job.views}</td>
            <td>{job.applications}</td>
            <td>{job.applicationRate.toFixed(2)}</td>
            <td>{job.conversions}</td>
            <td>{job.conversionRate.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

## Key Metrics Explained

### Views
Total number of times job listing was displayed.
- Includes repeat visitors
- Tracked per user session

### Clicks
Number of times users interacted with job details.
- Click through from listing to detail
- Secondary metrics

### Applications
Total applications received for job.
- Count of submitted applications
- Tracked separately from views

### Application Rate (%)
Percentage of views that resulted in applications.
```
Application Rate = (Applications / Views) × 100
```
- Shows job attractiveness
- Goal: 5-10% is typical
- Higher is better

### Conversions
Number of times job was filled/closed.
- Indicates successful hiring
- One per job unless reposted

### Conversion Rate (%)
Percentage of applications that resulted in hire.
```
Conversion Rate = (Conversions / Applications) × 100
```
- Shows hiring efficiency
- Goal: 5-20% is typical
- Higher indicates better candidate quality

### Unique Viewers
Number of unique users who viewed job.
- Excludes repeat visitors from same user
- Better indicator of reach

### Average Time Spent (seconds)
Average time user spent viewing job details.
- Shows job interest level
- Goal: 60+ seconds is good
- Low time = poor job description or mismatch

## Frontend Components

### Metrics Card
```javascript
<MetricCard
  label="Total Applications"
  value={156}
  change={+12}
  changePercent={8.3}
/>
```

### Conversion Funnel Chart
```javascript
<ConversionFunnel
  views={3250}
  applications={156}
  conversions={8}
/>
```

### Job Performance Table
```javascript
<JobPerformanceTable
  jobs={[
    { title: 'Pharmacist', views: 450, applications: 28 },
    { title: 'Tech Support', views: 380, applications: 22 }
  ]}
/>
```

### Analytics Timeline
```javascript
<AnalyticsTimeline
  data={dailyApplications}
  metric="applications"
/>
```

## Dashboard Sections

### 1. Summary Cards
- Total Jobs
- Total Views
- Total Applications
- Total Conversions

### 2. Key Metrics
- Application Rate
- Conversion Rate
- Average Time Spent
- Unique Viewers

### 3. Top Performing Jobs
- List top 5 jobs by views
- Show applications per job
- Link to job details

### 4. Trend Charts
- Applications over time
- Views trend
- Conversion funnel

### 5. Job Comparison
- Table of all jobs
- Sortable by views, applications, rate
- Quick comparison

## Timeframe Options

| Timeframe | Description |
|-----------|-------------|
| 7d | Last 7 days |
| 30d | Last 30 days |
| 90d | Last 90 days |
| 1y | Last year |
| all | All time data |

## Permissions

```javascript
// Only authenticated employers can access
if (req.user.userType !== 'pharmacy') {
  return res.status(403).json({ error: 'Unauthorized' });
}

// Employers can only see their own job analytics
if (job.employerId !== req.user.id) {
  return res.status(403).json({ error: 'Unauthorized' });
}
```

## Integration Points

### Job Creation
When job posted:
```javascript
// Create initial analytic record
const analytic = await JobAnalytic.create({
  jobId: job.id,
  employerId: job.employerId
});
```

### Job Listing Page
When job displayed:
```javascript
// Track the view
await trackJobView(jobId);
```

### Application Submission
When application submitted:
```javascript
// Track application
await trackApplication(jobId);
```

### Job Closure
When job marked as filled:
```javascript
// Track conversion
await trackConversion(jobId);
```

## Performance Optimization

### Caching Strategy
```javascript
// Cache summary for 1 hour
const CACHE_TTL = 3600000; // 1 hour

// Cache individual job analytics for 30 minutes
const JOB_CACHE_TTL = 1800000; // 30 minutes
```

### Database Indexes
```sql
CREATE INDEX idx_job_analytics_job_id ON JobAnalytics(jobId);
CREATE INDEX idx_job_analytics_employer_id ON JobAnalytics(employerId);
CREATE INDEX idx_job_analytics_updated ON JobAnalytics(updatedAt);
```

## Insights & Recommendations

### Low Application Rate
If application rate < 3%:
- Review job title
- Check job description clarity
- Verify salary competitiveness
- Check listing visibility

### High Application Rate but Low Conversion
If conversion rate < 3%:
- Review interview process
- Check candidate screening
- Improve job matching
- Consider application requirements

### Low Views
If views < 50:
- Job might be too niche
- Check listing visibility
- Promote job listing
- Verify job title keywords

## Common Tasks

### Task: Show employer job dashboard
```javascript
const EmployerDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch('/api/job-analytics/dashboard/overview', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setMetrics(d.data));
  }, []);

  return (
    <div className="dashboard">
      <MetricGrid metrics={metrics} />
      <TopJobsChart jobs={metrics.topPerformingJobs} />
    </div>
  );
};
```

### Task: Show job-specific analytics
```javascript
const JobAnalytics = ({ jobId }) => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch(`/api/job-analytics/job/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setAnalytics(d.data));
  }, [jobId]);

  return (
    <div>
      <h3>Job Performance</h3>
      <Metrics analytics={analytics} />
    </div>
  );
};
```

## Troubleshooting

**Q: No analytics showing for job**
A: Analytics only exist after first view. Ensure view tracking is active.

**Q: Conversion rate seems low**
A: Check if conversions are being tracked when job is filled.

**Q: Can't see other employer's analytics**
A: You can only view your own job analytics per permissions.

## Next Steps

1. Deploy migration
2. Add tracking calls to job listing pages
3. Create employer dashboard
4. Build analytics comparison view
5. Add email reports
6. Implement data export (CSV/PDF)
7. Create insights and recommendations engine
8. Set up performance alerts
