const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfilePicture } = require('../middleware/uploadMiddleware');

router.get('/profile/:username', getUserProfile);
router.put('/profile', protect, uploadProfilePicture, updateUserProfile);
router.get('/search', searchUsers);

module.exports = router;
