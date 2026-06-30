const Follow = require('../models/Follow');
const User = require('../models/User');

// @desc    Toggle Follow / Unfollow a user
// @route   POST /api/follow/:userId
// @access  Private
const toggleFollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User to follow not found' });
    }

    // Check if relationship already exists
    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId
    });

    if (existingFollow) {
      // Unfollow
      await Follow.deleteOne({ _id: existingFollow._id });
      res.json({
        success: true,
        isFollowing: false,
        message: `Successfully unfollowed ${targetUser.username}`
      });
    } else {
      // Follow
      await Follow.create({
        follower: currentUserId,
        following: targetUserId
      });
      res.json({
        success: true,
        isFollowing: true,
        message: `Successfully followed ${targetUser.username}`
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get followers list of a user
// @route   GET /api/follow/:userId/followers
// @access  Public
const getUserFollowers = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const followersRaw = await Follow.find({ following: userId }).populate(
      'follower',
      'name username profilePicture bio'
    );

    // Format list to return user profiles directly
    const followers = followersRaw.map((f) => f.follower).filter(Boolean);

    res.json({
      success: true,
      followers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get following list of a user
// @route   GET /api/follow/:userId/following
// @access  Public
const getUserFollowing = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const followingRaw = await Follow.find({ follower: userId }).populate(
      'following',
      'name username profilePicture bio'
    );

    // Format list to return user profiles directly
    const following = followingRaw.map((f) => f.following).filter(Boolean);

    res.json({
      success: true,
      following
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleFollowUser,
  getUserFollowers,
  getUserFollowing
};
