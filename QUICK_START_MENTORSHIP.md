# Mentorship Matching - Quick Start

## Overview
The Mentorship Matching feature connects senior pharmacists with juniors for professional development through structured mentorship programs.

## Setup

### 1. Database Migration
```bash
npm run migrate
```

Creates `MentorshipMatches` table with:
- `mentorId`, `menteeId` - User references
- `status` - pending|active|completed|rejected
- `frequency` - weekly|bi-weekly|monthly
- `specializations` - Array of focus areas
- `sessionsCompleted` - Counter
- `mentorRating`, `menteeRating` - Bi-directional ratings

### 2. Required User Fields
Update User model:
```javascript
{
  isMentor: Boolean,
  yearsOfExperience: Integer,
  specializations: Array,
  mentorBio: String
}
```

### 3. Notifications Integration
Create notification when:
- Mentorship request sent
- Mentorship approved/rejected
- Session completed
- Mentorship ended

## Core Endpoints

### Browse Available Mentors
```
GET /api/mentorship/mentors?specialization=clinical&page=1&limit=10
```

**Query Parameters:**
- `specialization` - Filter by specialization
- `page` - Pagination
- `limit` - Results per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "profilePicture": "url",
      "bio": "10 years clinical pharmacy experience",
      "specializations": ["clinical", "oncology", "geriatrics"],
      "yearsOfExperience": 10
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 25, "pages": 3 }
}
```

### Request Mentorship
```
POST /api/mentorship/request
```

**Body:**
```json
{
  "mentorId": "mentor-uuid",
  "goals": "Learn clinical pharmacy and medication therapy management",
  "frequency": "weekly",
  "specializations": ["clinical", "medication-therapy-management"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "match-uuid",
    "mentorId": "mentor-uuid",
    "menteeId": "mentee-uuid",
    "status": "pending",
    "mentorshipGoals": "Learn clinical pharmacy...",
    "frequency": "weekly",
    "specializations": ["clinical", "medication-therapy-management"],
    "sessionsCompleted": 0,
    "createdAt": "2024-01-10T10:30:00Z"
  },
  "message": "Mentorship request sent"
}
```

### Get My Mentorship Matches
```
GET /api/mentorship/my-matches?role=mentee
```

**Query Parameters:**
- `role` - mentee|mentor

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "match-uuid",
      "mentorId": "mentor-uuid",
      "menteeId": "mentee-uuid",
      "status": "active",
      "frequency": "weekly",
      "sessionsCompleted": 5,
      "mentor": {
        "id": "mentor-uuid",
        "firstName": "John",
        "lastName": "Doe",
        "profilePicture": "url"
      },
      "startDate": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Respond to Mentorship Request (Mentor)
```
PATCH /api/mentorship/:matchId/respond
```

**Body:**
```json
{
  "approved": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "match-uuid",
    "status": "active",
    "startDate": "2024-01-10T10:30:00Z"
  },
  "message": "Mentorship request accepted"
}
```

### Log Session Completion
```
POST /api/mentorship/:matchId/session
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "match-uuid",
    "sessionsCompleted": 6,
    "status": "active"
  },
  "message": "Session completed"
}
```

### Rate Mentorship
```
PATCH /api/mentorship/:matchId/rate
```

**Body:**
```json
{
  "rating": 4.5,
  "feedback": "Excellent guidance and knowledge sharing"
}
```

### End Mentorship
```
PATCH /api/mentorship/:matchId/end
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "endDate": "2024-01-10T10:30:00Z"
  },
  "message": "Mentorship ended"
}
```

## Usage Examples

### Example 1: Find and Request Mentorship
```javascript
// Find mentors
const findMentors = async (specialization) => {
  const response = await fetch(
    `/api/mentorship/mentors?specialization=${specialization}`
  );
  return await response.json();
};

// Request mentorship from selected mentor
const requestMentorship = async (mentorId) => {
  const response = await fetch('/api/mentorship/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
      mentorId,
      goals: 'Develop clinical pharmacy skills',
      frequency: 'weekly',
      specializations: ['clinical']
    })
  });
  
  const result = await response.json();
  console.log('Request sent:', result.message);
};
```

### Example 2: Mentor Dashboard - Handle Requests
```javascript
// Get mentee requests
const getMenteeRequests = async () => {
  const response = await fetch('/api/mentorship/my-matches?role=mentor', {
    headers: { 'Authorization': 'Bearer MENTOR_TOKEN' }
  });
  const result = await response.json();
  
  // Filter pending requests
  const pending = result.data.filter(m => m.status === 'pending');
  return pending;
};

// Accept mentorship request
const acceptRequest = async (matchId) => {
  const response = await fetch(`/api/mentorship/${matchId}/respond`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer MENTOR_TOKEN'
    },
    body: JSON.stringify({ approved: true })
  });
  return await response.json();
};
```

### Example 3: Log Sessions and Rate
```javascript
// After mentorship session
const completeSession = async (matchId) => {
  const response = await fetch(`/api/mentorship/${matchId}/session`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  });
  const result = await response.json();
  console.log(`Sessions completed: ${result.data.sessionsCompleted}`);
};

