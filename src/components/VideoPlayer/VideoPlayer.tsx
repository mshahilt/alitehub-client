import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  noControls?: boolean;
  className?: string;
  onLoadedData?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  poster, 
  noControls,
  className = "",
  onLoadedData 
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(!noControls);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [_, setIsFullscreen] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
      setCurrentTime(video.currentTime);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
    };

    const handleLoadedData = () => {
      setIsBuffering(false);
      if (onLoadedData) {
        onLoadedData();
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', () => setDuration(video.duration));
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('loadeddata', handleLoadedData);

    // Auto-play and loop if noControls is true
    if (noControls) {
      video.play().catch(err => console.error('Auto-play failed:', err));
      video.loop = true;
    }

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [noControls, onLoadedData]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = (): void => {
    if (!videoRef.current || noControls) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (): void => {
    if (!videoRef.current || noControls) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (noControls) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedValue = (x / rect.width) * 100;
    const newTime = (clickedValue / 100) * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setProgress(clickedValue);
  };

  const skipTime = (seconds: number): void => {
    if (!videoRef.current || noControls) return;
    
    const newTime = videoRef.current.currentTime + seconds;
    videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
  };

  const toggleFullscreen = async (): Promise<void> => {
    if (!containerRef.current || noControls) return;

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${!noControls ? 'group' : ''} w-full max-w-4xl mx-auto rounded-lg overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto"
        onClick={noControls ? undefined : togglePlay}
        controls={false}
        preload="auto"
        playsInline
      />
      
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}
      
      {/* Controls overlay - only show if noControls is false */}
      {!noControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Progress bar */}
          <div 
            className="w-full h-1 bg-gray-600 cursor-pointer mb-4"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => skipTime(-10)} 
                className="p-1 hover:text-blue-400"
                type="button"
              >
                <SkipBack size={20} />
              </button>
              
              <button 
                onClick={togglePlay} 
                className="p-1 hover:text-blue-400"
                type="button"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button 
                onClick={() => skipTime(10)} 
                className="p-1 hover:text-blue-400"
                type="button"
              >
                <SkipForward size={20} />
              </button>

              <button 
                onClick={toggleMute} 
                className="p-1 hover:text-blue-400"
                type="button"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button 
              onClick={toggleFullscreen} 
              className="p-1 hover:text-blue-400"
              type="button"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;