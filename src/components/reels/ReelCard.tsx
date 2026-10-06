import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  MapPin,
  Music,
  Check,
} from 'lucide-react';
import { ReelItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { SafeVideoPlayer, SafeVideoPlayerRef } from '../common/SafeVideoPlayer';

interface ReelCardProps {
  reel: ReelItem;
  isActive: boolean;
  onOpenComments: () => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({ reel, isActive, onOpenComments }) => {
  const { toggleLikeReel, toggleBookmarkReel, showToast, setSelectedLocationTag, setActiveTab } = useApp();
  const videoRef = useRef<SafeVideoPlayerRef>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isExpandedCaption, setIsExpandedCaption] = useState(false);
  const lastTapRef = useRef<number>(0);

  // Derive theme from reel tags or videoUrl
  const theme = reel.videoUrl.includes('mountain')
    ? 'mountain'
    : reel.videoUrl.includes('food')
    ? 'food'
    : 'sunset';

  // Auto-play/pause when active
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.currentTime = 0;
      Promise.resolve(videoRef.current.play())
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Double tap to like
  const handleContainerClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      if (!reel.isLiked) {
        toggleLikeReel(reel.id);
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    } else {
      handleTogglePlay();
    }
    lastTapRef.current = now;
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Reel link copied! Share with your friends 🔗');
  };

  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reel.locationName) {
      setSelectedLocationTag(reel.locationName);
      setActiveTab('nearby');
      showToast(`Exploring conversations at ${reel.locationName}`);
    }
  };

  return (
    <div className="relative w-full h-[78vh] sm:h-[680px] max-w-[420px] mx-auto bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 select-none">
      {/* Video or Photo element */}
      {reel.mediaType === 'image' ? (
        <div
          onClick={handleContainerClick}
          className="w-full h-full relative cursor-pointer overflow-hidden bg-slate-950 flex items-center justify-center"
        >
          <img
            src={reel.videoUrl}
            alt={reel.caption}
            style={{
              filter: reel.filterApplied && reel.filterApplied !== 'Normal' ? undefined : undefined,
            }}
            className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
          />
          <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-amber-300 font-semibold flex items-center gap-1 border border-white/10">
            <span>📸 Photo Post</span>
          </div>
        </div>
      ) : (
        <SafeVideoPlayer
          ref={videoRef}
          src={reel.videoUrl}
          loop
          playsInline
          muted={isMuted}
          onClick={handleContainerClick}
          theme={theme}
          title={reel.caption}
          className="w-full h-full object-cover cursor-pointer"
        />
      )}

      {/* Heart Burst on Double Tap */}
      {showHeartBurst && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
          <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-ping opacity-90" />
        </div>
      )}

      {/* Play/Pause indicator icon on pause */}
      {!isPlaying && (
        <div
          onClick={handleTogglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center cursor-pointer z-20"
        >
          <Play className="w-8 h-8 ml-1 text-white fill-white" />
        </div>
      )}

      {/* Mute/Unmute toggle top right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        aria-label="Toggle Audio"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-slate-300" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
      </button>

      {/* RIGHT SIDE INTERACTION STACK */}
      <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-4">
        {/* Creator Avatar with follow shortcut */}
        <div className="relative mb-1">
          <img
            src={reel.userAvatar}
            alt={reel.username}
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-full object-cover border-2 border-amber-400"
          />
          {!isFollowed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFollowed(true);
                showToast(`Following @${reel.username}`);
              }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shadow-md"
              title="Follow creator"
            >
              +
            </button>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLikeReel(reel.id);
          }}
          className="flex flex-col items-center group"
          aria-label="Like"
        >
          <div
            className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-transform active:scale-75 ${
              reel.isLiked ? 'bg-rose-500/20 text-rose-500' : 'bg-black/40 text-white group-hover:bg-black/60'
            }`}
          >
            <Heart className={`w-6 h-6 ${reel.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </div>
          <span className="text-[11px] font-mono text-white mt-1 tabular-nums drop-shadow">
            {reel.likesCount}
          </span>
        </button>

        {/* Comments Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments();
          }}
          className="flex flex-col items-center group"
          aria-label="Comments"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono text-white mt-1 tabular-nums drop-shadow">
            {reel.commentsCount}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="flex flex-col items-center group"
          aria-label="Share"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-mono text-white mt-1 tabular-nums drop-shadow">
            {reel.sharesCount}
          </span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmarkReel(reel.id);
          }}
          className="flex flex-col items-center group"
          aria-label="Bookmark"
        >
          <div
            className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
              reel.isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'bg-black/40 text-white group-hover:bg-black/60'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${reel.isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
          </div>
        </button>

        {/* Rotating Music Disc */}
        <div
          className={`w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-900 p-1 flex items-center justify-center shadow-lg ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '6s' }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center">
            <Music className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      {/* BOTTOM INFO SCRIM */}
      <div className="absolute bottom-0 left-0 right-16 z-10 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
        {/* Creator Info & Follow */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-bold tracking-tight">@{reel.username}</span>
          <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px]">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
          <span className="text-slate-400 text-xs">·</span>
          <span className="text-slate-300 text-xs">{reel.createdAt}</span>
        </div>

        {/* Location Tag */}
        {reel.locationName && (
          <button
            onClick={handleLocationClick}
            className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 transition-colors mb-2 text-left group"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-medium underline-offset-2 group-hover:underline">
              {reel.locationName}
            </span>
          </button>
        )}

        {/* Caption */}
        <p className="text-xs text-slate-100 leading-relaxed mb-2">
          {isExpandedCaption ? reel.caption : `${reel.caption.slice(0, 80)}${reel.caption.length > 80 ? '...' : ''}`}
          {reel.caption.length > 80 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpandedCaption(!isExpandedCaption);
              }}
              className="ml-1 text-slate-400 hover:text-white font-semibold text-[11px]"
            >
              {isExpandedCaption ? 'less' : 'more'}
            </button>
          )}
        </p>

        {/* Tags (Unboxed text with typographic dots - Anti-slop zero pill rule) */}
        {reel.tags && reel.tags.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium flex-wrap mb-2">
            {reel.tags.map((t, i) => (
              <React.Fragment key={t}>
                <span>#{t}</span>
                {i < reel.tags.length - 1 && <span className="text-slate-500">·</span>}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Music Track Line */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <Music className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">
            {reel.audioTitle} · {reel.audioArtist}
          </span>
        </div>
      </div>
    </div>
  );
};
