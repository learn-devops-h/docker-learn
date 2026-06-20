import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SongList from './components/SongList';
import MusicPlayer from './components/MusicPlayer';

const API_URL = 'http://localhost:5050/api/songs';

function App() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    audioUrl: '',
    coverImage: ''
  });

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await axios.get(API_URL);
      setSongs(response.data);
      if (response.data.length > 0 && !currentSong) {
        setCurrentSong(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      alert('Failed to load songs. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file (MP3, WAV, OGG, etc.)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('File size too large. Maximum size is 50MB.');
      return;
    }

    const formData = new FormData();
    formData.append('song', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('artist', 'Unknown Artist');

    setUploading(true);
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSongs([response.data, ...songs]);
      if (!currentSong) {
        setCurrentSong(response.data);
      }
      alert('✅ Song uploaded successfully!');
    } catch (error) {
      console.error('Error uploading song:', error);
      alert('❌ Failed to upload song: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';
    }
  };

  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!newSong.title || !newSong.artist || !newSong.audioUrl) {
      alert('Title, Artist, and Audio URL are required');
      return;
    }

    try {
      const response = await axios.post(API_URL, newSong);
      setSongs([response.data, ...songs]);
      if (!currentSong) {
        setCurrentSong(response.data);
      }
      setShowAddModal(false);
      setNewSong({ title: '', artist: '', album: '', genre: '', audioUrl: '', coverImage: '' });
      alert('✅ Song added successfully!');
    } catch (error) {
      console.error('Error adding song:', error);
      alert('❌ Failed to add song: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteSong = async (songId) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      await axios.delete(`${API_URL}/${songId}`);
      const updatedSongs = songs.filter(song => song._id !== songId);
      setSongs(updatedSongs);
      if (currentSong?._id === songId) {
        setCurrentSong(updatedSongs[0] || null);
      }
      alert('✅ Song deleted successfully');
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('❌ Failed to delete song');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'white',
        fontSize: '24px'
      }}>
        🎵 Loading Songs...
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '20px',
      color: 'white'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h1 style={{ color: '#1DB954', margin: 0 }}>🎵 Music Player</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#1DB954',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ➕ Add URL
          </button>
          <button 
            onClick={() => fileInputRef.current.click()}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            disabled={uploading}
          >
            {uploading ? '⏳ Uploading...' : '📁 Upload MP3'}
          </button>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Add Song Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#2d2d2d',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ color: '#1DB954' }}>Add Song from URL</h2>
            <form onSubmit={handleAddSong}>
              <input
                type="text"
                placeholder="Song Title *"
                value={newSong.title}
                onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                style={inputStyle}
                required
              />
              <input
                type="text"
                placeholder="Artist Name *"
                value={newSong.artist}
                onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
                style={inputStyle}
                required
              />
              <input
                type="text"
                placeholder="Album (optional)"
                value={newSong.album}
                onChange={(e) => setNewSong({...newSong, album: e.target.value})}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Genre (optional)"
                value={newSong.genre}
                onChange={(e) => setNewSong({...newSong, genre: e.target.value})}
                style={inputStyle}
              />
              <input
                type="url"
                placeholder="Audio URL * (MP3, etc.)"
                value={newSong.audioUrl}
                onChange={(e) => setNewSong({...newSong, audioUrl: e.target.value})}
                style={inputStyle}
                required
              />
              <input
                type="url"
                placeholder="Cover Image URL (optional)"
                value={newSong.coverImage}
                onChange={(e) => setNewSong({...newSong, coverImage: e.target.value})}
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={buttonStyle}>Add Song</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{...buttonStyle, background: '#666' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SongList 
        songs={songs} 
        onSelectSong={setCurrentSong} 
        currentSong={currentSong}
        onDeleteSong={handleDeleteSong}
      />
      
      {currentSong && (
        <MusicPlayer song={currentSong} />
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  border: '1px solid #555',
  backgroundColor: '#3d3d3d',
  color: 'white',
  boxSizing: 'border-box'
};

const buttonStyle = {
  background: '#1DB954',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontWeight: 'bold',
  flex: 1
};

export default App;
