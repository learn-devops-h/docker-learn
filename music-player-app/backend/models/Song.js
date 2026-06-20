const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  album: {
    type: String,
    default: ''
  },
  genre: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: 'Unknown'
  },
  coverImage: {
    type: String,
    default: 'https://picsum.photos/200/200?random=1'
  },
  audioUrl: {
    type: String,
    required: true,
  },
  isLocalFile: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Song', songSchema);
