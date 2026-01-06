const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register/Create new admin user
// @route   POST /api/auth/register
// @access  Private (Only for existing admins to create new users)
exports.register = asyncHandler(async (req, res, next) => {
  const { username, password, role } = req.body;

  // Validate input
  if (!username || !password) {
    return next(new ErrorResponse('Please provide username and password', 400));
  }

  // Check if user already exists
  const userExists = await User.findOne({ username });
  if (userExists) {
    return next(new ErrorResponse('Username already exists', 400));
  }

  // Create user
  const user = await User.create({
    username,
    password,
    role: role || 'admin'
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return next(new ErrorResponse('Please provide username and password', 400));
  }

  // Find user and include password (since it's excluded by default)
  const user = await User.findOne({ username }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if user is active
  if (!user.active) {
    return next(new ErrorResponse('Account has been deactivated', 401));
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    }
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      role: user.role,
      lastLogin: user.lastLogin
    }
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new password', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    data: { token }
  });
});
