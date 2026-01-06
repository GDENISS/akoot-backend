const express = require('express');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  trackView,
  likeBlog,
  getCategories,
  getPopularTags
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/categories/list', getCategories);
router.get('/tags/popular', getPopularTags);
router.get('/:id', getBlog);
router.post('/:slug/view', trackView);
router.post('/:slug/like', likeBlog);

// Admin routes (protected with authentication)
router.post('/', protect, authorize('admin', 'editor'), createBlog);
router.put('/:id', protect, authorize('admin', 'editor'), updateBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);

module.exports = router;
