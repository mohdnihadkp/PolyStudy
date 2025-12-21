import React from 'react';
import { VideoLecture } from '../types';
import { Play, Clock, Bookmark, ListVideo, Layers, PlaySquare } from 'lucide-react';

interface VideoGalleryProps {
  videos: VideoLecture[];
  onPlay: (video: VideoLecture) => void;
  onToggleBookmark: (video: VideoLecture) => void;
  isBookmarked: (id: string) => boolean;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ videos, onPlay, onToggleBookmark, isBookmarked }) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-16 glass-panel rounded-3xl border-dashed border-2 border-slate-200 dark:border-white/10">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-slate-50 dark:bg-white/5 mb-6 animate-pulse">
          <Play className="h-8 w-8 text-slate-300 dark:text-neutral-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No videos yet</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-neutral-400 font-medium">Video lectures will appear here soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
      {videos.map((video) => {
        const bookmarked = isBookmarked(video.id);
        const isPlaylist = video.youtubeId.startsWith('PL');
        
        // Generate a deterministic color based on the title length/char code for playlists
        const colorSeed = video.title.length;
        const gradients = [
            'from-blue-600 to-violet-600',
            'from-emerald-500 to-teal-600',
            'from-orange-500 to-red-600',
            'from-pink-500 to-rose-600',
            'from-cyan-500 to-blue-600',
            'from-violet-600 to-purple-600'
        ];
        const gradient = gradients[colorSeed % gradients.length];

        return (
          <button 
            key={video.id} 
            className="glass-panel rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-sky-500/20 hover:-translate-y-2 transition-all duration-500 group p-2 cursor-pointer flex flex-col h-full bg-white dark:bg-[#0a0a0a] relative border border-slate-100 dark:border-white/5 text-left focus-visible:ring-4 focus-visible:ring-sky-500/50 outline-none w-full"
            onClick={() => onPlay(video)}
            aria-label={`Play video: ${video.title} by ${video.instructor}`}
          >
            {/* Bookmark Button */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(video);
                }}
                className={`absolute top-5 right-5 z-30 p-2.5 rounded-full backdrop-blur-xl transition-all duration-300 border border-white/10 cursor-pointer ${
                    bookmarked 
                    ? 'bg-white text-sky-500 shadow-lg scale-110' 
                    : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white hover:scale-110'
                }`}
                title={bookmarked ? "Remove Bookmark" : "Bookmark Video"}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        onToggleBookmark(video);
                    }
                }}
                aria-label={bookmarked ? "Remove bookmark" : "Add to bookmarks"}
            >
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </div>

            <div className="relative aspect-video bg-neutral-900 overflow-hidden rounded-[1.5rem] shadow-inner group-hover:shadow-lg transition-shadow w-full">
              {isPlaylist ? (
                  // Custom Playlist Thumbnail
                  <div className={`w-full h-full bg-gradient-to-br ${gradient} relative flex flex-col items-center justify-center overflow-hidden`}>
                      {/* Background decorative patterns */}
                      <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 2px, transparent 0)', backgroundSize: '32px 32px'}}></div>
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

                      {/* Stacked Cards Effect */}
                      <div className="absolute w-24 h-32 bg-white/10 rounded-xl transform -rotate-12 translate-x-8 translate-y-2 border border-white/10 shadow-lg"></div>
                      <div className="absolute w-24 h-32 bg-white/20 rounded-xl transform rotate-12 -translate-x-8 translate-y-2 border border-white/10 shadow-lg"></div>
                      
                      {/* Center Content */}
                      <div className="relative z-10 flex flex-col items-center transform group-hover:scale-110 transition-transform duration-500">
                          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl mb-3">
                              <Layers className="w-10 h-10 text-white drop-shadow-md" />
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-[0.2em] drop-shadow-md bg-black/20 px-3 py-1 rounded-full border border-white/10">Playlist</span>
                      </div>
                  </div>
              ) : (
                  // Standard Video Thumbnail (High Quality)
                  <img 
                    src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`} 
                    alt="" // Alt text empty as it's decorative in this context (title is below)
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    onError={(e) => {
                        // Fallback if hqdefault fails (rare, but good practice)
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
                    }}
                  />
              )}

              {/* Hover Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                 <div className="bg-white/20 backdrop-blur-md border border-white/50 text-white p-4 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-300">
                   {isPlaylist ? <ListVideo className="w-8 h-8 fill-current ml-0.5" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                 </div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center border border-white/10 shadow-lg">
                {isPlaylist ? <ListVideo className="w-3 h-3 mr-1.5 text-sky-400" /> : <Clock className="w-3 h-3 mr-1.5 text-sky-400" />}
                <span className="text-xs font-bold text-white tracking-wide">{video.duration}</span>
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-grow justify-between relative w-full">
              <div>
                <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${isPlaylist ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>
                        {isPlaylist ? 'Course Series' : 'Lecture'}
                    </span>
                </div>
                <h4 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-sky-500 transition-colors tracking-tight">
                  {video.title}
                </h4>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-white/5 w-full">
                 <div className="flex items-center text-xs font-bold text-slate-500 dark:text-neutral-400">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-white/10 dark:to-white/5 flex items-center justify-center mr-2 text-[10px] text-slate-700 dark:text-white font-black">
                        {video.instructor.charAt(0)}
                    </div>
                    <span className="truncate max-w-[120px]">{video.instructor}</span>
                 </div>
                 
                 <div className={`text-xs font-bold transition-transform group-hover:translate-x-1 flex items-center ${isPlaylist ? 'text-violet-600 dark:text-violet-400' : 'text-sky-600 dark:text-sky-400'}`}>
                    {isPlaylist ? 'View Playlist' : 'Watch Now'}
                    <Play className="w-3 h-3 ml-1.5 fill-current" />
                 </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default VideoGallery;