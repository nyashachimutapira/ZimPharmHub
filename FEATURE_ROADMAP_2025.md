# ZimPharmHub Feature Roadmap 2025

## Executive Summary
This roadmap outlines implementation of 10 major feature categories in 4 phases. Current stack: Node/Express, MongoDB/Sequelize, React, SQLite/PostgreSQL.

---

## Phase 1: Real-Time & Notifications (Week 1-2)

### 1.1 WebSocket Infrastructure
**Features:**
- Live job notifications
- Real-time chat with typing indicators
- Activity feed (profile views, saved jobs)

**Tech Stack:**
- Socket.io
- Redis (for session management & scaling)
- JWT middleware for Socket auth

**Dependencies to Add:**
```json
{
  "socket.io": "^4.7.2",
  "socket.io-client": "^4.7.2",
  "redis": "^4.6.0",
  "socket.io-redis": "^6.1.1"
}
```

**Database Changes:**
```sql
-- Activity Log Table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  userId BIGINT,
  action VARCHAR (100),
  targetUserId BIGINT,
  jobId BIGINT,
  timestamp TIMESTAMP,
  createdAt TIMESTAMP
);

-- Chat Messages Table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  senderId BIGINT,
  recipientId BIGINT,
  message TEXT,
  isRead BOOLEAN DEFAULT false,
  timestamp TIMESTAMP,
  createdAt TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  userId BIGINT,
  type VARCHAR(50), -- job_alert, message, view, etc
  content TEXT,
  relatedId VARCHAR(255),
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP
);
```

**API Endpoints:**
```
WebSocket Events:
- socket.on('send_message', (data) => {...})
- socket.on('typing', (data) => {...})
- socket.on('job_notification', (data) => {...})
- socket.on('profile_view', (data) => {...})

REST Endpoints:
- GET /api/notifications
- POST /api/notifications/mark-read
- GET /api/chat/:userId
- GET /api/activity-feed
```

**Implementation Priority:** HIGH
**Effort:** 5-7 days

---

## Phase 2: AI/ML Features (Week 2-3)

### 2.1 Smart Job Recommendations
**Tech Stack:**
- Hugging Face API or OpenAI
- TF.js for client-side ML (optional)

**Features:**
- Skill-based job matching
- Resume parsing & auto-fill
- Job description AI generation
- Salary prediction

**Dependencies:**
```json
{
  "openai": "^4.0.0",
  "pdfjs-dist": "^3.11.174",
  "pdf-parse": "^1.1.1",
  "js-levenshtein": "^1.1.6"
}
```

**Database Changes:**
```sql
-- User Skills Table
CREATE TABLE user_skills (
  id UUID PRIMARY KEY,
  userId BIGINT,
  skillName VARCHAR(255),
  proficiencyLevel ENUM('beginner', 'intermediate', 'advanced'),
  endorsements INT DEFAULT 0,
  createdAt TIMESTAMP
);

-- Resume Data Table
CREATE TABLE resume_data (
  id UUID PRIMARY KEY,
  userId BIGINT,
  jsonData JSON,
  parsedAt TIMESTAMP,
  createdAt TIMESTAMP
);

-- Job Matching Scores Table
CREATE TABLE job_matches (
  id UUID PRIMARY KEY,
  userId BIGINT,
  jobId BIGINT,
  matchScore FLOAT, -- 0-100
  matchedSkills JSON,
  createdAt TIMESTAMP
);

-- Salary Data (for predictions)
CREATE TABLE salary_benchmarks (
  id UUID PRIMARY KEY,
  jobTitle VARCHAR(255),
  experience INT,
  location VARCHAR(255),
  avgSalary DECIMAL(10,2),
  minSalary DECIMAL(10,2),
  maxSalary DECIMAL(10,2),
  dataYear INT,
  createdAt TIMESTAMP
);
```

**API Endpoints:**
```
- POST /api/resume/parse (upload PDF/doc)
- GET /api/recommendations (AI-powered)
- POST /api/skills/add
- GET /api/salary-prediction/:jobId
- POST /api/generate-job-description (AI)
- POST /api/match-jobs (skill-based)
```

