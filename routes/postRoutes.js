const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getUserPosts,
  getSinglePost,
  editPost,
  deletePost,
  toggleLikePost
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { uploadPostMedia } = require('../middleware/uploadMiddleware');

router.post('/', protect, uploadPostMedia, createPost);
router.get('/', protect, getAllPosts);
router.get('/user/:username', getUserPosts);
router.get('/:id', getSinglePost);
router.put('/:id', protect, editPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLikePost);

module.exports = router;
