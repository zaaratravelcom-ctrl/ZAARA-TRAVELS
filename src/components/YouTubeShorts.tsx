import React, { useState } from 'react';
import { Play, MapPin, Sparkles, Film, ExternalLink, ChevronRight, Eye } from 'lucide-react';
import { YOUTUBE_SHORTS_DATA, YouTubeShortItem } from '../data/youtubeShortsData';

interface YouTubeShortsProps {
  shortsList?: YouTubeShortItem[];
  title?: string;
  subtitle?: string;
}

export const YouTubeShorts: React.FC<YouTubeShortsProps> = ({
  shortsList = YOUTUBE_SHORTS_DATA,
  title = "Guest Video Feedback",
  subtitle = "Watch real traveler reviews, guest tour experiences, Taj Mahal moments & luxury cab journeys",
}) => {
  // Track which shorts are currently playing in iframe mode
  const [playingShortId, setPlayingShortId] = useState<string | null>(null);

  const handlePlayVideo = (id: string) => {
    setPlayingShortId(id);
  };

  return (
    <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white py-14 px-4 sm:px-6 relative overflow-hidden border-y border-slate-800/80 shadow-2xl">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-inner">
              <Film className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Guest Video Feedback</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://www.youtube.com/@ZAARATRAVELS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/80 transition"
            >
              <span>@ZAARATRAVELS on YouTube</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Shorts Video Row / Grid
            Mobile: Swipeable horizontal carousel (overflow-x-auto snap-x)
            Tablet: Responsive grid (md:grid-cols-3)
            Desktop: 5 videos in a horizontal row (lg:grid-cols-5)
        */}
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 sm:pb-0 scrollbar-thin scrollbar-thumb-amber-500/40 scrollbar-track-slate-800/40 -mx-4 px-4 sm:mx-0 sm:px-0">
          {shortsList.slice(0, 5).map((item, index) => {
            const isPlaying = playingShortId === item.id;
            const embedUrl = `https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
            const thumbnailUrl = item.customThumbnail || `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`;

            return (
              <div
                key={item.id}
                className="snap-center shrink-0 w-[240px] sm:w-auto flex-1 group relative bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
              >
                {/* 9:16 Shorts Ratio Container */}
                <div className="relative w-full aspect-[9/16] bg-slate-950 overflow-hidden">
                  {isPlaying ? (
                    /* Active Iframe Embed (Lazy initialized on user click for high performance) */
                    <iframe
                      src={embedUrl}
                      title={item.title}
                      loading="lazy"
                      className="w-full h-full border-0 absolute inset-0 z-20"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    /* High-Performance Thumbnail Preview Facade */
                    <div
                      onClick={() => handlePlayVideo(item.id)}
                      className="w-full h-full relative cursor-pointer group/thumb"
                    >
                      {/* Video Poster Image */}
                      <img
                        src={thumbnailUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover/thumb:scale-105 transition-transform duration-500 opacity-90 group-hover/thumb:opacity-100"
                        onError={(e) => {
                          // Fallback to SD or HQ default if maxres fails
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
                        }}
                      />

                      {/* Gradient Overlays for Text Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40 group-hover/thumb:via-slate-950/10 transition-all" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                        <span className="bg-red-600/90 backdrop-blur-md text-white font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
                          Shorts
                        </span>

                        {item.duration && (
                          <span className="bg-slate-950/80 backdrop-blur-md text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded-md border border-slate-800">
                            {item.duration}
                          </span>
                        )}
                      </div>

                      {/* Center Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <button
                          type="button"
                          aria-label={`Play ${item.title}`}
                          className="w-14 h-14 rounded-full bg-amber-500/90 group-hover/thumb:bg-amber-400 group-hover/thumb:scale-110 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 ring-4 ring-amber-400/20 transition-all duration-300"
                        >
                          <Play className="w-6 h-6 fill-slate-950 translate-x-0.5" />
                        </button>
                      </div>

                      {/* Bottom Info Container */}
                      <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10 space-y-1.5">
                        {item.location && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 drop-shadow">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </div>
                        )}

                        <h3 className="font-black text-xs sm:text-sm text-white line-clamp-2 leading-snug drop-shadow group-hover/thumb:text-amber-200 transition-colors">
                          {item.title}
                        </h3>

                        {item.views && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 pt-0.5">
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>{item.views}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Bar */}
                <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => handlePlayVideo(item.id)}
                    className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isPlaying ? 'Now Playing' : 'Watch Video'}</span>
                  </button>

                  <a
                    href={item.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open on YouTube"
                    className="text-slate-400 hover:text-white transition p-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default YouTubeShorts;
