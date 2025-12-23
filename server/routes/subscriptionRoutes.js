const express = require('express');
const {
  subscribe,
  unsubscribe,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionStats,
  exportEmails
} = require('../controllers/subscriptionController');
const { validateSubscription } = require('../middleware/validator');
const { subscriptionLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/', subscriptionLimiter, validateSubscription, subscribe);
router.get('/unsubscribe/:token', unsubscribe);

// Admin routes (add auth middleware when ready)
router.get('/', getSubscriptions);
router.get('/stats/summary', getSubscriptionStats);
router.get('/export/emails', exportEmails);
router.get('/:id', getSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

module.exports = router;
