# CPD Tracking - Quick Start

## Overview
The CPD (Continuing Professional Development) Tracking feature helps pharmacists track and manage their professional development hours required for regulatory compliance.

## Setup

### 1. Database Migration
```bash
npm run migrate
```

Creates `CPDRecords` table with:
- `userId` - Pharmacist reference
- `activityType` - Type of CPD activity
- `hoursEarned` - Hours awarded (decimal)
- `activityDate` - When activity occurred
- `verified` - Admin approval status
- `category` - Mandatory vs elective

### 2. Configuration
```javascript
// config/cpd.js
module.exports = {
  REQUIRED_HOURS_PER_YEAR: 30,
  MANDATORY_HOURS_PERCENTAGE: 50,
  COMPLIANCE_CHECK_ENABLED: true,
  VALID_ACTIVITY_TYPES: [
    'workshop', 'seminar', 'conference', 'online_course',
    'publication', 'presentation', 'research', 'certification',
    'professional_meeting', 'mentoring'
  ]
};
```

## Core Endpoints

### Get My CPD Records
```
GET /api/cpd/my-records?page=1&limit=20&verified=true&year=2024
```

**Query Parameters:**
- `page` - Pagination
- `limit` - Results per page
- `verified` - Filter by verification status
- `year` - Filter by year

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "activityType": "workshop",
      "title": "Clinical Pharmacy Advances 2024",
      "provider": "Pharmacy Council",
      "hoursEarned": 8,
      "activityDate": "2024-01-15T00:00:00Z",
      "category": "mandatory",
      "verified": true,
      "verifiedBy": "admin-uuid",
      "verificationDate": "2024-01-16T10:30:00Z",
      "completionCertificate": "url"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 15, "pages": 1 }
}
```

### Create CPD Record
```
POST /api/cpd
```

**Body:**
```json
{
  "activityType": "workshop",
  "title": "Drug Interactions Masterclass",
  "provider": "Pharmacy Training Institute",
  "hoursEarned": 6,
  "activityDate": "2024-01-10T00:00:00Z",
  "category": "mandatory",
  "description": "Advanced drug interaction management",
  "completionCertificate": "path/to/certificate.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "activityType": "workshop",
    "title": "Drug Interactions Masterclass",
    "hoursEarned": 6,
    "activityDate": "2024-01-10T00:00:00Z",
    "category": "mandatory",
    "verified": false,
    "createdAt": "2024-01-10T10:30:00Z"
  },
  "message": "CPD record created and pending verification"
}
```

### Get CPD Statistics
```
GET /api/cpd/stats/summary?year=2024
```

**Response:**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "totalHours": 28.5,
    "mandatoryHours": 16,
    "electiveHours": 12.5,
    "recordCount": 8,
    "complianceStatus": "non-compliant",
    "hoursNeeded": 1.5,
    "byType": {
      "workshop": 14,
      "seminar": 8.5,
      "conference": 6,
      "online_course": 0,
      "publication": 0,
      "presentation": 0,
      "research": 0,
      "certification": 0,
      "professional_meeting": 0,
      "mentoring": 0
    }
  }
}
```

### Update CPD Record
```
PUT /api/cpd/:recordId
```

**Body:**
```json
{
  "hoursEarned": 7,
  "title": "Updated Title",
  "description": "Updated description"
}
```

### Delete CPD Record
```
DELETE /api/cpd/:recordId
```

### Admin: Get Pending Records for Verification
```
GET /api/cpd/admin/pending?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "user": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "activityType": "workshop",
      "title": "Pharmacy Management Seminar",
      "hoursEarned": 4,
      "activityDate": "2024-01-12T00:00:00Z",
      "verified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "pages": 1 }
}
```

### Verify CPD Record (Admin)
```
PATCH /api/cpd/:recordId/verify
```

**Body:**
```json
{
  "verified": true,
  "notes": "Certificate verified and authentic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "verified": true,
    "verifiedBy": "admin-uuid",
    "verificationDate": "2024-01-16T10:30:00Z",
    "notes": "Certificate verified and authentic"
  },
  "message": "CPD record verified"
}
```

## Usage Examples

