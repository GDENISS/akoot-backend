const express = require('express');
const {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');
const { validateContact } = require('../middleware/validator');
const { contactLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/', contactLimiter, validateContact, createContact);

// Admin routes (add auth middleware when ready)
router.get('/', getContacts);
router.get('/stats/summary', getContactStats);
router.get('/:id', getContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;
