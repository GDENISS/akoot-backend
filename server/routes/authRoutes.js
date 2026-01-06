const express = require('express');
const {
  register,
  login,
  getMe,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);

// Admin-only route for creating new users
// You can call this once to create your first admin, then protect it
router.post('/register', register); // TODO: Add protect middleware after creating first user

module.exports = router;
