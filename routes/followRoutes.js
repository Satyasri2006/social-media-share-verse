const express = require('express');
const router = express.Router();
const { toggleFollowUser, getUserFollowers, getUserFollowing } = require('../controllers/followController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:userId', protect, toggleFollowUser);
router.get('/:userId/followers', getUserFollowers);
router.get('/:userId/following', getUserFollowing);

module.exports = router;
