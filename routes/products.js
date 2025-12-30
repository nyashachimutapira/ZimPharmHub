const express = require('express');
const Product = require('../models/Product');
const Newsletter = require('../models/Newsletter');
const { notifySubscribers } = require('../utils/mailer');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    let filter = { available: true };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = minPrice;
      if (maxPrice) filter['price.amount'].$lte = maxPrice;
    }
    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    }

    const products = await Product.find(filter).populate('pharmacy', 'name').sort({ featured: -1, rating: -1 }).limit(50);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('pharmacy', 'name email phone');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, description, category, price, stock, manufacturer, dosage } = req.body;
    const pharmacyId = req.headers['user-id'];

    const product = new Product({
      name,
      description,
      category,
      price,
      stock,
      manufacturer,
      dosage,
      pharmacy: pharmacyId,
    });

    await product.save();

    // Notify newsletter subscribers about new product
    try {
      const productUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/products/${product._id}`;
      const subject = `New product in store: ${product.name}`;
      const text = `A new product is available: ${product.name}. View: ${productUrl}`;
      const html = `<p>New product available at ${product.pharmacy || 'a pharmacy'}:</p><h3>${product.name}</h3><p>${product.description || ''}</p><p><a href="${productUrl}">View product</a></p>`;
      notifySubscribers('products', subject, text, html);
    } catch (err) {
      console.warn('Failed to notify subscribers about new product:', err.message);
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Add review
router.post('/:id/review', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.headers['user-id'];
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.reviews.push({ userId, rating, comment });
    const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    product.rating = avgRating;

    await product.save();
    res.json({ message: 'Review added', product });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

module.exports = router;
