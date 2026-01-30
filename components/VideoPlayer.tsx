import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Settings,
  SkipBack,
  SkipForward,
  Loader2,
  X,
  Check,
  ArrowLeft,
  ChevronsRight,
  ChevronsLeft,
  Shuffle,
  Repeat,
  Monitor,
  AlertTriangle
} from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  youtubeId: string;
  title: string;
  onClose: () => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeId, title, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<number | null>(null);

  // Load YouTube API
  useEffect(() => {
    setIsPlaylist(youtubeId.startsWith('PL'));
    setPlayerError(null);
    setIsLoading(true);

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
    };
  }, [youtubeId]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowLeft':
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          toggleTheaterMode();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          if (isFullscreen) toggleFullscreen();
          else onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, duration, isTheaterMode]); 

  const initializePlayer = () => {
    // Safety check to prevent duplicate initialization
    if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy(); } catch(e) {}
    }

    const isPL = youtubeId.startsWith('PL');
    const playerConfig: any = {
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        fs: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    };

    if (isPL) {
        playerConfig.playerVars.listType = 'playlist';
        playerConfig.playerVars.list = youtubeId;
    } else {
        playerConfig.videoId = youtubeId;
    }

    playerRef.current = new window.YT.Player('youtube-player', playerConfig);
  };

  const onPlayerReady = (event: any) => {
    setIsLoading(false);
    setDuration(event.target.getDuration());
    event.target.playVideo();
  };

  const onPlayerError = (event: any) => {
    setIsLoading(false);
    let msg = "An unexpected error occurred.";
    // YouTube Error Codes
    switch (Number(event.data)) {
        case 2:
            msg = "Invalid video ID parameter.";
            break;
        case 5:
            msg = "The requested content cannot be played in an HTML5 player.";
            break;
        case 100:
            msg = "The video requested was not found or is private.";
            break;
        case 101:
        case 150:
            msg = "The owner of the requested video does not allow it to be played in embedded players.";
            break;
        default:
            msg = "Unable to load video. Please check your network connection.";
    }
    setPlayerError(msg);
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startProgressTracking();
    } else {
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const startProgressTracking = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = window.setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        const loaded = playerRef.current.getVideoLoadedFraction();
        
        setCurrentTime(current);
        setDuration(total);
        setProgress((current / total) * 100);
        setBuffered(loaded * 100);
      }
    }, 250); // Update more frequently for smoother UI
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const togglePlay = () => {
    if (playerError) return;
    if (playerRef.current && playerRef.current.getPlayerState) {
        const state = playerRef.current.getPlayerState();
        if (state === window.YT.PlayerState.PLAYING) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playerError) return;
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    playerRef.current.seekTo(newTime, true);
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playerError) return;
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    playerRef.current.setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      playerRef.current.unMute();
    }
    if (newVolume === 0) {
      setIsMuted(true);
      playerRef.current.mute();
    }
  };

  const toggleMute = () => {
    if (playerError) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume || 100);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (playerError) return;
    playerRef.current.setPlaybackRate(rate);
    setPlaybackRate(rate);
    // Don't close menu immediately for better UX
  };
  
  const toggleShuffle = () => {
    if (playerError) return;
    if (playerRef.current && playerRef.current.setShuffle) {
        const newState = !isShuffle;
        playerRef.current.setShuffle(newState);
        setIsShuffle(newState);
    }
  };

  const toggleLoop = () => {
    if (playerError) return;
    if (playerRef.current && playerRef.current.setLoop) {
        const newState = !isLoop;
        playerRef.current.setLoop(newState);
        setIsLoop(newState);
    }
  };

  const skip = (seconds: number) => {
    if (playerError) return;
    if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const newTime = Math.min(Math.max(current + seconds, 0), duration);
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
        setProgress((newTime / duration) * 100);
    }
  };

  const nextTrack = () => {
      if (playerError) return;
      if (playerRef.current && playerRef.current.nextVideo) {
          playerRef.current.nextVideo();
      }
  };

  const prevTrack = () => {
      if (playerError) return;
      if (playerRef.current && playerRef.current.previousVideo) {
          playerRef.current.previousVideo();
      }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleTheaterMode = () => {
      setIsTheaterMode(!isTheaterMode);
  };

  return (
    <div className={`fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center animate-fade-in ${isTheaterMode ? 'p-0' : 'p-4 sm:p-6 lg:p-10'}`}>
      
      {/* Main Container */}
      <div 
        ref={containerRef}
        className={`relative glass-panel rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 group bg-black transition-all duration-500 
        ${isFullscreen ? 'rounded-none border-none w-full h-full' : isTheaterMode ? 'w-full h-full rounded-none border-none max-w-none' : 'w-full max-w-7xl aspect-video'}`}
        tabIndex={0}
      >
        
        {/* Loading State */}
        {isLoading && !playerError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900">
            <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
          </div>
        )}

        {/* Error State Overlay */}
        {playerError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-900/90 p-8 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Video Unavailable</h3>
                <p className="text-slate-400 mb-8 max-w-md">{playerError}</p>
                
                <button 
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank')}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center shadow-lg hover:scale-105 transition-all"
                >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Watch on YouTube
                </button>
                <button 
                    onClick={onClose}
                    className="mt-4 text-sm font-bold text-slate-500 hover:text-white transition-colors"
                >
                    Go Back
                </button>
            </div>
        )}

        {/* YouTube Iframe Container */}
        <div id="youtube-player" className="w-full h-full pointer-events-none" />

        {/* Overlay Interaction Layer (Click to Play/Pause) - Disabled on error */}
        {!playerError && (
            <div 
                className="absolute inset-0 z-0" 
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
            ></div>
        )}

        {/* --- CUSTOM CONTROLS OVERLAY --- */}
        <div 
            className={`absolute inset-0 flex flex-col justify-between pointer-events-none transition-opacity duration-300 ease-out ${
                isPlaying 
                  ? 'opacity-0 group-hover:opacity-100 delay-1000 group-hover:delay-0' 
                  : 'opacity-100'
            } ${playerError ? 'hidden' : ''}`}
        >
          
          {/* Top Bar */}
          <div className="p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
            <div className="flex flex-col max-w-[70%]">
                <h3 className="text-white font-bold text-lg drop-shadow-md line-clamp-1">{title}</h3>
                <span className="text-white/60 text-xs font-medium flex items-center gap-2">
                    <ExternalLink className="w-3 h-3" /> 
                    {isPlaylist ? 'YouTube Playlist' : 'YouTube Integration'}
                </span>
            </div>
            <button 
              onClick={onClose}
              className="glass-button px-4 py-2 rounded-full text-white bg-white/10 hover:bg-white/20 border-white/10 hover:border-white/30 transition-all flex items-center gap-2 group/back"
            >
              <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold">Go Back</span>
            </button>
          </div>

          {/* Center Play Button (Visible only when paused/hovering) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
             {!isPlaying && !isLoading && !playerError && (
                 <div className="glass-panel p-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl animate-pulse-slow">
                     <Play className="w-10 h-10 text-white fill-current ml-1" />
                 </div>
             )}
          </div>

          {/* Bottom Controls Bar */}
          <div className="p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-auto">
            
            {/* Progress Bar Container */}
            <div className="relative group/progress h-2 w-full bg-white/20 rounded-full mb-4 cursor-pointer hover:h-3 transition-all flex items-center">
                {/* Buffered Progress */}
                <div 
                    className="absolute top-0 left-0 h-full bg-white/30 rounded-full transition-all duration-300"
                    style={{ width: `${buffered}%` }}
                ></div>

                {/* Playback Progress */}
                <div 
                    className="absolute top-0 left-0 h-full bg-sky-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.8)]" 
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform"></div>
                </div>
                
                {/* Interactive Input */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
            </div>

            <div className="flex items-center justify-between">
              
              {/* Left Controls */}
              <div className="flex items-center space-x-3 md:space-x-4">
                {isPlaylist && (
                     <button onClick={prevTrack} className="hover:text-white text-white/70 transition-colors p-1" title="Previous Video">
                        <ChevronsLeft className="w-6 h-6" />
                     </button>
                )}

                <button onClick={togglePlay} className="text-white hover:text-sky-400 transition-colors">
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                </button>

                {isPlaylist && (
                     <button onClick={nextTrack} className="hover:text-white text-white/70 transition-colors p-1" title="Next Video">
                        <ChevronsRight className="w-6 h-6" />
                     </button>
                )}

                {/* Dedicated Skip Buttons */}
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => skip(-10)} 
                        className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all active:scale-90 border border-white/5" 
                        title="Rewind 10s (Left Arrow)"
                    >
                        <SkipBack className="w-4 h-4 fill-current" />
                    </button>
                    <button 
                        onClick={() => skip(10)} 
                        className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all active:scale-90 border border-white/5" 
                        title="Forward 10s (Right Arrow)"
                    >
                        <SkipForward className="w-4 h-4 fill-current" />
                    </button>
                </div>

                {/* Volume */}
                <div 
                    className="relative flex items-center group/vol"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                >
                    <button onClick={toggleMute} className="text-white hover:text-sky-400 mr-2">
                        {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:bg-white/50"
                        />
                    </div>
                </div>

                <span className="text-xs font-mono font-bold text-white/70 bg-black/40 px-2 py-1 rounded-md border border-white/10 hidden lg:inline-block">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-3">
                
                {/* Settings Menu */}
                <div className="relative">
                    <button 
                        onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                        className={`flex items-center justify-center w-9 h-9 text-white hover:text-sky-400 transition-colors rounded-lg hover:bg-white/10 ${showSettingsMenu ? 'bg-white/10 text-sky-400' : ''}`}
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    
                    {showSettingsMenu && (
                        <div className="absolute bottom-full right-0 mb-3 glass-panel !bg-black/90 !backdrop-blur-xl rounded-xl overflow-hidden flex flex-col min-w-[200px] shadow-2xl border-white/10 animate-fade-in-up z-20">
                            
                            {/* Playlist Controls (Shuffle/Loop) */}
                            {isPlaylist && (
                                <>
                                    <div className="px-4 py-2 text-xs font-bold text-white/50 border-b border-white/10 uppercase tracking-wider">Playlist</div>
                                    <button
                                        onClick={toggleShuffle}
                                        className={`w-full px-4 py-3 text-sm text-left hover:bg-white/20 transition-colors flex items-center justify-between ${isShuffle ? 'text-sky-400 font-bold bg-white/5' : 'text-white'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Shuffle className="w-4 h-4" />
                                            <span>Shuffle</span>
                                        </div>
                                        {isShuffle && <Check className="w-3 h-3" />}
                                    </button>
                                    <button
                                        onClick={toggleLoop}
                                        className={`w-full px-4 py-3 text-sm text-left hover:bg-white/20 transition-colors flex items-center justify-between ${isLoop ? 'text-sky-400 font-bold bg-white/5' : 'text-white'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Repeat className="w-4 h-4" />
                                            <span>Loop</span>
                                        </div>
                                        {isLoop && <Check className="w-3 h-3" />}
                                    </button>
                                    <div className="border-t border-white/10 my-1"></div>
                                </>
                            )}

                            <div className="px-4 py-2 text-xs font-bold text-white/50 border-b border-white/10 uppercase tracking-wider">Display</div>
                             <button
                                onClick={() => {
                                    toggleFullscreen();
                                    setShowSettingsMenu(false);
                                }}
                                className="w-full px-4 py-3 text-sm text-left hover:bg-white/20 transition-colors flex items-center justify-between text-white"
                            >
                                <div className="flex items-center gap-2">
                                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                                </div>
                            </button>

                            {/* Playback Speed Section */}
                            <div className="px-4 py-2 text-xs font-bold text-white/50 border-b border-white/10 uppercase tracking-wider border-t border-white/10 mt-1">Playback Speed</div>
                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() => changePlaybackRate(rate)}
                                        className={`w-full px-4 py-3 text-sm text-left hover:bg-white/20 transition-colors flex items-center justify-between ${playbackRate === rate ? 'text-sky-400 font-bold bg-white/5' : 'text-white'}`}
                                    >
                                        <span>{rate === 1 ? 'Normal' : `${rate}x`}</span>
                                        {playbackRate === rate && <Check className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={toggleTheaterMode}
                    className="text-white hover:text-sky-400 transition-colors p-2 hover:bg-white/10 rounded-lg hidden sm:block"
                    title={isTheaterMode ? "Exit Theater Mode" : "Theater Mode"}
                >
                    <Monitor className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank')}
                  className="text-white hover:text-sky-400 transition-colors p-2 hover:bg-white/10 rounded-lg"
                  title="Open in YouTube"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VideoPlayer;