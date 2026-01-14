import React, { useState, useEffect, useRef } from 'react';
import {
  getChatMessages,
  sendChatMessage,
  getConversations,
  addEventListener,
} from '../services/realtimeService';

const ChatWindow = ({ initialRecipientId = null, onClose }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(
    initialRecipientId
  );
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Get current user from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();

    // Subscribe to message events
    const unsubscribe = addEventListener('message_received', (message) => {
      if (
        selectedConversation &&
        (message.senderId === selectedConversation ||
          message.recipientId === selectedConversation)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await getConversations();
      if (response.success) {
        setConversations(response.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (recipientId) => {
    setIsLoading(true);
    try {
      const response = await getChatMessages(recipientId, 50, 0);
      if (response.success) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !selectedConversation) {
      return;
    }

    const messageText = messageInput;
    setMessageInput('');
    setIsSending(true);

    try {
      const response = await sendChatMessage(selectedConversation, messageText);

      if (response.success) {
        const newMessage = {
          id: response.message.id,
          senderId: currentUser.id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          senderAvatar: currentUser.profilePicture,
          message: messageText,
          messageType: 'text',
          createdAt: new Date(),
          isRead: false,
        };
        setMessages((prev) => [...prev, newMessage]);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore input on error
      setMessageInput(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (msgs) => {
    const grouped = {};
    msgs.forEach((msg) => {
      const date = formatDate(msg.createdAt);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    return grouped;
  };

  if (!currentUser?.id) {
    return (
      <div className="w-full h-96 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <p className="text-gray-500">Please log in to use chat.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white rounded-lg shadow-xl flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Messages</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:opacity-80"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.userId}
                onClick={() => setSelectedConversation(conv.userId)}
                className={`p-3 border-b cursor-pointer transition ${
                  selectedConversation === conv.userId
                    ? 'bg-blue-100 border-blue-300'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {conv.userId.toString().slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      User #{conv.userId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 border-b">
              <h4 className="text-lg font-semibold">User #{selectedConversation}</h4>
              <p className="text-sm opacity-90">Online</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div>
                  {Object.entries(groupMessagesByDate(messages)).map(
                    ([date, msgs]) => (
                      <div key={date}>
                        <div className="flex justify-center my-4">
                          <span className="text-xs bg-gray-300 text-gray-700 px-3 py-1 rounded-full">
                            {date}
                          </span>
                        </div>
                        {msgs.map((msg) => (
                          <div
                            key={msg.id}
                            className={`mb-4 flex ${
                              msg.senderId === currentUser.id
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.senderId === currentUser.id
                                  ? 'bg-blue-500 text-white rounded-br-none'
                                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                              }`}
                            >
                              <p className="break-words">{msg.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.senderId === currentUser.id
                                    ? 'text-blue-100'
                                    : 'text-gray-500'
                                }`}
                              >
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-gray-200 flex gap-2"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || isSending}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
