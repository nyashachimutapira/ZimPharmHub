const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const router = express.Router();

// Get all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.params.userId,
    })
      .populate('participants', 'firstName lastName profilePicture')
      .populate('relatedJob', 'title')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
});

// Get or create conversation
router.post('/conversations', async (req, res) => {
  try {
    const { userId1, userId2, jobId } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] },
      ...(jobId && { relatedJob: jobId }),
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId1, userId2],
        relatedJob: jobId,
      });
      await conversation.save();
    }

    await conversation.populate('participants', 'firstName lastName profilePicture');
    if (jobId) {
      await conversation.populate('relatedJob', 'title');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating conversation', error: error.message });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'firstName lastName profilePicture')
      .populate('recipient', 'firstName lastName')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send a message
router.post('/send', async (req, res) => {
  try {
    const { conversationId, sender, recipient, content } = req.body;

    const message = new Message({
      conversationId,
      sender,
      recipient,
      content,
    });

    await message.save();

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    await message.populate('sender', 'firstName lastName profilePicture');
    await message.populate('recipient', 'firstName lastName');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Mark messages as read
router.put('/conversations/:conversationId/read', async (req, res) => {
  try {
    const { userId } = req.body;
    await Message.updateMany(
      { conversationId: req.params.conversationId, recipient: userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating messages', error: error.message });
  }
});

module.exports = router;

