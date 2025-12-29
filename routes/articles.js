const express = require('express');
const Article = require('../models/Article');
const router = express.Router();

// Get all articles
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { published: true };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const articles = await Article.find(filter)
      .populate('author', 'firstName lastName')
      .sort({ publishedAt: -1 })
      .limit(50);

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching articles', error: error.message });
  }
});

// Get article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate(
      'author',
      'firstName lastName'
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching article', error: error.message });
  }
});

// Create article
router.post('/', async (req, res) => {
  try {
    const { title, slug, content, excerpt, category, tags, featuredImage } = req.body;
    const userId = req.headers['user-id'];

    const article = new Article({
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      author: userId,
    });

    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Error creating article', error: error.message });
  }
});

// Publish article
router.put('/:id/publish', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { published: true, publishedAt: new Date() },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Error publishing article', error: error.message });
  }
});

module.exports = router;
