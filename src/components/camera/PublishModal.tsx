import React, { useState } from 'react';
import { X, Send, Film, Clock, MessageSquare, MapPin, Sparkles, Music } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PublishModalProps {
  videoBlob: Blob;
  videoUrl: string;
  mediaType?: 'video' | 'image';
  filterApplied?: string;
  audioTitle: string;
  audioArtist: string;
  trimmedDuration?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const QUICK_TAGS = ['#AapniGapsap', '#ChaiCharcha', '#DesiVibes', '#StreetStories', '#LiveClip', '#EveningGapsap'];

export const PublishModal: React.FC<PublishModalProps> = ({
  videoUrl,
  mediaType = 'video',
  filterApplied,
  audioTitle,
  audioArtist,
  trimmedDuration,
  onClose,
  onSuccess,
}) => {
  const {
    currentUser,
    cameraMode,
    cameraChatRecipientId,
    addReel,
    addStory,
    sendMessage,
    chats,
    userLocation,
    hotspots,
    selectedLocationTag,
    showToast,
  } = useApp();

  const [destination, setDestination] = useState<'reel' | 'story' | 'chat'>(cameraMode);
  const [caption, setCaption] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>(
    selectedLocationTag || userLocation?.name || (hotspots[0] ? `${hotspots[0].name}, ${hotspots[0].city}` : 'Sabarmati Riverfront & Atal Bridge, Ahmedabad')
  );
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    cameraChatRecipientId || chats[0]?.id || ''
  );
  const [isPublishing, setIsPublishing] = useState(false);

  const handleAddTag = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      if (destination === 'reel') {
        const tags = caption
          .split(' ')
          .filter((w) => w.startsWith('#'))
          .map((w) => w.replace('#', ''));

        addReel({
          userId: currentUser.id,
          username: currentUser.username,
          userAvatar: currentUser.avatar,
          videoUrl,
          mediaType,
          caption: caption || (mediaType === 'image' ? 'Photo shared on Aapni Gapsap 📸' : 'Captured with Aapni Gapsap Camera Studio ✨'),
          tags: tags.length > 0 ? tags : ['AapniGapsap', mediaType === 'image' ? 'Photos' : 'Shorts'],
          audioTitle,
          audioArtist,
          locationName: selectedLocation,
          filterApplied,
        });
      } else if (destination === 'story') {
        addStory({
          userId: currentUser.id,
          username: currentUser.username,
          userAvatar: currentUser.avatar,
          mediaUrl: videoUrl,
          mediaType: mediaType,
          caption,
          locationName: selectedLocation,
          durationMs: 7000,
          filterApplied,
        });
      } else if (destination === 'chat') {
        if (selectedRecipientId) {
          sendMessage(selectedRecipientId, {
            mediaUrl: videoUrl,
            mediaType: mediaType,
            text: caption || (mediaType === 'image' ? '📷 Photo shared via Camera Studio' : '📹 Video clip recorded via Camera Studio'),
            locationName: selectedLocation,
          });
          showToast('Media shared to Gapsap Chat! 💬');
        }
      }

      onSuccess();
    } catch {
      showToast('Error sharing video clip.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Share Your Gapsap</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Thumbnail Preview & Destination Selector */}
        <div className="mt-4 flex gap-4">
          <div className="w-24 h-36 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-700 relative">
            <video
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              onError={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 px-1.5 py-0.5 rounded text-white font-mono flex items-center gap-1">
              {trimmedDuration ? `✂️ ${trimmedDuration.toFixed(1)}s` : 'Clip'}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">Publish Target:</span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDestination('reel')}
                  className={`py-2 px-1 text-[11px] font-semibold rounded-lg flex flex-col items-center gap-1 transition-colors ${
                    destination === 'reel' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Reel Feed</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDestination('story')}
                  className={`py-2 px-1 text-[11px] font-semibold rounded-lg flex flex-col items-center gap-1 transition-colors ${
                    destination === 'story' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>24h Story</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDestination('chat')}
                  className={`py-2 px-1 text-[11px] font-semibold rounded-lg flex flex-col items-center gap-1 transition-colors ${
                    destination === 'chat' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat Clip</span>
                </button>
              </div>
            </div>

            {/* Audio Info pill */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 truncate">
              <Music className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{audioTitle} · {audioArtist}</span>
            </div>
          </div>
        </div>

        {/* Caption Input */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Caption & Conversation Starter
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="Write a lively caption... What's on your mind? #ChaiCharcha"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Quick Hashtags */}
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-500 mr-1">Trending:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddTag(tag)}
              className="text-[11px] text-slate-400 hover:text-amber-400 hover:underline transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Destination-specific settings */}
        {destination === 'chat' && (
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Send to Conversation:</label>
            <select
              value={selectedRecipientId}
              onChange={(e) => setSelectedRecipientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {chats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.participant.displayName} (@{c.participant.username})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Location Tagging */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Tag Location
            </span>
            <span className="text-[10px] text-slate-400">Share your hotspot</span>
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {userLocation && <option value={userLocation.name}>📍 Current GPS: {userLocation.name}</option>}
            {Array.from(new Set(hotspots.map((h) => h.state))).map((state) => (
              <optgroup key={state} label={`📍 ${state}`}>
                {hotspots
                  .filter((h) => h.state === state)
                  .map((h) => (
                    <option key={h.id} value={`${h.name}, ${h.city}`}>
                      {h.name} — {h.city} ({h.distanceKm} km away)
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {isPublishing ? 'Sharing...' : 'Publish to Gapsap'}
          </button>
        </div>
      </div>
    </div>
  );
};
