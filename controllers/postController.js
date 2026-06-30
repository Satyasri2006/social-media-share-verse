const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const fs = require('fs');
const path = require('path');

// Helper to check if file mimetype is video
const isVideoMime = (mimetype) => {
  return mimetype.startsWith('video/');
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { caption } = req.body;
    let mediaType = 'text';
    let mediaUrl = '';

    // Handle uploaded media file
    if (req.file) {
      mediaUrl = `/uploads/posts/${req.file.filename}`;
      mediaType = isVideoMime(req.file.mimetype) ? 'video' : 'image';
    }

    const post = await Post.create({
      user: req.user.id,
      caption: caption || '',
      mediaType,
      mediaUrl
    });

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'name username profilePicture'
    );

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (chronological feed)
// @route   GET /api/posts
// @access  Private
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePicture');

    // Add isLiked field dynamically based on current user ID
    const formattedPosts = posts.map((post) => {
      const isLiked = post.likes.includes(req.user.id);
      return {
        ...post.toObject(),
        isLiked,
        likesCount: post.likes.length
      };
    });

    res.json({
      success: true,
      posts: formattedPosts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts by a specific user
// @route   GET /api/posts/user/:username
// @access  Public
const getUserPosts = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePicture');

    // If logged in, add isLiked flag
    let currentUserId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (err) {
        // Continue without logged in user ID
      }
    }

    const formattedPosts = posts.map((post) => {
      const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
      return {
        ...post.toObject(),
        isLiked,
        likesCount: post.likes.length
      };
    });

    res.json({
      success: true,
      posts: formattedPosts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post details
// @route   GET /api/posts/:id
// @access  Public
const getSinglePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'user',
      'name username profilePicture'
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Get comments count
    const commentsCount = await Comment.countDocuments({ post: post._id });

    // Check if liked by logged in user
    let isLiked = false;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isLiked = post.likes.includes(decoded.id);
      } catch (err) {
        // Continue
      }
    }

    res.json({
      success: true,
      post: {
        ...post.toObject(),
        isLiked,
        likesCount: post.likes.length,
        commentsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit post caption
// @route   PUT /api/posts/:id
// @access  Private (Owner only)
const editPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }

    const { caption } = req.body;
    post.caption = caption || '';
    await post.save();

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'name username profilePicture'
    );

    res.json({
      success: true,
      message: 'Post updated successfully',
      post: populatedPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Owner only)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    // Delete post media file locally if it exists
    if (post.mediaUrl) {
      const filePath = path.join(__dirname, '..', post.mediaUrl);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting media file:', err.message);
        }
      });
    }

    // Delete comments belonging to this post
    await Comment.deleteMany({ post: post._id });

    // Delete the post
    await Post.findByIdAndDelete(post._id);

    res.json({
      success: true,
      message: 'Post and associated comments deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like / unlike post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike post
      post.likes.pull(req.user.id);
    } else {
      // Like post
      post.likes.push(req.user.id);
    }

    await post.save();

    res.json({
      success: true,
      isLiked: !isLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getUserPosts,
  getSinglePost,
  editPost,
  deletePost,
  toggleLikePost
};
