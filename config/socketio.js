const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const redis = require('redis');

let io;
let redisClient;
let redisAdapter;

// Initialize Socket.io with Redis adapter for scalability
const initializeSocketIO = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Redis connection for session persistence
  if (process.env.REDIS_URL) {
    try {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        legacyMode: true,
      });

      redisClient.connect().catch(err => {
        console.error('❌ Redis connection failed:', err.message);
        console.log('⚠️  Falling back to in-memory mode (not recommended for production)');
      });

      redisClient.on('connect', () => console.log('✅ Redis connected'));
      redisClient.on('error', (err) => console.error('❌ Redis error:', err.message));
    } catch (err) {
      console.error('❌ Redis initialization failed:', err.message);
      console.log('⚠️  Socket.io will work without Redis persistence');
    }
  }

  // Middleware for Socket.io authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication failed: no token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      next(new Error('Authentication failed: invalid token'));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userId} connected: ${socket.id}`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Track online users
    socket.on('user_online', () => {
      io.emit('user_status', {
        userId: socket.userId,
        status: 'online',
        timestamp: new Date(),
      });
    });

    socket.on('user_offline', () => {
      io.emit('user_status', {
        userId: socket.userId,
        status: 'offline',
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User ${socket.userId} disconnected: ${socket.id}`);
      io.emit('user_status', {
        userId: socket.userId,
        status: 'offline',
        timestamp: new Date(),
      });
    });
  });

  return io;
};

// Emit notification to specific user
const sendNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
};

// Emit notification to multiple users
const sendNotificationToUsers = (userIds, notification) => {
  if (io) {
    userIds.forEach(userId => {
      io.to(`user:${userId}`).emit('notification', notification);
    });
  }
};

// Broadcast to all connected users
const broadcastNotification = (notification) => {
  if (io) {
    io.emit('notification', notification);
  }
};

// Get Socket.io instance
const getIO = () => io;

module.exports = {
  initializeSocketIO,
  getIO,
  sendNotificationToUser,
  sendNotificationToUsers,
  broadcastNotification,
};
