# Phase 1: Real-Time Features Implementation Guide

## Overview
Phase 1 implements real-time notifications, chat, and activity feed using WebSocket technology with Socket.io.

## Files Created

### Backend Files
1. **config/socketio.js** - Socket.io server configuration
2. **models-sequelize/ActivityLog.js** - Activity logging model
3. **models-sequelize/ChatMessage.js** - Chat messages model
4. **models-sequelize/RealtimeNotification.js** - Notifications model
5. **routes/realtime.js** - API endpoints for real-time features
6. **migrations/20250112-create-realtime-tables.js** - Database migration

### Frontend Files
1. **client/src/services/realtimeService.js** - WebSocket client & API service

### Updated Files
1. **package.json** - Added Socket.io dependencies
2. **server.js** - Integrated Socket.io server

---

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `socket.io@^4.7.2` - WebSocket server
- `socket.io-client@^4.7.2` - WebSocket client
- `redis@^4.6.0` - Session storage (optional)
- `socket.io-redis@^6.1.1` - Redis adapter (optional)

### 2. Update Environment Variables
Add these to your `.env` file:

```env
# Real-time Features
REDIS_URL=redis://localhost:6379
SOCKET_IO_PORT=3001
CLIENT_URL=http://localhost:3000

# JWT (already should exist)
JWT_SECRET=your-secret-key
```

### 3. Run Database Migration
```bash
npx sequelize-cli db:migrate
```

This creates three new tables:
- `activity_logs` - User activities
- `chat_messages` - Chat messages
- `realtime_notifications` - Real-time notifications

### 4. Start Redis (Optional but Recommended)
For local development with in-memory fallback:
```bash
# Using Docker
docker run -d -p 6379:6379 redis

# Or install Redis locally and run
redis-server
```

If Redis is not available, Socket.io will use in-memory storage (suitable for development).

### 5. Start the Server
```bash
npm run dev
```

You should see:
```
✅ Server running on port 3001
✅ WebSocket available at ws://localhost:3001
```

---

## API Endpoints

### Notifications
```
GET    /api/realtime/notifications                    - Get all notifications
GET    /api/realtime/notifications/unread/count       - Get unread count
PUT    /api/realtime/notifications/:id/read           - Mark as read
PUT    /api/realtime/notifications/mark-all-read      - Mark all as read
DELETE /api/realtime/notifications/:id                - Delete notification
DELETE /api/realtime/notifications/clear-read         - Clear read notifications
```

### Chat
```
GET    /api/realtime/chat/:recipientId                - Get messages with user
GET    /api/realtime/chat/conversations               - Get all conversations
POST   /api/realtime/chat/send                        - Send message
DELETE /api/realtime/chat/:messageId                  - Delete message
```

### Activity Feed
```
GET    /api/realtime/activity-feed                    - Get activity (who viewed profile)
POST   /api/realtime/activity/log                     - Log user activity
```

---

## WebSocket Events

### Listening for Events

```javascript
import realtimeService from '@/services/realtimeService';

// Initialize socket connection
const token = localStorage.getItem('token');
realtimeService.initializeSocket(token);

// Listen for notifications
realtimeService.addEventListener('notification_received', (notification) => {
  console.log('New notification:', notification);
});

// Listen for messages
realtimeService.addEventListener('message_received', (message) => {
  console.log('New message:', message);
});

// Listen for profile views
realtimeService.addEventListener('profile_viewed', (data) => {
  console.log('Someone viewed your profile:', data);
});

// Listen for typing indicators
realtimeService.addEventListener('user_typing', (data) => {
  console.log('User is typing:', data);
});

// Listen for connection status
realtimeService.addEventListener('socket_connected', () => {
  console.log('✅ Connected to server');
});

realtimeService.addEventListener('socket_disconnected', () => {
  console.log('❌ Disconnected from server');
});
```

### Emitting Events

