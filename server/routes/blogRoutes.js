const express = require('express');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  getCategories,
  getPopularTags
} = require('../controllers/blogController');

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/categories/list', getCategories);
router.get('/tags/popular', getPopularTags);
router.get('/:id', getBlog);
router.put('/:id/like', likeBlog);

// Admin routes (add auth middleware when ready)
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;
