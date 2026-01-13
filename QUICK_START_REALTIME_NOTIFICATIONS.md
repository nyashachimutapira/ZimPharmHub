# Real-time Notifications - Quick Start

## Overview
The Real-time Notifications system delivers job alerts, messages, pharmacy updates, and other important events to users across multiple channels.

## Setup

### 1. Database Migration
```bash
npm run migrate
```

Creates `RealtimeNotifications` table with:
- `userId` - Recipient
- `type` - Notification type
- `priority` - low|medium|high|urgent
- `isRead`, `dismissed` - Status flags
- `emailSent`, `smsSent`, `pushSent` - Delivery channels

### 2. Configuration
```javascript
// config/notifications.js
module.exports = {
  CHANNELS: {
    EMAIL: true,
    SMS: false,
    PUSH: true
  },
  RETENTION_DAYS: 90,
  EXPIRATION_DAYS: 30,
  BATCH_SIZE: 100,
  RETRY_ATTEMPTS: 3
};
```

## Core Endpoints

### Get User Notifications
```
GET /api/realtime-notifications?page=1&limit=20&read=false&type=job_alert
```

**Query Parameters:**
- `page` - Pagination
- `limit` - Results per page (max 100)
- `read` - Filter by read status
- `type` - Filter by notification type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid",
      "userId": "user-uuid",
      "type": "job_alert",
      "title": "New Job Alert",
      "message": "Clinical Pharmacist position in Harare",
      "priority": "high",
      "relatedId": "job-uuid",
      "relatedType": "job",
      "isRead": false,
      "actionUrl": "/jobs/job-uuid",
      "emailSent": true,
      "pushSent": true,
      "dismissed": false,
      "createdAt": "2024-01-10T10:30:00Z"
    }
  ],
  "unreadCount": 5,
  "pagination": { "page": 1, "limit": 20, "total": 45, "pages": 3 }
}
```

### Get Unread Count
```
GET /api/realtime-notifications/unread/count
```

**Response:**
```json
{
  "success": true,
  "unreadCount": 5
}
```

### Mark as Read
```
PATCH /api/realtime-notifications/:notificationId/read
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "notif-uuid",
    "isRead": true,
    "readAt": "2024-01-10T10:30:00Z"
  }
}
```

### Mark All as Read
```
PATCH /api/realtime-notifications/read-all
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### Dismiss Notification
```
PATCH /api/realtime-notifications/:notificationId/dismiss
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "notif-uuid",
    "dismissed": true,
    "dismissedAt": "2024-01-10T10:30:00Z"
  }
}
```

### Delete Notification
```
DELETE /api/realtime-notifications/:notificationId
```

### Get Notifications by Type
```
GET /api/realtime-notifications/type/job_alert?page=1&limit=20
```

**Supported Types:**
- job_alert
- new_message
- pharmacy_update
- mentorship_request
- cpd_reminder
- application_update
- review_posted
- system_notification

### Get Notification Preferences
```
GET /api/realtime-notifications/preferences
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobAlerts": true,
    "messages": true,
    "pharmacyUpdates": true,
    "mentorshipRequests": true,
    "cpdReminders": true,
    "applicationUpdates": true,
    "emailNotifications": true,
    "smsNotifications": false,
    "pushNotifications": true
  }
}
```

### Update Preferences
```
PATCH /api/realtime-notifications/preferences
```

**Body:**
```json
{
  "jobAlerts": true,
  "messages": true,
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true
}
```

## Usage Examples

### Example 1: Get All Unread Notifications
```javascript
const getUnreadNotifications = async () => {
  const response = await fetch(
    '/api/realtime-notifications?read=false&limit=50',
    {
      headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
    }
  );
  
  const result = await response.json();
  console.log(`Unread: ${result.unreadCount}`);
  result.data.forEach(notif => {
    console.log(`${notif.type}: ${notif.message}`);
  });
};
```

