const mongoose = require('mongoose');

const emailSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  name: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionType: {
    type: String,
    enum: ['newsletter', 'blog_updates', 'product_updates', 'all'],
    default: 'all'
  },
  preferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    categories: [{
      type: String
    }]
  },
  source: {
    type: String,
    enum: ['website', 'blog', 'landing_page', 'popup', 'other'],
    default: 'website'
  },
  verificationToken: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  unsubscribedAt: {
    type: Date
  },
  unsubscribeToken: {
    type: String,
    unique: true,
    sparse: true
  },
  ipAddress: {
    type: String
  },
  lastEmailSent: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
// Note: email index is created by unique: true, no need for manual index
emailSubscriptionSchema.index({ isActive: 1, verified: 1 });
emailSubscriptionSchema.index({ subscriptionType: 1, isActive: 1 });

// Method to generate unsubscribe token
emailSubscriptionSchema.methods.generateUnsubscribeToken = function() {
  const crypto = require('crypto');
  this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  return this.unsubscribeToken;
};

module.exports = mongoose.model('EmailSubscription', emailSubscriptionSchema);