```javascript
import realtimeService from '@/services/realtimeService';

// Send message (real-time)
realtimeService.sendMessage(recipientId, 'Hello!', 'text');

// Send typing indicator
realtimeService.sendTypingIndicator(recipientId);

// Update online status
realtimeService.sendOnlineStatus();
realtimeService.sendOfflineStatus();

// Log activity (profile view)
realtimeService.logActivity('view_profile', targetUserId);
```

---

## Component Examples

### Notifications Component
```jsx
import React, { useState, useEffect } from 'react';
import realtimeService from '@/services/realtimeService';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load existing notifications
    realtimeService.getNotifications({ isRead: false }).then(data => {
      setNotifications(data.notifications);
      setUnreadCount(data.unread);
    });

    // Listen for new notifications
    const unsubscribe = realtimeService.addEventListener(
      'notification_received',
      (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    );

    return unsubscribe;
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    await realtimeService.markNotificationAsRead(notificationId);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="notifications">
      <h3>Notifications ({unreadCount})</h3>
      {notifications.map(notif => (
        <div key={notif.id} className="notification-item">
          <h4>{notif.title}</h4>
          <p>{notif.content}</p>
          <button onClick={() => handleMarkAsRead(notif.id)}>
            Mark as read
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationCenter;
```

### Chat Component
```jsx
import React, { useState, useEffect } from 'react';
import realtimeService from '@/services/realtimeService';

function ChatWindow({ recipientId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Load chat history
    realtimeService.getChatMessages(recipientId).then(data => {
      setMessages(data.messages);
    });

    // Listen for new messages
    const unsubscribe = realtimeService.addEventListener(
      'message_received',
      (message) => {
        if (message.senderId === recipientId) {
          setMessages(prev => [...prev, message]);
        }
      }
    );

    // Listen for typing indicators
    const typingUnsub = realtimeService.addEventListener('user_typing', (data) => {
      if (data.userId === recipientId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      unsubscribe();
      typingUnsub();
    };
  }, [recipientId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      realtimeService.sendMessage(recipientId, newMessage);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          message: newMessage,
          senderId: localStorage.getItem('userId'),
          createdAt: new Date(),
        },
      ]);
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    realtimeService.sendTypingIndicator(recipientId);
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <p>{msg.message}</p>
            <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
        {isTyping && <p className="typing">User is typing...</p>}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onInput={handleTyping}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;
```

### Activity Feed Component
```jsx
import React, { useState, useEffect } from 'react';
import realtimeService from '@/services/realtimeService';

function ActivityFeed() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Load activity feed
    realtimeService.getActivityFeed().then(data => {
      setActivities(data.activities);
    });

    // Listen for new activities (profile views)
    const unsubscribe = realtimeService.addEventListener(
      'profile_viewed',
      (data) => {
        setActivities(prev => [
          {
            id: Date.now(),
            action: 'view_profile',
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            createdAt: data.viewedAt,
          },
          ...prev,
        ]);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <div className="activity-feed">
      <h3>Activity Feed</h3>
      {activities.map(activity => (
        <div key={activity.id} className="activity-item">
          <img src={activity.userAvatar} alt={activity.userName} />
          <div>
            <p>
              <strong>{activity.userName}</strong> {activity.action === 'view_profile' && 'viewed your profile'}
            </p>
            <span>{new Date(activity.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityFeed;
```

---

## Features Implemented

### 1. Real-Time Notifications
- Job alerts delivered instantly
- Application status updates
- Achievement notifications
- System alerts
- Push to specific users or broadcast

### 2. Live Chat
- One-on-one messaging
- Typing indicators
- Message history
- File/image attachments (ready for implementation)
- Read receipts

### 3. Activity Feed
- Profile view tracking
- Job save tracking
- Action history
- Real-time updates

### 4. User Status
- Online/offline status
- Last seen tracking (ready for implementation)

---

## Database Schema

