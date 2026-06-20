import React, { useRef, useState, useEffect } from 'react';

function MusicPlayer({ song }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    // Load new song when it changes
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log('Play error:', err));
      }
    }
  }, [song]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log('Play error:', err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
      setCurrentTime(formatTime(current));
      if (total) {
        setDuration(formatTime(total));
      }
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#282828',
      color: 'white',
      padding: '15px 20px',
      boxShadow: '0 -2px 20px rgba(0,0,0,0.8)',
      zIndex: 999
    }}>
      <audio 
        ref={audioRef}
        src={song.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Audio error:', e);
          alert('Error loading audio. Please check the URL or file.');
        }}
      />
      
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div 
          style={{
            width: '100%',
            height: '4px',
            background: '#535353',
            borderRadius: '2px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
          onClick={handleProgressClick}
        >
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: '#1DB954',
            borderRadius: '2px',
            transition: 'width 0.1s'
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Song Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '180px' }}>
            <img 
              src={song.coverImage || 'https://picsum.photos/60/60?random=1'} 
              alt={song.title}
              style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '8px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.src = 'https://picsum.photos/60/60?random=' + Math.random();
              }}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{song.title}</div>
              <div style={{ color: '#b3b3b3', fontSize: '12px' }}>{song.artist}</div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, justifyContent: 'center' }}>
            <button 
              onClick={togglePlay}
              style={{
                background: '#1DB954',
                color: 'white',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isPlaying ? '⏸' : '▶️'}
            </button>
            
            <span style={{ fontSize: '12px', color: '#b3b3b3', minWidth: '70px' }}>
              {currentTime} / {duration}
            </span>
          </div>

          {/* Volume Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '100px' }}>
            <span style={{ fontSize: '18px' }}>🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              style={{
                width: '80px',
                height: '4px',
                background: '#535353',
                borderRadius: '2px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;
