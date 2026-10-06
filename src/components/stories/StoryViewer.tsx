import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, Flame, Coffee, Smile, ThumbsUp, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StoryViewer: React.FC = () => {
  const {
    activeStoryGroup,
    activeStoryIndex,
    closeStoryViewer,
    nextStory,
    prevStory,
    sendMessage,
    chats,
    showToast,
  } = useApp();

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const timerRef = useRef<number | null>(null);

  const currentStory = activeStoryGroup?.stories[activeStoryIndex];
  const totalStories = activeStoryGroup?.stories.length || 1;

  // Auto-advance progress timer
  useEffect(() => {
    if (!activeStoryGroup || isPaused) return;

    setProgress(0);
    const stepDuration = 50; // update every 50ms
    const totalDuration = currentStory?.durationMs || 5000;
    const increment = (stepDuration / totalDuration) * 100;

    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current!);
          nextStory();
          return 0;
        }
        return prev + increment;
      });
    }, stepDuration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStoryGroup, activeStoryIndex, isPaused]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeStoryGroup || !currentStory) return null;

  const handleSendReaction = (emoji: string) => {
    showToast(`Reacted ${emoji} to @${activeStoryGroup.username}'s story`);
    // Find or create chat with user
    const targetChat = chats.find((c) => c.participant.id === activeStoryGroup.userId);
    if (targetChat) {
      sendMessage(targetChat.id, {
        text: `Reacted ${emoji} to your story!`,
      });
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const targetChat = chats.find((c) => c.participant.id === activeStoryGroup.userId);
    if (targetChat) {
      sendMessage(targetChat.id, {
        text: `Replying to story: "${replyText.trim()}"`,
      });
    }
    showToast(`Reply sent to @${activeStoryGroup.username} 💬`);
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none">
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between overflow-hidden sm:rounded-3xl border border-slate-800 bg-slate-950">
        {/* Top Progress Segment Bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {activeStoryGroup.stories.map((s, idx) => {
            let width = '0%';
            if (idx < activeStoryIndex) width = '100%';
            else if (idx === activeStoryIndex) width = `${progress}%`;
            return (
              <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Header Scrim */}
        <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <img
              src={activeStoryGroup.userAvatar}
              alt={activeStoryGroup.username}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border-2 border-white/80"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold">@{activeStoryGroup.username}</span>
                <span className="text-white/60 text-[11px]">·</span>
                <span className="text-white/70 text-[11px]">{currentStory.timestamp}</span>
              </div>
              {currentStory.locationName && (
                <div className="flex items-center gap-1 text-[10px] text-amber-300">
                  <MapPin className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[150px]">{currentStory.locationName}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={closeStoryViewer}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Media (Image or Video) */}
        <div
          className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {currentStory.mediaType === 'video' ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              loop
              onError={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          )}

          {/* Touch/Click navigation zones: Left 35% prev, Right 65% next */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              prevStory();
            }}
            className="absolute top-0 bottom-0 left-0 w-[35%] z-20"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              nextStory();
            }}
            className="absolute top-0 bottom-0 right-0 w-[65%] z-20"
          />

          {/* Story Caption Scrim if available */}
          {currentStory.caption && (
            <div className="absolute bottom-24 left-4 right-4 z-20 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white text-xs leading-relaxed text-center">
              {currentStory.caption}
            </div>
          )}
        </div>

        {/* Bottom Reaction & Reply Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
          {/* Quick Reaction Emojis */}
          <div className="flex items-center justify-around mb-3">
            {[
              { emoji: '🔥', icon: Flame },
              { emoji: '❤️', icon: Heart },
              { emoji: '☕', icon: Coffee },
              { emoji: '😂', icon: Smile },
              { emoji: '👏', icon: ThumbsUp },
            ].map(({ emoji }) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-base flex items-center justify-center transition-transform active:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply Input Form */}
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Send Gapsap to @${activeStoryGroup.username}...`}
              className="flex-1 bg-white/15 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:border-amber-400 backdrop-blur-md"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
