import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';
import './MessagesPage.css';

function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll for new messages
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/messages/conversations/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data);
      if (response.data.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/messages/conversations/${selectedConversation._id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const recipientId = selectedConversation.participants.find(
        (p) => p._id !== userId
      )?._id;

      await axios.post(
        '/api/messages/send',
        {
          conversationId: selectedConversation._id,
          sender: userId,
          recipient: recipientId,
          content: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewMessage('');
      fetchMessages();
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) return <div className="container"><p>Loading messages...</p></div>;

  return (
    <div className="messages-page">
      <div className="container">
        <h1>Messages</h1>
        <div className="messages-container">
          <div className="conversations-list">
            <h2>Conversations</h2>
            {conversations.length > 0 ? (
              <div className="conversations">
                {conversations.map((conversation) => {
                  const otherUser = conversation.participants.find(
                    (p) => p._id !== localStorage.getItem('userId')
                  );
                  return (
                    <div
                      key={conversation._id}
                      className={`conversation-item ${
                        selectedConversation?._id === conversation._id ? 'active' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="conversation-avatar">
                        {otherUser?.firstName?.[0] || 'U'}
                      </div>
                      <div className="conversation-info">
                        <h3>
                          {otherUser?.firstName} {otherUser?.lastName}
                        </h3>
                        {conversation.relatedJob && (
                          <p className="conversation-job">
                            Re: {conversation.relatedJob.title}
                          </p>
                        )}
                        <p className="conversation-preview">
                          {conversation.lastMessage?.content?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No conversations yet</p>
            )}
          </div>

          <div className="messages-area">
            {selectedConversation ? (
              <>
                <div className="messages-header">
                  {(() => {
                    const otherUser = selectedConversation.participants.find(
                      (p) => p._id !== localStorage.getItem('userId')
                    );
                    return (
                      <h2>
                        {otherUser?.firstName} {otherUser?.lastName}
                      </h2>
                    );
                  })()}
                </div>
                <div className="messages-list">
                  {messages.map((message) => {
                    const isOwn = message.sender._id === localStorage.getItem('userId');
                    return (
                      <div
                        key={message._id}
                        className={`message ${isOwn ? 'own' : 'other'}`}
                      >
                        <div className="message-content">
                          <p>{message.content}</p>
                          <span className="message-time">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form className="message-input-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                  />
                  <button type="submit" className="send-button">
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              <div className="no-conversation">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;

