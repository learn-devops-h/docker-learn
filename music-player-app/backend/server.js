const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Song = require('./models/Song');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// MongoDB connection
mongoose.connect('mongodb://mongodb:27017/musicplayer', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ============== API Routes ==============

// Get all songs
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single song
app.get('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json(song);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a song with URL (for online streaming)
app.post('/api/songs', async (req, res) => {
  try {
    const { title, artist, album, genre, duration, coverImage, audioUrl } = req.body;
    
    if (!title || !artist || !audioUrl) {
      return res.status(400).json({ error: 'Title, artist, and audioUrl are required' });
    }

    const newSong = new Song({
      title,
      artist,
      album: album || '',
      genre: genre || '',
      duration: duration || 'Unknown',
      coverImage: coverImage || 'https://picsum.photos/200/200?random=' + Math.random(),
      audioUrl,
      isLocalFile: false
    });

    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Upload local MP3 file
app.post('/api/songs/upload', upload.single('song'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, artist, album, genre } = req.body;
    
    // Generate URL for the uploaded file
    const audioUrl = `http://localhost:5050/uploads/${req.file.filename}`;

    const newSong = new Song({
      title: title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      artist: artist || 'Unknown Artist',
      album: album || '',
      genre: genre || '',
      duration: 'Unknown',
      coverImage: 'https://picsum.photos/200/200?random=' + Math.random(),
      audioUrl: audioUrl,
      isLocalFile: true
    });

    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a song
app.delete('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // If it's a local file, delete it from filesystem
    if (song.isLocalFile && song.audioUrl) {
      const filename = song.audioUrl.split('/uploads/')[1];
      if (filename) {
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await Song.findByIdAndDelete(req.params.id);
    res.json({ message: 'Song deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Music Player API is running' });
});

app.listen(PORT, () => {
  console.log(`🎵 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadDir}`);
});
