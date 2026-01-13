import io from 'socket.io-client';

let socket = null;
let listeners = {};

// Initialize WebSocket connection
export const initializeSocket = (token, serverUrl = 'http://localhost:3001') => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(serverUrl, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  // Handle connection events
  socket.on('connect', () => {
    console.log('✅ Connected to WebSocket server');
    emit('socket_connected', { timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from WebSocket server');
    emit('socket_disconnected', { timestamp: new Date() });
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
    emit('socket_error', error);
  });

  // Listen for notifications
  socket.on('notification', (notification) => {
    emit('notification_received', notification);
  });

  // Listen for messages
  socket.on('message_received', (message) => {
    emit('message_received', message);
  });

  // Listen for typing indicators
  socket.on('user_typing', (data) => {
    emit('user_typing', data);
  });

  // Listen for profile views
  socket.on('profile_viewed', (data) => {
    emit('profile_viewed', data);
  });

  // Listen for user status changes
  socket.on('user_status', (data) => {
    emit('user_status_changed', data);
  });

  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Get socket instance
export const getSocket = () => socket;

// Register event listener
export const addEventListener = (event, callback) => {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(callback);

  // Return unsubscribe function
  return () => {
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  };
};

// Emit local event
const emit = (event, data) => {
  if (listeners[event]) {
    listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in listener for ${event}:`, error);
      }
    });
  }
};

// Send message via WebSocket
export const sendMessage = (recipientId, message, messageType = 'text') => {
  if (socket && socket.connected) {
    socket.emit('send_message', {
      recipientId,
      message,
      messageType,
      timestamp: new Date(),
    });
  } else {
    console.warn('❌ Socket not connected. Cannot send message.');
  }
};

// Emit typing indicator
export const sendTypingIndicator = (recipientId) => {
  if (socket && socket.connected) {
    socket.emit('typing', {
      recipientId,
      timestamp: new Date(),
    });
  }
};

// Emit user online status
export const sendOnlineStatus = () => {
  if (socket && socket.connected) {
    socket.emit('user_online');
  }
};

// Emit user offline status
export const sendOfflineStatus = () => {
  if (socket && socket.connected) {
    socket.emit('user_offline');
  }
};

// Log view activity (profile, job, etc)
export const logActivity = async (action, targetUserId, jobId, metadata = {}) => {
  try {
    const response = await fetch('/api/realtime/activity/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        action,
        targetUserId,
        jobId,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to log activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Get notifications
export const getNotifications = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value);
    });

    const response = await fetch(
      `/api/realtime/notifications?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message };
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await fetch('/api/realtime/notifications/unread/count', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { success: false, unreadCount: 0 };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(
      `/api/realtime/notifications/${notificationId}/read`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await fetch('/api/realtime/notifications/mark-all-read', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// Get chat messages with user
export const getChatMessages = async (recipientId, limit = 50, offset = 0) => {
  try {
    const response = await fetch(
      `/api/realtime/chat/${recipientId}?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch chat messages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return { success: false, error: error.message };
  }
};

// Get conversations list
export const getConversations = async () => {
  try {
    const response = await fetch('/api/realtime/chat/conversations', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: error.message };
  }
};

// Send chat message via REST API (backup method)
export const sendChatMessage = async (recipientId, message, messageType = 'text', attachmentUrl = null) => {
  try {
    const response = await fetch('/api/realtime/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        recipientId,
        message,
        messageType,
        attachmentUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
};

// Get activity feed
export const getActivityFeed = async (limit = 20, offset = 0) => {
  try {
    const response = await fetch(
      `/api/realtime/activity-feed?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch activity feed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return { success: false, error: error.message };
  }
};

export default {
  initializeSocket,
  disconnectSocket,
  getSocket,
  addEventListener,
  sendMessage,
  sendTypingIndicator,
  sendOnlineStatus,
  sendOfflineStatus,
  logActivity,
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getChatMessages,
  getConversations,
  sendChatMessage,
  getActivityFeed,
};