**Implementation Priority:** HIGH
**Effort:** 8-10 days

---

## Phase 3: Social & Engagement (Week 3-4)

### 3.1 Gamification & Community
**Features:**
- Badge/achievement system
- Leaderboards
- Social verification
- Follow/subscribe system
- Social media sharing

**Dependencies:**
```json
{
  "react-share": "^4.4.1",
  "joi": "^17.9.2"
}
```

**Database Changes:**
```sql
-- Badges Table
CREATE TABLE badges (
  id UUID PRIMARY KEY,
  badgeId VARCHAR(100),
  name VARCHAR(255),
  description TEXT,
  icon VARCHAR(255),
  criteria JSON, -- e.g., {"type": "applications", "count": 10}
  createdAt TIMESTAMP
);

-- User Badges (achievements)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY,
  userId BIGINT,
  badgeId UUID,
  earnedAt TIMESTAMP,
  createdAt TIMESTAMP
);

-- User Follows
CREATE TABLE user_follows (
  id UUID PRIMARY KEY,
  followerId BIGINT,
  followingId BIGINT,
  createdAt TIMESTAMP
);

-- User Posts (for social feed)
CREATE TABLE user_posts (
  id UUID PRIMARY KEY,
  userId BIGINT,
  content TEXT,
  imageUrl VARCHAR(255),
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  createdAt TIMESTAMP
);

-- Post Likes
CREATE TABLE post_likes (
  id UUID PRIMARY KEY,
  postId UUID,
  userId BIGINT,
  createdAt TIMESTAMP
);

-- Social Proof (verification badges)
CREATE TABLE user_verifications (
  id UUID PRIMARY KEY,
  userId BIGINT,
  type ENUM('email', 'phone', 'license', 'experience'),
  status ENUM('pending', 'verified', 'rejected'),
  verifiedAt TIMESTAMP,
  createdAt TIMESTAMP
);

-- Leaderboard View (computed)
CREATE VIEW leaderboard AS
SELECT 
  u.id,
  u.firstName,
  u.lastName,
  COUNT(DISTINCT ub.badgeId) as badges_earned,
  COUNT(DISTINCT japp.id) as applications_made,
  COUNT(DISTINCT uf.followerId) as followers,
  AVG(r.rating) as avg_rating
FROM users u
LEFT JOIN user_badges ub ON u.id = ub.userId
LEFT JOIN job_applications japp ON u.id = japp.userId
LEFT JOIN user_follows uf ON u.id = uf.followingId
LEFT JOIN reviews r ON u.id = r.targetUserId
GROUP BY u.id
ORDER BY badges_earned DESC;
```

**API Endpoints:**
```
- POST /api/badges/check-unlock (trigger badge checking)
- GET /api/leaderboard
- POST /api/users/:id/follow
- POST /api/users/:id/unfollow
- GET /api/users/:id/followers
- POST /api/posts (create)
- GET /api/feed (social feed)
- POST /api/posts/:id/like
- POST /api/posts/:id/share
- POST /api/share-social (LinkedIn, Twitter, Facebook)
- GET /api/users/:id/verification-status
- POST /api/verify/:type (initiate verification)
```

**Implementation Priority:** MEDIUM
**Effort:** 6-8 days

---

## Phase 4: Mobile, Video & Advanced Features (Week 4+)

### 4.1 Progressive Web App (PWA)
**Features:**
- Offline support (Service Workers)
- Install to home screen
- Push notifications
- Background sync

**Dependencies:**
```json
{
  "workbox-webpack-plugin": "^7.0.0",
  "web-push": "^3.6.5"
}
```

**Implementation Tasks:**
- Add manifest.json
- Configure service worker
- Setup Web Push API
- Implement offline pages

**Implementation Priority:** MEDIUM
**Effort:** 3-5 days

### 4.2 Video Features
**Tech Stack:**
- Agora.io (video calls)
- HLS (for streaming)
- AWS S3 (video storage)

**Dependencies:**
```json
{
  "agora-rtc-sdk": "^4.0.0",
  "aws-sdk": "^2.1400.0",
  "hls.js": "^1.4.0"
}
```

