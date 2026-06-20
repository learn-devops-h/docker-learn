import React from 'react';

function SongList({ songs, onSelectSong, currentSong, onDeleteSong }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <h2 style={{ color: '#1DB954', marginBottom: '20px' }}>🎶 Song Library ({songs.length})</h2>
      {songs.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          backgroundColor: '#2d2d2d',
          borderRadius: '10px'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No songs yet!</p>
          <p style={{ color: '#888' }}>Click "Upload MP3" to add local files or "Add URL" to stream online songs.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {songs.map((song) => (
            <li 
              key={song._id}
              style={{
                padding: '15px',
                marginBottom: '10px',
                background: currentSong?._id === song._id ? '#1DB95430' : '#2d2d2d',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
                border: currentSong?._id === song._id ? '2px solid #1DB954' : '2px solid transparent',
                position: 'relative'
              }}
              onClick={() => onSelectSong(song)}
            >
              <img 
                src={song.coverImage || 'https://picsum.photos/200/200?random=1'} 
                alt={song.title}
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '8px', 
                  marginRight: '15px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = 'https://picsum.photos/200/200?random=' + Math.random();
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{song.title}</div>
                <div style={{ color: '#888', fontSize: '14px' }}>{song.artist}</div>
                {song.isLocalFile && (
                  <span style={{ 
                    fontSize: '11px', 
                    color: '#4CAF50',
                    backgroundColor: '#4CAF5020',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    marginTop: '5px',
                    display: 'inline-block'
                  }}>
                    📁 Local File
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>{song.duration}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSong(song._id);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ff4444',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#ff444420'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongList;
