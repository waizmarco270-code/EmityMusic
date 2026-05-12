import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { usePlayerStore } from '../store/usePlayerStore';
import { db } from '../lib/db';

export function AudioEngine() {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    setProgress, 
    setDuration, 
    playNext,
    setPlaying,
    seekTo
  } = usePlayerStore();
  
  const playerRef = useRef<any>(null);
  const seekInterval = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // User gesture detector - broader range of events
  useEffect(() => {
    const handleGesture = () => {
      setHasInteracted(true);
      window.removeEventListener('mousedown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
    window.addEventListener('mousedown', handleGesture);
    window.addEventListener('touchstart', handleGesture);
    return () => {
      window.removeEventListener('mousedown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, []);

  // Handle manual seek
  useEffect(() => {
    if (seekTo !== null && playerRef.current) {
      playerRef.current.seekTo(seekTo, true);
      usePlayerStore.setState({ seekTo: null });
    }
  }, [seekTo]);

  const startSeekTimer = () => {
    stopSeekTimer();
    seekInterval.current = window.setInterval(() => {
      if (playerRef.current && isPlaying) {
        const time = playerRef.current.getCurrentTime();
        if (typeof time === 'number') {
          setProgress(time);
        }
      }
    }, 1000);
  };

  const stopSeekTimer = () => {
    if (seekInterval.current) {
      clearInterval(seekInterval.current);
      seekInterval.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying && isReady) {
      playerRef.current?.playVideo();
      startSeekTimer();
    } else {
      playerRef.current?.pauseVideo();
      stopSeekTimer();
    }
    return () => stopSeekTimer();
  }, [isPlaying, isReady]);

  useEffect(() => {
    if (playerRef.current && isReady) {
      playerRef.current.setVolume(volume * 100);
    }
  }, [volume, isReady]);

  // Handle Media Session API
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      artwork: [
        { src: currentTrack.artwork, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => setPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
    navigator.mediaSession.setActionHandler('nexttrack', () => usePlayerStore.getState().playNext());
    navigator.mediaSession.setActionHandler('previoustrack', () => usePlayerStore.getState().playPrevious());
  }, [currentTrack]);

  // Add to history
  useEffect(() => {
    if (currentTrack) {
      db.history.add({ ...currentTrack, playedAt: Date.now() } as any);
    }
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  return (
    <div 
      className="fixed bottom-0 right-0 w-0 h-0 opacity-0 pointer-events-none z-[-1] overflow-hidden" 
      aria-hidden="true"
    >
      <YouTube
        videoId={currentTrack.id}
        opts={{
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            origin: window.location.origin,
            playsinline: 1,
            enablejsapi: 1
          },
        }}
        onReady={(event) => {
          playerRef.current = event.target;
          setIsReady(true);
          setDuration(event.target.getDuration());
          if (isPlaying) {
             event.target.playVideo();
          }
        }}
        onStateChange={(event) => {
          if (event.data === 1) {
            setPlaying(true);
            setDuration(event.target.getDuration());
          } else if (event.data === 2) {
            setPlaying(false);
          } else if (event.data === 0) {
            playNext();
          }
        }}
        onError={(e) => {
          console.error('YouTube Error:', e);
          if (e.data !== 1) {
            setTimeout(playNext, 2000);
          }
        }}
        className="w-full h-full"
      />
    </div>
  );
}
