const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Use appropriate model based on database mode
let User;
if (process.env.USE_MONGODB === 'true') {
  User = require('../models/User'); // MongoDB Mongoose model
} else {
  User = require('../models-sequelize/User'); // Sequelize model
  var UniqueConstraintError = require('sequelize').UniqueConstraintError;
}

const router = express.Router();

// Test database connection endpoint (for debugging)
router.get('/test-db', async (req, res) => {
  try {
    const userCount = await User.count();
    const sampleUser = await User.findOne({ limit: 1 });
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      userCount,
      sampleUserEmail: sampleUser?.email || 'No users found',
      hasComparePasswordMethod: typeof User.prototype.comparePassword === 'function'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message,
      errorName: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType } = req.body;

    if (!firstName || !lastName || !email || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists (Sequelize)
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (Sequelize hooks handle password hashing)
    user = await User.create({
      firstName,
      lastName,
      email,
      password,
      userType,
    });

    // Create JWT token
    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key', {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(400).json({ message: 'User already exists', error: error.message });
    }
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user (Sequelize) - normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user has a password (shouldn't happen, but safety check)
    if (!user.password) {
      console.error('User found but has no password:', user.id);
      return res.status(500).json({ message: 'Account error. Please contact support.' });
    }

    // Check password
    let isMatch = false;
    try {
      isMatch = await user.comparePassword(password);
    } catch (compareError) {
      console.error('Error comparing password:', compareError);
      return res.status(500).json({ message: 'Error verifying password. Please try again.' });
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key', {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      message: 'Error logging in. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

// Password reset request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If the email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    // For now, we'll just return the token (you should implement email sending)
    res.json({
      message: 'If the email exists, a password reset link has been sent.',
      resetToken, // Remove this in production - only send via email
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing password reset', error: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (Sequelize hooks will hash on save)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

module.exports = router;
