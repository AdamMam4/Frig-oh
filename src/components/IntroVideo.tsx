import React, { useEffect, useRef, useState } from 'react';

interface IntroVideoProps {
  onIntroComplete: () => void;
  videoSrc?: string;
}

export default function IntroVideo({ onIntroComplete, videoSrc = '/intro_frigo.mp4' }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const log = (...args: unknown[]) => console.log('[IntroVideo]', ...args);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;

    const onLoadedMetadata = () => log('loadedmetadata', { duration: video.duration, readyState: video.readyState });
    const onLoadedData = () => log('loadeddata', { duration: video.duration, readyState: video.readyState });
    const onCanPlay = () => log('canplay');
    const onPlay = () => log('play');
    const onError = (e: Event) => {
      log('error', e);
      // short delay, then proceed to content
      window.setTimeout(triggerEnd, 800);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('play', onPlay);
    video.addEventListener('error', onError);

    // Fallback: if the video doesn't start, proceed after 12s
    const fallback = window.setTimeout(() => {
      triggerEnd();
    }, 12000);

    // Try to start the video immediately
    const playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {
        // On some mobile browsers, autoplay can fail if not muted
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    return () => {
      window.clearTimeout(fallback);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('error', onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerEnd = () => {
    if (hasEnded) return;
    setHasEnded(true);
    setShowFlash(true);
    setTimeout(() => {
      onIntroComplete();
    }, 400);
  };

  const handleEnded = () => {
    triggerEnd();
  };

  const handleSkip = () => {
    triggerEnd();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        background: '#000',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        muted
        playsInline
        autoPlay
        preload="auto"
        onEnded={handleEnded}
      />

      {/* White flash at the end of the intro */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#fff',
          opacity: showFlash ? 1 : 0,
          transition: 'opacity 0.25s ease-out',
          pointerEvents: 'none',
        }}
      />

      {/* Skip button for safety */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          padding: '10px 14px',
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.6)',
          background: 'rgba(0,0,0,0.4)',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
          zIndex: 1001,
        }}
      >
        Skip
      </button>
    </div>
  );
}