### Example 2: Mark Notifications as Read
```javascript
const markAsRead = async (notificationIds) => {
  for (const id of notificationIds) {
    await fetch(
      `/api/realtime-notifications/${id}/read`,
      {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
      }
    );
  }
};

// Or mark all at once
const markAllAsRead = async () => {
  await fetch(
    '/api/realtime-notifications/read-all',
    {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
    }
  );
};
```

### Example 3: Filter by Type
```javascript
const getJobAlerts = async () => {
  const response = await fetch(
    '/api/realtime-notifications/type/job_alert?limit=10',
    {
      headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
    }
  );
  
  const { data } = await response.json();
  return data; // Only job alerts
};
```

### Example 4: Update Notification Preferences
```javascript
const updatePreferences = async () => {
  const response = await fetch(
    '/api/realtime-notifications/preferences',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        jobAlerts: true,
        messages: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
      })
    }
  );
  
  console.log('Preferences updated');
};
```

## Notification Types

| Type | Description | When Triggered |
|------|-------------|---|
| job_alert | New matching job found | Matching job post + user filter |
| new_message | New message received | User sends message |
| pharmacy_update | Pharmacy profile updated | Pharmacy updates profile |
| mentorship_request | New mentorship request | Mentee requests mentorship |
| cpd_reminder | CPD deadline approaching | Weekly/monthly check |
| application_update | Application status changed | Status change (rejected, shortlisted) |
| review_posted | New review published | Review approved for pharmacy |
| system_notification | System announcement | Admin broadcasts message |

## Priority Levels

| Priority | Description | Actions |
|----------|-------------|---------|
| low | Non-urgent information | Email only |
| medium | Regular notifications | Email + Push |
| high | Important updates | Email + Push + SMS |
| urgent | Critical alerts | All channels + popup |

## Creating Notifications Programmatically

### Creating a Job Alert Notification
```javascript
const createJobAlert = async (userId, job) => {
  await RealtimeNotification.create({
    userId,
    type: 'job_alert',
    title: 'New Job Alert',
    message: `${job.title} position in ${job.location}`,
    category: 'jobs',
    priority: 'high',
    relatedId: job.id,
    relatedType: 'job',
    actionUrl: `/jobs/${job.id}`,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });
};
```

### Creating Application Update Notification
```javascript
const createApplicationNotification = async (userId, application) => {
  await RealtimeNotification.create({
    userId,
    type: 'application_update',
    title: 'Application Status Update',
    message: `Your application has been ${application.status}`,
    relatedId: application.id,
    relatedType: 'application',
    actionUrl: `/applications/${application.id}`,
    priority: 'medium'
  });
};
```

### Creating Mentorship Request Notification
```javascript
const createMentorshipNotification = async (mentorId, mentee) => {
  await RealtimeNotification.create({
    userId: mentorId,
    type: 'mentorship_request',
    title: 'New Mentorship Request',
    message: `${mentee.firstName} has requested you as a mentor`,
    relatedId: mentee.id,
    relatedType: 'mentorship',
    priority: 'high'
  });
};
```

## Frontend Integration