### Example 1: Track a Workshop
```javascript
const submitCPDActivity = async () => {
  const response = await fetch('/api/cpd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
      activityType: 'workshop',
      title: 'Advanced Pharmacotherapy',
      provider: 'University of Zimbabwe',
      hoursEarned: 8,
      activityDate: '2024-01-10T00:00:00Z',
      category: 'mandatory',
      completionCertificate: 'certificate_url.pdf'
    })
  });
  
  const result = await response.json();
  console.log('CPD activity submitted:', result.data);
};
```

### Example 2: Check Compliance Status
```javascript
const checkCPDCompliance = async (year = 2024) => {
  const response = await fetch(`/api/cpd/stats/summary?year=${year}`, {
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  });
  
  const { data } = await response.json();
  
  console.log(`Total Hours: ${data.totalHours} / 30 required`);
  console.log(`Mandatory: ${data.mandatoryHours} / 15 required`);
  console.log(`Status: ${data.complianceStatus}`);
  
  if (data.complianceStatus === 'non-compliant') {
    console.log(`Hours needed: ${data.hoursNeeded}`);
  }
};
```

### Example 3: View CPD Records
```javascript
const viewCPDRecords = async (year = 2024) => {
  const response = await fetch(`/api/cpd/my-records?year=${year}&limit=50`, {
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  });
  
  const { data } = await response.json();
  
  data.forEach(record => {
    const status = record.verified ? '✓' : '✗';
    console.log(
      `${status} ${record.title} (${record.hoursEarned} hrs, ${record.activityType})`
    );
  });
};
```

### Example 4: Admin Verification
```javascript
const verifyPendingRecords = async () => {
  const response = await fetch('/api/cpd/admin/pending?limit=100', {
    headers: { 'Authorization': 'Bearer ADMIN_TOKEN' }
  });
  
  const { data } = await response.json();
  
  for (const record of data) {
    // Review and verify
    await fetch(`/api/cpd/${record.id}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ADMIN_TOKEN'
      },
      body: JSON.stringify({
        verified: true,
        notes: 'Verified - certificate authentic'
      })
    });
  }
};
```

## Activity Types

| Type | Description | Typical Hours | Category |
|------|-------------|---|---|
| workshop | Hands-on training session | 4-8 | Mandatory |
| seminar | Educational presentation | 2-4 | Elective |
| conference | Industry conference | 8-40 | Mandatory |
| online_course | Online training course | 6-20 | Elective |
| publication | Published article/paper | 2-4 | Mandatory |
| presentation | Speaking at event | 2-4 | Mandatory |
| research | Research project | 4-10 | Mandatory |
| certification | Professional certification | 10-20 | Mandatory |
| professional_meeting | Attended meeting | 1-2 | Elective |
| mentoring | Mentoring activity | 2-4 | Elective |

## Compliance Requirements

### Default Requirements
```
Total Annual Hours: 30
├── Mandatory: 15 hours minimum (50%)
└── Elective: 15 hours (any type)
```

### Breakdown by Year
- Total hours tracked by calendar year
- Compliance checked at year-end
- Reports generated for regulatory bodies

### Calculation
```javascript
const calculateCompliance = (records, year) => {
  const yearRecords = records.filter(r => 
    r.verified && 
    new Date(r.activityDate).getFullYear() === year
  );
  
  const total = yearRecords.reduce((sum, r) => 
    sum + parseFloat(r.hoursEarned), 0
  );
  
  const mandatory = yearRecords
    .filter(r => r.category === 'mandatory')
    .reduce((sum, r) => sum + parseFloat(r.hoursEarned), 0);
  
  return {
    total: parseFloat(total.toFixed(2)),
    mandatory: parseFloat(mandatory.toFixed(2)),
    compliant: total >= 30 && mandatory >= 15
  };
};
```

## Frontend Components

### CPD Summary Card
```javascript
<CPDSummary
  totalHours={28.5}
  hoursRequired={30}
  mandatoryHours={16}
  status="non-compliant"
  hoursNeeded={1.5}
/>
```

### CPD Activity Form
```javascript
<CPDForm
  activityTypes={['workshop', 'seminar', 'conference', ...]}
  categories={['mandatory', 'elective']}
  onSubmit={(activity) => submitCPDActivity(activity)}