// Rate the mentorship
const rateMentorship = async (matchId, rating, feedback) => {
  const response = await fetch(`/api/mentorship/${matchId}/rate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({ rating, feedback })
  });
  return await response.json();
};
```

## Frontend Components

### Mentor Discovery Card
```javascript
<MentorCard
  name={mentor.firstName + ' ' + mentor.lastName}
  bio={mentor.bio}
  experience={mentor.yearsOfExperience}
  specializations={mentor.specializations}
  picture={mentor.profilePicture}
  onRequest={() => requestMentorship(mentor.id)}
/>
```

### Mentorship Match Status
```javascript
<MentorshipStatus
  mentor={match.mentor}
  status={match.status}
  frequency={match.frequency}
  sessionsCompleted={match.sessionsCompleted}
  startDate={match.startDate}
  rating={match.mentorRating}
/>
```

### Session Tracker
```javascript
<SessionTracker
  matchId={matchId}
  sessionsCompleted={sessionsCompleted}
  frequency={frequency}
  onCompleteSession={() => completeSession(matchId)}
  onEndMentorship={() => endMentorship(matchId)}
/>
```

## Mentorship States

```
         Request sent
              ↓
         [PENDING] ← Mentor reviews
            ↙    ↘
       REJECTED  [ACTIVE] ← Active mentorship
                   ↓
               [COMPLETED] ← Mentorship ends
```

## Specialization Examples

- Clinical Pharmacy
- Hospital Pharmacy
- Retail Pharmacy
- Medication Therapy Management
- Geriatric Pharmacy
- Pediatric Pharmacy
- Oncology Pharmacy
- Community Pharmacy
- Regulatory Affairs
- Pharmaceutical Science

## Business Rules

1. **One Active Mentorship**
   - User cannot have duplicate active mentorships with same mentor
   - Can have multiple mentorships with different mentors

2. **Session Tracking**
   - Sessions logged by either mentor or mentee
   - Counts toward mentorship duration

3. **Bi-directional Ratings**
   - Mentor rates mentee (professionalism, engagement)
   - Mentee rates mentor (quality of guidance)
   - Both ratings visible on completion

4. **Frequency Management**
   - Set expected meeting frequency
   - Used for compliance tracking
   - Helps assess engagement

5. **Specialization Matching**
   - Mentees specify focus areas
   - Mentors have listed specializations
   - System can suggest matches

## Permissions Matrix

| Action | Mentee | Mentor | Admin |
|--------|--------|--------|-------|
| Browse mentors | ✓ | ✗ | ✓ |
| Request mentorship | ✓ | ✗ | ✗ |
| View requests | ✗ | ✓ | ✓ |
| Accept/reject | ✗ | ✓ | ✓ |
| Log session | ✓ | ✓ | ✓ |
| Rate mentorship | ✓ | ✓ | ✗ |
| End mentorship | ✓ | ✓ | ✓ |

## Integration with CPD

Mentorship activities:
```javascript
// CPD record for mentoring activity
{
  activityType: 'mentoring',
  title: 'Mentoring junior pharmacist - 6 weeks',
  hoursEarned: 12,
  activityDate: endDate,
  provider: menteeeName,
  verified: true
}
```

## Analytics & Reporting

Track:
- Number of active mentorships
- Average mentorship duration
- Session completion rate
- Rating distribution
- Specialization demand
- Mentor utilization

## Common Tasks

### Task: Show mentor directory on platform
```javascript
const MentorDirectory = () => {
  const [mentors, setMentors] = useState([]);
  const [specialization, setSpecialization] = useState('');

  useEffect(() => {
    fetch(`/api/mentorship/mentors?specialization=${specialization}`)
      .then(r => r.json())
      .then(data => setMentors(data.data));
  }, [specialization]);

  return (
    <div>
      <select onChange={(e) => setSpecialization(e.target.value)}>
        <option>All Specializations</option>
        <option value="clinical">Clinical</option>
        <option value="retail">Retail</option>
      </select>
      {mentors.map(m => (
        <MentorCard key={m.id} mentor={m} />
      ))}
    </div>
  );
};
```

### Task: Mentor dashboard
```javascript
const MentorDashboard = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch('/api/mentorship/my-matches?role=mentor', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setMatches(data.data));
  }, []);

  const pending = matches.filter(m => m.status === 'pending');
  const active = matches.filter(m => m.status === 'active');
  const completed = matches.filter(m => m.status === 'completed');

  return (
    <div>
      <h2>Pending Requests: {pending.length}</h2>
      <h2>Active Mentorships: {active.length}</h2>
      <h2>Completed: {completed.length}</h2>
    </div>
  );
};
```

## Troubleshooting

**Q: Can't find mentors in my specialization**
A: Check that mentors have `isMentor=true` and specializations set.

**Q: Mentorship request not appearing for mentor**
A: Ensure notification was created and mentor has read permission.

**Q: Can't rate mentorship**
A: Mentorship must be completed first. Call end-mentorship endpoint.

## Next Steps

1. Deploy migration
2. Update User model with mentor fields
3. Create mentor discovery interface
4. Build mentor request/response flow
5. Add session tracking component
6. Create ratings system
7. Integrate with CPD tracking
8. Set up mentor profile pages
