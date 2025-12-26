const EmailSubscription = require('../models/EmailSubscription');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const emailService = require('../utils/emailServiceSendGrid');

// @desc    Subscribe to email list
// @route   POST /api/subscriptions
// @access  Public
exports.subscribe = asyncHandler(async (req, res, next) => {
  const { email, name, subscriptionType, source } = req.body;

  // Check if email already exists
  const existingSubscription = await EmailSubscription.findOne({ email });

  if (existingSubscription) {
    if (existingSubscription.isActive) {
      return next(new ErrorResponse('This email is already subscribed', 400));
    } else {
      // Reactivate subscription
      existingSubscription.isActive = true;
      existingSubscription.unsubscribedAt = undefined;
      if (name) existingSubscription.name = name;
      if (subscriptionType) existingSubscription.subscriptionType = subscriptionType;
      await existingSubscription.save();

      return res.status(200).json({
        success: true,
        message: 'Successfully reactivated your subscription!',
        data: existingSubscription
      });
    }
  }

  // Get IP address
  const ipAddress = req.ip || req.connection.remoteAddress;

  // Create new subscription
  const subscription = await EmailSubscription.create({
    email,
    name,
    subscriptionType: subscriptionType || 'all',
    source: source || 'website',
    ipAddress,
    verified: true, // Set to false if you want email verification
    verifiedAt: new Date()
  });

  // Generate unsubscribe token
  subscription.generateUnsubscribeToken();
  await subscription.save();

  // Send notification emails (don't wait for them to complete)
  emailService.sendSubscriptionNotification({
    email: subscription.email,
    name: subscription.name,
    subscriptionType: subscription.subscriptionType,
    source: subscription.source
  }).catch(err => console.error('Failed to send admin notification:', err.message));

  // Send welcome email to subscriber
  emailService.sendWelcomeEmail(subscription.email, subscription.name)
    .catch(err => console.error('Failed to send welcome email:', err.message));

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to our mailing list!',
    data: subscription
  });
});

// @desc    Unsubscribe from email list
// @route   GET /api/subscriptions/unsubscribe/:token
// @access  Public
exports.unsubscribe = asyncHandler(async (req, res, next) => {
  const subscription = await EmailSubscription.findOne({
    unsubscribeToken: req.params.token
  });

  if (!subscription) {
    return next(new ErrorResponse('Invalid unsubscribe link', 400));
  }

  subscription.isActive = false;
  subscription.unsubscribedAt = new Date();
  await subscription.save();

  res.status(200).json({
    success: true,
    message: 'Successfully unsubscribed from our mailing list'
  });
});

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private (Admin)
exports.getSubscriptions = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 20, 
    isActive,
    subscriptionType,
    verified,
    search,
    sort = '-createdAt'
  } = req.query;

  const query = {};

  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Filter by subscription type
  if (subscriptionType) {
    query.subscriptionType = subscriptionType;
  }

  // Filter by verified status
  if (verified !== undefined) {
    query.verified = verified === 'true';
  }

  // Search in email and name
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const subscriptions = await EmailSubscription.find(query)
    .sort(sort)
    .limit(parseInt(limit))
    .skip(skip)
    .select('-__v -verificationToken');

  const total = await EmailSubscription.countDocuments(query);

  res.status(200).json({
    success: true,
    count: subscriptions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: subscriptions
  });
});

// @desc    Get single subscription
// @route   GET /api/subscriptions/:id
// @access  Private (Admin)
exports.getSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await EmailSubscription.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorResponse(`Subscription not found with id: ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: subscription
  });
});

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private (Admin)
exports.updateSubscription = asyncHandler(async (req, res, next) => {
  let subscription = await EmailSubscription.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorResponse(`Subscription not found with id: ${req.params.id}`, 404));
  }

  subscription = await EmailSubscription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: subscription
  });
});

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private (Admin)
exports.deleteSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await EmailSubscription.findById(req.params.id);

  if (!subscription) {
    return next(new ErrorResponse(`Subscription not found with id: ${req.params.id}`, 404));
  }

  await subscription.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get subscription statistics
// @route   GET /api/subscriptions/stats/summary
// @access  Private (Admin)
exports.getSubscriptionStats = asyncHandler(async (req, res, next) => {
  const total = await EmailSubscription.countDocuments();
  const active = await EmailSubscription.countDocuments({ isActive: true });
  const inactive = await EmailSubscription.countDocuments({ isActive: false });
  
  const byType = await EmailSubscription.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$subscriptionType',
        count: { $sum: 1 }
      }
    }
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await EmailSubscription.countDocuments({ 
    createdAt: { $gte: today },
    isActive: true 
  });

  res.status(200).json({
    success: true,
    data: {
      total,
      active,
      inactive,
      today: todayCount,
      byType
    }
  });
});

// @desc    Export email list
// @route   GET /api/subscriptions/export/emails
// @access  Private (Admin)
exports.exportEmails = asyncHandler(async (req, res, next) => {
  const { subscriptionType, isActive = 'true' } = req.query;
  
  const query = { isActive: isActive === 'true', verified: true };
  
  if (subscriptionType) {
    query.subscriptionType = subscriptionType;
  }

  const subscriptions = await EmailSubscription.find(query)
    .select('email name subscriptionType')
    .sort('email');

  const emails = subscriptions.map(sub => ({
    email: sub.email,
    name: sub.name || '',
    type: sub.subscriptionType
  }));

  res.status(200).json({
    success: true,
    count: emails.length,
    data: emails
  });
});