/>
```

### CPD Records Table
```javascript
<CPDRecordsTable
  records={records}
  onEdit={(id) => editRecord(id)}
  onDelete={(id) => deleteRecord(id)}
  onDownloadCertificate={(id) => downloadCert(id)}
/>
```

## Permissions Matrix

| Action | User | Admin |
|--------|------|-------|
| View own records | ✓ | ✓ |
| Create activity | ✓ | ✓ |
| Edit own activity | ✓ | ✗ |
| Delete own activity | ✓ | ✓ |
| View pending | ✗ | ✓ |
| Verify record | ✗ | ✓ |
| Export records | ✓ | ✓ |

## Business Rules

1. **Hour Tracking**
   - Decimal hours allowed (e.g., 4.5)
   - Must be positive number
   - Activity date cannot be in future

2. **Verification Workflow**
   - New activities default to unverified
   - Admin must review and approve
   - Can require certificate upload

3. **Category Requirements**
   - Minimum 50% must be mandatory activities
   - Remaining can be any activity type
   - Tracked separately for reporting

4. **Annual Requirement**
   - 30 hours total per year
   - Reset January 1st each year
   - Can carry over excess (some jurisdictions)

5. **Evidence Requirements**
   - Certificate/proof optional but recommended
   - Admin can request evidence before verification
   - Evidence stored in system

## Integration with User Features

### User Profile
Display on profile:
- Current year CPD hours
- Compliance status
- Number of completed activities

### User Dashboard
Show:
- CPD progress this year
- Pending verification activities
- Upcoming activities to complete
- Compliance timeline

### Notifications
Send notification when:
- Record verified
- Verification rejected (with reason)
- CPD requirement deadline approaching
- CPD requirement deadline reached

## Reports & Exports

### Generate Annual Report
```javascript
const generateAnnualCPDReport = async (userId, year) => {
  const records = await getCPDRecords(userId, year);
  
  const report = {
    year,
    totalHours: calculateTotal(records),
    mandatoryHours: calculateMandatory(records),
    byType: groupByType(records),
    compliant: checkCompliance(records),
    activities: records.map(r => ({
      title: r.title,
      type: r.activityType,
      hours: r.hoursEarned,
      date: r.activityDate,
      verified: r.verified
    }))
  };
  
  return generatePDF(report);
};
```

## Common Tasks

### Task: Show compliance dashboard
```javascript
const CPDDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/cpd/stats/summary', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setStats(data.data));
  }, []);

  if (!stats) return <Loading />;

  return (
    <div>
      <h2>CPD Progress for {stats.year}</h2>
      <ProgressBar 
        current={stats.totalHours}
        required={30}
        status={stats.complianceStatus}
      />
      <Stats 
        total={stats.totalHours}
        mandatory={stats.mandatoryHours}
        elective={stats.electiveHours}
      />
      <ByType data={stats.byType} />
    </div>
  );
};
```

### Task: Submit CPD activity
```javascript
const SubmitCPDForm = () => {
  const [formData, setFormData] = useState({
    activityType: 'workshop',
    title: '',
    provider: '',
    hoursEarned: 0,
    category: 'elective'
  });

  const handleSubmit = async () => {
    const res = await fetch('/api/cpd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      alert('Activity submitted for verification');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={formData.activityType}
        onChange={(e) => setFormData({
          ...formData, 
          activityType: e.target.value
        })}
      >
        {ACTIVITY_TYPES.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      {/* Other fields... */}
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Troubleshooting

**Q: My activity not verified yet**
A: New activities require admin verification. Check pending status.

**Q: Compliance status shows non-compliant**
A: Total hours must be 30+ and mandatory hours must be 15+.

**Q: Can't edit activity**
A: Once verified, activities cannot be edited. Contact admin if needed.

**Q: Certificate file too large**
A: Max file size 10MB. Try compressed PDF format.

## Next Steps

1. Deploy migration
2. Set up admin verification dashboard
3. Create CPD tracking interface for users
4. Build compliance reports
5. Add email reminders for deadlines
6. Create PDF export functionality
7. Set up automated compliance checking
8. Add calendar view of activities
