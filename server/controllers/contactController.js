const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const emailService = require('../utils/emailServiceZoho');

// @desc    Create new contact submission
// @route   POST /api/contacts
// @access  Public
exports.createContact = asyncHandler(async (req, res, next) => {
  const { name, email, phone, subject, message, company } = req.body;

  // Get IP address and user agent
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');

  const contact = await Contact.create({
    name,
    email,
    phone,
    subject,
    message,
    company,
    ipAddress,
    userAgent
  });

  // Send email notification to admin (don't wait for it to complete)
  emailService.sendContactNotification({
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    subject: contact.subject,
    message: contact.message,
    company: contact.company
  }).catch(err => console.error('Failed to send contact notification:', err.message));

  res.status(201).json({
    success: true,
    message: 'Your message has been received. We will get back to you soon!',
    data: contact
  });
});

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private (Admin)
exports.getContacts = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 20, 
    status,
    search,
    sort = '-createdAt'
  } = req.query;

  const query = {};

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Search in name, email, subject
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const contacts = await Contact.find(query)
    .sort(sort)
    .limit(parseInt(limit))
    .skip(skip)
    .select('-__v');

  const total = await Contact.countDocuments(query);

  res.status(200).json({
    success: true,
    count: contacts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: contacts
  });
});

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private (Admin)
exports.getContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id: ${req.params.id}`, 404));
  }

  // Update status to 'read' if it's 'new'
  if (contact.status === 'new') {
    contact.status = 'read';
    await contact.save();
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Update contact status
// @route   PUT /api/contacts/:id
// @access  Private (Admin)
exports.updateContact = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;

  let contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id: ${req.params.id}`, 404));
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;
  
  if (status === 'replied' && contact.status !== 'replied') {
    updateData.repliedAt = new Date();
  }

  contact = await Contact.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private (Admin)
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id: ${req.params.id}`, 404));
  }

  await contact.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get contact statistics
// @route   GET /api/contacts/stats/summary
// @access  Private (Admin)
exports.getContactStats = asyncHandler(async (req, res, next) => {
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const total = await Contact.countDocuments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await Contact.countDocuments({ createdAt: { $gte: today } });

  res.status(200).json({
    success: true,
    data: {
      total,
      today: todayCount,
      byStatus: stats
    }
  });
});