### Notification Bell Component
```javascript
const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Get unread count
    fetch('/api/realtime-notifications/unread/count', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setUnreadCount(d.unreadCount));

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetch('/api/realtime-notifications/unread/count', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => setUnreadCount(d.unreadCount));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const response = await fetch(
      '/api/realtime-notifications?limit=10',
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const result = await response.json();
    setNotifications(result.data);
  };

  return (
    <div className="notification-bell">
      <button 
        onClick={() => {
          loadNotifications();
          setShowDropdown(!showDropdown);
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="dropdown">
          {notifications.map(n => (
            <NotificationItem 
              key={n.id} 
              notification={n}
              onRead={() => markAsRead(n.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

### Notification Item Component
```javascript
const NotificationItem = ({ notification, onRead }) => {
  const icons = {
    job_alert: '💼',
    new_message: '💬',
    pharmacy_update: '🏥',
    mentorship_request: '👨‍🏫',
    cpd_reminder: '📚',
    application_update: '📋',
    review_posted: '⭐',
    system_notification: 'ℹ️'
  };

  return (
    <div 
      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
      onClick={onRead}
    >
      <span className="icon">{icons[notification.type]}</span>
      <div className="content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <small>{new Date(notification.createdAt).toRelativeTime()}</small>
      </div>
      <button className="close">✕</button>
    </div>
  );
};
```

## Notification Center Page

```javascript
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const query = filter === 'all' 
      ? `?page=${page}`
      : `?type=${filter}&page=${page}`;

    fetch(`/api/realtime-notifications${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setNotifications(d.data));
  }, [filter, page]);

  return (
    <div className="notification-center">
      <h1>Notifications</h1>

      <div className="filters">
        <button 
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('job_alert')}
          className={filter === 'job_alert' ? 'active' : ''}
        >
          Job Alerts
        </button>
        <button 
          onClick={() => setFilter('new_message')}
          className={filter === 'new_message' ? 'active' : ''}
        >
          Messages
        </button>
        {/* More filters... */}
      </div>

      <div className="notification-list">
        {notifications.map(n => (
          <NotificationItem 
            key={n.id}
            notification={n}
          />
        ))}
      </div>

      <Pagination 
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
};
```

## Channel Delivery

### Email Notifications
- Sent immediately on creation
- Only if user has email enabled
- HTML formatted
- Unsubscribe link included

### SMS Notifications
- High priority only
- Requires verified phone
- Character limited (160 chars)
- Optional feature

### Push Notifications
- Requires push service setup
- In-app or browser notification
- Mobile and desktop support

## Permissions

Users can only access their own notifications.

```javascript
if (notification.userId !== req.user.id) {
  return res.status(403).json({ error: 'Unauthorized' });
}
```

## Common Tasks

### Task: Show notification badge
```javascript
// In header component
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  const fetchCount = async () => {
    const res = await fetch(
      '/api/realtime-notifications/unread/count',
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await res.json();
    setUnreadCount(data.unreadCount);
  };

  fetchCount();
  const interval = setInterval(fetchCount, 30000);
  return () => clearInterval(interval);
}, []);

return (
  <div className="header">
    <button className="notifications">
      Notifications
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
    </button>
  </div>
);
```

### Task: Notification preferences page
```javascript
const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    fetch('/api/realtime-notifications/preferences', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setPrefs(d.data));
  }, []);

  const updatePref = async (key, value) => {
    setPrefs({ ...prefs, [key]: value });
    
    await fetch('/api/realtime-notifications/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ [key]: value })
    });
  };

  if (!prefs) return <Loading />;

  return (
    <div className="preferences">
      <h2>Notification Preferences</h2>
      
      <label>
        <input 
          type="checkbox" 
          checked={prefs.jobAlerts}
          onChange={(e) => updatePref('jobAlerts', e.target.checked)}
        />
        Job Alerts
      </label>

      <label>
        <input 
          type="checkbox" 
          checked={prefs.emailNotifications}
          onChange={(e) => updatePref('emailNotifications', e.target.checked)}
        />
        Email Notifications
      </label>

      {/* More preferences... */}
    </div>
  );
};
```

## Troubleshooting

**Q: Not receiving notifications**
A: Check preferences are enabled and notification type is not muted.

**Q: Notifications not real-time**
A: Currently polling-based. WebSocket support coming soon.

**Q: Notification didn't expire**
A: Check expiresAt field was set. Default is no expiration.

## Next Steps

1. Deploy migration
2. Create notification bell component
3. Build notification center page
4. Add preference management UI
5. Implement email sending
6. Add push notification service
7. Set up WebSocket for true real-time
8. Create notification analytics
