const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      cb(null, path.join(__dirname, '../uploads/profiles'));
    } else if (file.fieldname === 'media') {
      cb(null, path.join(__dirname, '../uploads/posts'));
    } else {
      cb(null, path.join(__dirname, '../uploads'));
    }
  },
  filename: (req, file, cb) => {
    // Generate safe unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp|mp4|mov|webm|mkv/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpg, jpeg, png, gif, webp) and videos (mp4, mov, webm, mkv) are allowed!'));
};

// Multer upload configurations
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB maximum size limit
});

const uploadProfilePicture = upload.single('profilePicture');
const uploadPostMedia = upload.single('media');

module.exports = {
  uploadProfilePicture,
  uploadPostMedia
};
