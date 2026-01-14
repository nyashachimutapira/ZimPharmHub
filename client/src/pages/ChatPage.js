import React, { useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { initializeSocket } from '../services/realtimeService';

const ChatPage = () => {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (token) {
        initializeSocket(token);
      }
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to access messages.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
