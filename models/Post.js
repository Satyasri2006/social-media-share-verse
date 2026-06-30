const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [1000, 'Caption cannot exceed 1000 characters']
    },
    mediaType: {
      type: String,
      enum: ['text', 'image', 'video'],
      default: 'text'
    },
    mediaUrl: {
      type: String,
      default: ''
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Post', postSchema);
