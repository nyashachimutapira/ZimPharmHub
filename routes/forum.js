const express = require('express');
const ForumPost = require('../models/ForumPost');
const router = express.Router();

// Get all forum posts
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await ForumPost.find(filter)
      .populate('author', 'firstName lastName profilePicture')
      .populate('comments.author', 'firstName lastName profilePicture')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'firstName lastName profilePicture')
      .populate('comments.author', 'firstName lastName profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Create post
router.post('/', async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const userId = req.headers['user-id'];

    const post = new ForumPost({
      title,
      content,
      category,
      tags,
      author: userId,
    });

    await post.save();
    await post.populate('author', 'firstName lastName profilePicture');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Add comment
router.post('/:id/comment', async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.headers['user-id'];
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({ author: userId, content });
    await post.save();
    await post.populate('comments.author', 'firstName lastName profilePicture');

    res.json({ message: 'Comment added', post });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// Like post
router.post('/:id/like', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ message: 'Like toggled', post });
  } catch (error) {
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
});

module.exports = router;
