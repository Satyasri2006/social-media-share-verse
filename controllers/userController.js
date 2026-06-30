const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const jwt = require('jsonwebtoken');

// @desc    Get user profile by username
// @route   GET /api/users/profile/:username
// @access  Public (Optional auth to check follow status)
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get post, follower, and following counts
    const postsCount = await Post.countDocuments({ user: user._id });
    const followersCount = await Follow.countDocuments({ following: user._id });
    const followingCount = await Follow.countDocuments({ follower: user._id });

    // Check if the requesting user is following this user
    let isFollowing = false;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const followExists = await Follow.findOne({
          follower: decoded.id,
          following: user._id
        });
        if (followExists) {
          isFollowing = true;
        }
      } catch (err) {
        // Token verification failed, but we still return profile details
        isFollowing = false;
      }
    }

    res.json({
      success: true,
      profile: {
        _id: user._id,
        name: user.name,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
        postsCount,
        followersCount,
        followingCount,
        isFollowing
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, username, bio } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    if (username && username.toLowerCase() !== user.username) {
      // Check if username already exists
      const usernameExists = await User.findOne({ username: username.toLowerCase() });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
      user.username = username.toLowerCase();
    }

    // Handle new profile picture upload
    if (req.file) {
      user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by name or username
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json({ success: true, users: [] });
    }

    // Escape special regex characters in user input for security
    const safeQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    const users = await User.find({
      $or: [
        { name: { $regex: safeQuery, $options: 'i' } },
        { username: { $regex: safeQuery, $options: 'i' } }
      ]
    }).select('name username profilePicture bio');

    res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  searchUsers
};
