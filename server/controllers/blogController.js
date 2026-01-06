const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    tags, 
    search,
    published,
    featured,
    sort = '-createdAt'
  } = req.query;

  const query = {};

  // Filter by published status (default to only published for public)
  if (published !== undefined) {
    query.published = published === 'true';
  } else {
    query.published = true;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by tags
  if (tags) {
    query.tags = { $in: tags.split(',') };
  }

  // Filter by featured
  if (featured !== undefined) {
    query.featured = featured === 'true';
  }

  // Search in title, content, and tags
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const blogs = await Blog.find(query)
    .sort(sort)
    .limit(parseInt(limit))
    .skip(skip)
    .select('-__v');

  const total = await Blog.countDocuments(query);

  res.status(200).json({
    success: true,
    count: blogs.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: blogs
  });
});

// @desc    Get single blog by ID or slug
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlog = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  // Check if id is a valid MongoDB ObjectId or slug
  let blog;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    blog = await Blog.findById(id);
  } else {
    blog = await Blog.findOne({ slug: id });
  }

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id/slug: ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Track blog view
// @route   POST /api/blogs/:slug/view
// @access  Public
exports.trackView = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  
  const blog = await Blog.findOne({ slug });

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with slug: ${slug}`, 404));
  }

  // Get user's IP address
  const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];

  // Check if this IP has already viewed this blog
  if (!blog.viewedBy.includes(userIp)) {
    blog.viewedBy.push(userIp);
    blog.views += 1;
    await blog.save();
  }

  res.status(200).json({
    success: true,
    data: { views: blog.views }
  });
});

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Admin)
exports.createBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.create(req.body);

  res.status(201).json({
    success: true,
    data: blog
  });
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
exports.updateBlog = asyncHandler(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id: ${req.params.id}`, 404));
  }

  blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id: ${req.params.id}`, 404));
  }

  await blog.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Like/Unlike a blog (toggle)
// @route   POST /api/blogs/:slug/like
// @access  Public
exports.likeBlog = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  
  const blog = await Blog.findOne({ slug });

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with slug: ${slug}`, 404));
  }

  // Get user's IP address
  const userIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];

  // Toggle like status
  const hasLiked = blog.likedBy.includes(userIp);
  
  if (hasLiked) {
    // Unlike: remove IP and decrement count
    blog.likedBy = blog.likedBy.filter(ip => ip !== userIp);
    blog.likes = Math.max(0, blog.likes - 1);
  } else {
    // Like: add IP and increment count
    blog.likedBy.push(userIp);
    blog.likes += 1;
  }

  await blog.save();

  res.status(200).json({
    success: true,
    data: { 
      likes: blog.likes,
      isLiked: !hasLiked
    }
  });
});

// @desc    Get blog categories
// @route   GET /api/blogs/categories/list
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Blog.distinct('category', { published: true });

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get popular tags
// @route   GET /api/blogs/tags/popular
// @access  Public
exports.getPopularTags = asyncHandler(async (req, res, next) => {
  const tags = await Blog.aggregate([
    { $match: { published: true } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  res.status(200).json({
    success: true,
    data: tags
  });
});