**Database Changes:**
```sql
-- Video Profiles
CREATE TABLE video_profiles (
  id UUID PRIMARY KEY,
  userId BIGINT,
  videoUrl VARCHAR(255),
  duration INT,
  uploadedAt TIMESTAMP,
  createdAt TIMESTAMP
);

-- Company Tours
CREATE TABLE company_tours (
  id UUID PRIMARY KEY,
  companyId BIGINT,
  title VARCHAR(255),
  description TEXT,
  videoUrl VARCHAR(255),
  createdAt TIMESTAMP
);

-- Live Events
CREATE TABLE live_events (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  startTime TIMESTAMP,
  endTime TIMESTAMP,
  agoraChannelName VARCHAR(255),
  recordingUrl VARCHAR(255),
  createdAt TIMESTAMP
);
```

**API Endpoints:**
```
- POST /api/video-profile/upload
- GET /api/video-profile/:userId
- POST /api/company-tour
- GET /api/company/:id/tours
- POST /api/live-event
- GET /api/live-events
- POST /api/live-event/:id/join
- POST /api/live-event/:id/recording
```

**Implementation Priority:** MEDIUM-LOW
**Effort:** 10+ days

### 4.3 Advanced Search
**Features:**
- Voice search
- AI-powered filters
- Saved search alerts
- Search history

**Dependencies:**
```json
{
  "web-speech-api": "^0.0.1",
  "elasticsearch": "^8.0.0"
}
```

**Database Changes:**
```sql
-- Search History
CREATE TABLE search_history (
  id UUID PRIMARY KEY,
  userId BIGINT,
  searchQuery VARCHAR(500),
  filters JSON,
  resultsCount INT,
  createdAt TIMESTAMP
);

-- Saved Searches
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY,
  userId BIGINT,
  name VARCHAR(255),
  query VARCHAR(500),
  filters JSON,
  alertEnabled BOOLEAN DEFAULT false,
  createdAt TIMESTAMP
);

-- Search Suggestions
CREATE TABLE search_suggestions (
  id UUID PRIMARY KEY,
  keyword VARCHAR(255),
  category VARCHAR(100),
  frequency INT,
  createdAt TIMESTAMP
);
```

**API Endpoints:**
```
- POST /api/search/voice
- GET /api/search/suggestions
- POST /api/search/save
- GET /api/search/saved
- DELETE /api/search/saved/:id
- GET /api/search/history
```

**Implementation Priority:** MEDIUM
**Effort:** 5-7 days

### 4.4 Verification & Security
**Features:**
- Pharmacy license verification
- ID verification
- Background checks
- Trust scores

**Tech Stack:**
- IDology API (ID verification)
- Checkr API (background checks)

**Dependencies:**
```json
{
  "axios": "^1.4.0"
}
```

**Database Changes:**
```sql
-- Verification Requests
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY,
  userId BIGINT,
  type ENUM('license', 'id', 'background'),
  status ENUM('pending', 'verified', 'rejected', 'expired'),
  documentUrl VARCHAR(255),
  externalRefId VARCHAR(255),
  verifiedAt TIMESTAMP,
  expiresAt TIMESTAMP,
  createdAt TIMESTAMP
);

-- Trust Scores
CREATE TABLE trust_scores (
  id UUID PRIMARY KEY,
  userId BIGINT,
  score FLOAT DEFAULT 0.5, -- 0-1
  verifications INT DEFAULT 0,
  reviews INT DEFAULT 0,
  reportedCount INT DEFAULT 0,
  lastUpdated TIMESTAMP,
  createdAt TIMESTAMP
);

-- Trust Score History
CREATE TABLE trust_score_history (
  id UUID PRIMARY KEY,
  userId BIGINT,
  previousScore FLOAT,
  newScore FLOAT,
  reason VARCHAR(255),
  createdAt TIMESTAMP
);
```

**API Endpoints:**
```
- POST /api/verify/license
- POST /api/verify/id
- POST /api/verify/background
- GET /api/verify/status/:userId
- GET /api/trust-score/:userId
- POST /api/verify/upload-document
```

