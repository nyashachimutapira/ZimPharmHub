# Phase 1 Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment Variables
Add to your `.env` file:
```env
# Real-time
REDIS_URL=redis://localhost:6379
SOCKET_IO_PORT=3001
CLIENT_URL=http://localhost:3000

# JWT (should already exist)
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Step 3: Run Database Migration
```bash
npx sequelize-cli db:migrate
```

### Step 4: Start Server
```bash
npm run dev
```

Server will start on `http://localhost:3001`

---

## ✅ Test Real-Time Connection

### Browser Console Test
```javascript
// 1. Open DevTools Console
// 2. Copy and paste:

import('../src/services/realtimeService.js').then(module => {
  const realtimeService = module.default;
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token found. Please login first.');
    return;
  }
  
  realtimeService.initializeSocket(token);
  
  realtimeService.addEventListener('socket_connected', () => {
    console.log('✅ WebSocket connected successfully!');
  });
  
  realtimeService.addEventListener('notification_received', (notif) => {
    console.log('📦 Notification received:', notif);
  });
  
  console.log('🔌 WebSocket initialized. Waiting for notifications...');
});
```

### Expected Output
```
🔌 WebSocket initialized. Waiting for notifications...
✅ WebSocket connected successfully!
```

---

## 📨 Test Notifications API

### Get All Notifications
```bash
curl -X GET http://localhost:3001/api/realtime/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Unread Count
```bash
curl -X GET http://localhost:3001/api/realtime/notifications/unread/count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark as Read
```bash
curl -X PUT http://localhost:3001/api/realtime/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💬 Test Chat API

### Get Chat History
```bash
curl -X GET http://localhost:3001/api/realtime/chat/RECIPIENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Send Message
```bash
curl -X POST http://localhost:3001/api/realtime/chat/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": 123,
    "message": "Hello!",
    "messageType": "text"
  }'
```

### Get Conversations
```bash
curl -X GET http://localhost:3001/api/realtime/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Test Activity Feed

### Log Activity
```bash
curl -X POST http://localhost:3001/api/realtime/activity/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "view_profile",
    "targetUserId": 123,
    "metadata": {"source": "search"}
  }'
```

### Get Activity Feed
```bash
curl -X GET http://localhost:3001/api/realtime/activity-feed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Advanced Testing

### Using Postman
1. Create collection "ZimPharmHub Phase 1"
2. Add requests for each endpoint
3. Set Authorization header: `Bearer YOUR_TOKEN`
4. Test each endpoint

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Create requests for each endpoint
3. Set Authorization header
4. Test

---

## 🔍 Debugging

### Check Socket Connection
```bash
# In server logs, you should see:
✅ User 123 connected: abc123def
```

### Enable Socket.io Debugging
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: { token: 'YOUR_TOKEN' },
  debug: true  // Enable logging
});
```

### Check Database Tables
```bash
psql DATABASE_URL
\dt realtime*
\dt chat_messages
\dt activity_logs
```

---

## 🐛 Common Issues

### Issue: "Authentication failed: no token provided"
**Solution:** Make sure you're passing token in socket auth
```javascript
realtimeService.initializeSocket(token);
```

### Issue: "Cannot connect to Redis"
**Solution:** Redis is optional. Socket.io will work in-memory for development.

### Issue: "CORS error in browser"
**Solution:** Check CLIENT_URL matches your frontend URL in `.env`
```env
CLIENT_URL=http://localhost:3000
```

### Issue: "WebSocket connection fails"
**Solution:** 
1. Check server is running: `npm run dev`
2. Check port 3001 is available
3. Check firewall isn't blocking WebSocket

---

## 📚 Frontend Integration

### In React Component
```jsx
import { useEffect, useState } from 'react';
import realtimeService from '@/services/realtimeService';

function Dashboard() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initialize socket on mount
    const token = localStorage.getItem('token');
    realtimeService.initializeSocket(token);

    // Listen for notifications
    const unsubscribe = realtimeService.addEventListener(
      'notification_received',
      (notification) => {
        setNotifications(prev => [notification, ...prev]);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
}
```

---

## 📁 Project Structure

```
ZimPharmHub/
├── config/
│   └── socketio.js              ← WebSocket config
├── models-sequelize/
│   ├── ActivityLog.js           ← Activity model
│   ├── ChatMessage.js           ← Chat model
│   └── RealtimeNotification.js  ← Notification model
├── routes/
│   └── realtime.js              ← API endpoints
├── migrations/
│   └── 20250112-create-realtime-tables.js
├── client/src/services/
│   └── realtimeService.js       ← Frontend service
├── PHASE1_REALTIME_SETUP.md     ← Complete guide
└── QUICK_START_PHASE1.md        ← This file
```

---

## ✨ What's Working

✅ WebSocket connection & authentication
✅ Real-time notifications
✅ Live chat with messages
✅ Activity logging (profile views)
✅ User online/offline status
✅ Message read receipts
✅ Notification management

## 🔨 What's Next

[ ] Frontend React components
[ ] Notification bell with badge count
[ ] Chat sidebar with conversations
[ ] Activity feed widget
[ ] Push notifications
[ ] Message search
[ ] Chat group support

---

## 📞 Need Help?

1. Check `PHASE1_REALTIME_SETUP.md` for detailed docs
2. Review server logs for errors
3. Check browser console for client-side errors
4. Read Socket.io docs: https://socket.io/docs/

---

## 🚀 Next Phase

After Phase 1 is complete:
1. Start Phase 2: AI/ML Features
2. Implement job recommendations
3. Add resume parsing
4. Build salary predictions

See `FEATURE_ROADMAP_2025.md` for complete roadmap.

---

Last Updated: January 12, 2025
Status: Phase 1 Ready for Testing
