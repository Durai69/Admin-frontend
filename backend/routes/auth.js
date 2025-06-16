const express = require('express');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../database/init');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Login endpoint
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        detail: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    const db = getDatabase();

    db.get(
      'SELECT * FROM users WHERE username = ? AND is_active = 1',
      [username],
      async (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ detail: 'Internal server error' });
        }

        if (!user) {
          return res.status(401).json({ detail: 'Invalid username or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ detail: 'Invalid username or password' });
        }

        // Store user in session
        req.session.user = {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          department: user.department,
          role: user.role,
          is_active: user.is_active
        };

        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
        
        db.close();
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ detail: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Verify authentication endpoint
router.get('/verify_auth', (req, res) => {
  if (req.session.user) {
    res.json({
      isAuthenticated: true,
      user: req.session.user
    });
  } else {
    res.status(401).json({
      isAuthenticated: false,
      user: null
    });
  }
});

module.exports = router;