**Implementation Priority:** HIGH
**Effort:** 7-10 days

### 4.5 Community & Collaboration
**Features:**
- User groups by specialization
- Mentorship matching
- Study groups
- Polls/surveys

**Database Changes:**
```sql
-- User Groups
CREATE TABLE user_groups (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  specialization VARCHAR(255),
  memberCount INT DEFAULT 0,
  createdBy BIGINT,
  createdAt TIMESTAMP
);

-- Group Memberships
CREATE TABLE group_memberships (
  id UUID PRIMARY KEY,
  groupId UUID,
  userId BIGINT,
  role ENUM('member', 'moderator', 'admin'),
  joinedAt TIMESTAMP,
  createdAt TIMESTAMP
);

-- Mentorship Relationships
CREATE TABLE mentorships (
  id UUID PRIMARY KEY,
  mentorId BIGINT,
  menteeId BIGINT,
  specialty VARCHAR(255),
  status ENUM('pending', 'active', 'completed'),
  startedAt TIMESTAMP,
  createdAt TIMESTAMP
);

-- Polls
CREATE TABLE polls (
  id UUID PRIMARY KEY,
  createdBy BIGINT,
  question VARCHAR(500),
  groupId UUID,
  expiresAt TIMESTAMP,
  createdAt TIMESTAMP
);

-- Poll Responses
CREATE TABLE poll_responses (
  id UUID PRIMARY KEY,
  pollId UUID,
  userId BIGINT,
  optionIndex INT,
  createdAt TIMESTAMP
);

-- Poll Options
CREATE TABLE poll_options (
  id UUID PRIMARY KEY,
  pollId UUID,
  optionText VARCHAR(255),
  voteCount INT DEFAULT 0,
  createdAt TIMESTAMP
);
```

**API Endpoints:**
```
- POST /api/groups (create)
- GET /api/groups
- POST /api/groups/:id/join
- GET /api/groups/:id/members
- POST /api/mentorship/request
- GET /api/mentorship/requests
- POST /api/mentorship/:id/accept
- POST /api/polls (create)
- GET /api/polls/:id
- POST /api/polls/:id/vote
```

**Implementation Priority:** MEDIUM
**Effort:** 8-10 days

### 4.6 Analytics Dashboard
**Features:**
- Application tracking
- Market insights (salary trends)
- Skills demand analytics
- Industry reports

**Tech Stack:**
- Chart.js or Recharts
- Elasticsearch for analytics

**Database Changes:**
```sql
-- Application Analytics
CREATE TABLE application_analytics (
  id UUID PRIMARY KEY,
  userId BIGINT,
  jobId BIGINT,
  status VARCHAR(50),
  appliedAt TIMESTAMP,
  response_time_hours INT,
  createdAt TIMESTAMP
);

-- Market Data
CREATE TABLE market_analytics (
  id UUID PRIMARY KEY,
  metric VARCHAR(100),
  value DECIMAL(10,2),
  category VARCHAR(100),
  period VARCHAR(50), -- monthly, quarterly
  dataDate DATE,
  createdAt TIMESTAMP
);

-- Skills Analytics
CREATE TABLE skills_analytics (
  id UUID PRIMARY KEY,
  skillName VARCHAR(255),
  demandScore INT, -- 0-100
  jobCount INT,
  avgSalary DECIMAL(10,2),
  growthRate FLOAT,
  dataDate DATE,
  createdAt TIMESTAMP
);
```

**API Endpoints:**
```
- GET /api/analytics/applications
- GET /api/analytics/market-trends
- GET /api/analytics/skills-demand
- GET /api/analytics/industry-report
- GET /api/analytics/salary-trends
```

**Implementation Priority:** MEDIUM-LOW
**Effort:** 6-8 days

### 4.7 Integrations
**Features:**
- Calendar sync (Google, Outlook)
- Email integration (Gmail)
- LinkedIn import
- Payment integration