### activity_logs
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  userId BIGINT NOT NULL,
  action VARCHAR(100) NOT NULL,
  targetUserId BIGINT,
  jobId BIGINT,
  jobTitle VARCHAR(255),
  metadata JSON,
  createdAt TIMESTAMP DEFAULT NOW
);
```

### chat_messages
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  senderId BIGINT NOT NULL,
  senderName VARCHAR(255) NOT NULL,
  senderAvatar VARCHAR(255),
  recipientId BIGINT NOT NULL,
  message TEXT NOT NULL,
  messageType ENUM('text','file','image','link') DEFAULT 'text',
  attachmentUrl VARCHAR(255),
  attachmentType VARCHAR(50),
  isRead BOOLEAN DEFAULT false,
  readAt TIMESTAMP,
  isEdited BOOLEAN DEFAULT false,
  editedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW
);
```

### realtime_notifications
```sql
CREATE TABLE realtime_notifications (
  id UUID PRIMARY KEY,
  userId BIGINT NOT NULL,
  type ENUM('job_alert','job_viewed','message_received','profile_viewed',...) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  relatedUserId BIGINT,
  relatedJobId BIGINT,
  relatedId VARCHAR(255),
  actionUrl VARCHAR(255),
  actionLabel VARCHAR(100) DEFAULT 'View',
  icon VARCHAR(50),
  isRead BOOLEAN DEFAULT false,
  readAt TIMESTAMP,
  isDismissed BOOLEAN DEFAULT false,
  dismissedAt TIMESTAMP,
  priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
  createdAt TIMESTAMP DEFAULT NOW,
  expiresAt TIMESTAMP
);
```

---

## Testing

### Test Real-Time Connection
```javascript
// In browser console
import realtimeService from '@/services/realtimeService';

const token = localStorage.getItem('token');
realtimeService.initializeSocket(token);

// Listen for connection
realtimeService.addEventListener('socket_connected', () => {
  console.log('✅ Connected!');
});
```

### Test Notifications
```javascript
// Send test notification (from backend)
const { sendNotificationToUser } = require('./config/socketio');

sendNotificationToUser(userId, {
  type: 'job_alert',
  title: 'New Job Match',
  content: 'A new job matching your profile',
});
```

### Test Chat
```javascript
// Open two browser tabs, log in as different users
// Use the chat component to send messages
// Should appear in real-time in both tabs
```

---

## Production Deployment

### 1. Redis Setup
- Deploy Redis instance (AWS ElastiCache, Heroku Redis, etc.)
- Update `REDIS_URL` environment variable

### 2. WebSocket Configuration
- Configure for horizontal scaling with Redis adapter
- Setup CORS properly for production domain
- Enable secure WebSocket (WSS) with SSL certificate

### 3. Environment Variables
```env
# Production
NODE_ENV=production
REDIS_URL=redis://your-redis-instance
CLIENT_URL=https://yourdomain.com
JWT_SECRET=your-strong-secret
```

### 4. Nginx Configuration (if using)
```nginx
location /socket.io {
  proxy_pass http://your-app:3001;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
}
```

---

## Next Steps

1. **Test Phase 1** - Verify all endpoints work
2. **Start Phase 2** - AI/ML features (recommendations, resume parsing)
3. **Add Frontend Components** - Build complete UI
4. **Performance Optimization** - Caching, message compression
5. **Add Email Notifications** - Send email copies of important notifications

---

## Troubleshooting

### Socket Connection Fails
- Check `JWT_SECRET` is set in `.env`
- Verify token is being passed in auth header
- Check browser console for CORS errors
- Ensure WebSocket port (3001) is accessible

### Messages Not Appearing
- Check Redis connection: `redis-cli ping`
- Verify recipient is connected to socket
- Check browser console for errors
- Review server logs

### High Latency/Lag
- Enable Redis for better session management
- Use message compression
- Optimize database queries
- Monitor server CPU/memory

---

## Support
For issues or questions, refer to:
- Socket.io Docs: https://socket.io/docs/
- Sequelize Docs: https://sequelize.org/
- Project Thread: https://ampcode.com/threads/T-019bb345-bcb8-7043-9622-0105741a212b