**Dependencies:**
```json
{
  "google-auth-library": "^8.8.0",
  "googleapis": "^118.0.0",
  "stripe": "^12.0.0",
  "passport": "^0.6.0",
  "passport-google-oauth20": "^2.0.0",
  "passport-linkedin-oauth2": "^2.1.1"
}
```

**Database Changes:**
```sql
-- External Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  userId BIGINT,
  service VARCHAR(100), -- google, linkedin, stripe, outlook
  accessToken VARCHAR(255),
  refreshToken VARCHAR(255),
  expiresAt TIMESTAMP,
  connectedAt TIMESTAMP,
  createdAt TIMESTAMP
);

-- Sync History
CREATE TABLE sync_history (
  id UUID PRIMARY KEY,
  userId BIGINT,
  service VARCHAR(100),
  syncType VARCHAR(100), -- calendar, contacts, emails
  status ENUM('success', 'failed'),
  errorMessage TEXT,
  createdAt TIMESTAMP
);

-- Subscription Plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  userId BIGINT,
  planType ENUM('free', 'pro', 'enterprise'),
  stripeSubscriptionId VARCHAR(255),
  status ENUM('active', 'cancelled', 'expired'),
  startDate TIMESTAMP,
  renewalDate TIMESTAMP,
  createdAt TIMESTAMP
);
```

**API Endpoints:**
```
- GET /api/auth/google/connect
- GET /api/auth/google/callback
- GET /api/auth/linkedin/connect
- POST /api/sync/calendar
- POST /api/sync/emails
- GET /api/import/linkedin-profile
- POST /api/payments/create-subscription
- POST /api/payments/update-subscription
- GET /api/payments/billing-history
```

**Implementation Priority:** MEDIUM
**Effort:** 8-10 days

---

## Implementation Timeline Summary

| Phase | Features | Duration | Dependencies |
|-------|----------|----------|--------------|
| Phase 1 | Real-time + Notifications | 2 weeks | Socket.io, Redis |
| Phase 2 | AI/ML Recommendations | 2 weeks | OpenAI, PDF parsing |
| Phase 3 | Social & Gamification | 2 weeks | React, DB schema |
| Phase 4A | PWA + Analytics | 1 week | Workbox, Chart.js |
| Phase 4B | Video Features | 2 weeks | Agora.io, AWS S3 |
| Phase 4C | Advanced Search | 1.5 weeks | Elasticsearch |
| Phase 4D | Verification | 2 weeks | IDology, Checkr APIs |
| Phase 4E | Community | 2 weeks | DB schema |
| Phase 4F | Integrations | 2 weeks | OAuth, Stripe |

**Total Estimated Time:** 14-16 weeks (4 months)

---

## Required Environment Variables

```env
# Real-time
REDIS_URL=redis://localhost:6379
SOCKET_IO_PORT=3001

# AI/ML
OPENAI_API_KEY=sk-...
HUGGING_FACE_API_KEY=...

# Video
AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...

# Verification
IDOLOGY_API_KEY=...
CHECKR_API_KEY=...

# Integrations
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Database (update from .env)
MONGODB_URI=...
POSTGRES_DB=...
```

---

## Infrastructure Requirements

1. **Hosting:** Upgrade to handle WebSocket connections (Render, Railway, Heroku)
2. **Database:** PostgreSQL or MongoDB (current SQLite insufficient)
3. **File Storage:** AWS S3 (for videos, resumes, images)
4. **Cache:** Redis (for sessions & real-time data)
5. **Search:** Elasticsearch (for advanced search)
6. **Email:** SendGrid or similar (for alerts)
7. **Video:** Agora.io account
8. **Payments:** Stripe account

---

## Quick Start by Priority

1. **Start Phase 1** - Most value, enables other features
2. **Parallel Phase 2** - High ROI, differentiates platform
3. **Do Phase 3** - Improves retention & engagement
4. **Select Phase 4** features by business needs

---

## Next Steps

1. Choose which features to start with (recommend Phase 1 + Phase 2)
2. Set up development environment with Redis
3. Create migration scripts for new database tables
4. Start building Socket.io server
5. Build AI recommendation engine
6. Implement frontend components

Would you like me to start implementing any specific phase?
