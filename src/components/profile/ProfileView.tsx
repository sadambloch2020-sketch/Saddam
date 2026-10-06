import React, { useState } from 'react';
import { Camera, MapPin, Grid, Bookmark, Check, Film, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SafeVideoPlayer } from '../common/SafeVideoPlayer';

export const ProfileView: React.FC = () => {
  const { currentUser, reels, stories, openCamera, setActiveTab } = useApp();
  const [profileTab, setProfileTab] = useState<'reels' | 'saved' | 'stories'>('reels');

  const myReels = reels.filter((r) => r.userId === currentUser.id);
  const mySaved = reels.filter((r) => r.isBookmarked);
  const myStories = stories.find((g) => g.userId === currentUser.id)?.stories || [];

  return (
    <div className="w-full max-w-3xl mx-auto p-4 flex flex-col gap-6">
      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            referrerPolicy="no-referrer"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-amber-500 shadow-xl"
          />
          <button
            onClick={() => openCamera('story')}
            className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center border-2 border-slate-900 shadow"
            title="Add Story"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-black text-white">{currentUser.displayName}</h2>
                {currentUser.isVerified && (
                  <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-400 font-semibold mt-0.5">@{currentUser.username}</p>
            </div>

            <button
              onClick={() => openCamera('reel')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <Camera className="w-4 h-4" />
              Record New Reel
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed max-w-lg">
            {currentUser.bio}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-slate-400 mt-2">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>{currentUser.location}</span>
          </div>

          {/* Social Stats: Clean unboxed layout with typographic separators */}
          <div className="flex items-center justify-center sm:justify-start gap-6 mt-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <span className="font-mono font-bold text-white tabular-nums">{myReels.length}</span>{' '}
              <span className="text-slate-400">Gapsap Clips</span>
            </div>
            <div>
              <span className="font-mono font-bold text-white tabular-nums">{currentUser.followersCount}</span>{' '}
              <span className="text-slate-400">Followers</span>
            </div>
            <div>
              <span className="font-mono font-bold text-white tabular-nums">{currentUser.followingCount}</span>{' '}
              <span className="text-slate-400">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setProfileTab('reels')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors ${
            profileTab === 'reels' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>My Reels ({myReels.length})</span>
        </button>

        <button
          onClick={() => setProfileTab('stories')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors ${
            profileTab === 'stories' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Stories ({myStories.length})</span>
        </button>

        <button
          onClick={() => setProfileTab('saved')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors ${
            profileTab === 'saved' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Bookmarks ({mySaved.length})</span>
        </button>
      </div>

      {/* Tab Content Grid */}
      {profileTab === 'reels' && (
        <div>
          {myReels.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              <Film className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>You haven’t recorded any Reels yet.</p>
              <button
                onClick={() => openCamera('reel')}
                className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-600 transition-colors"
              >
                Record Your First Clip Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {myReels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setActiveTab('reels')}
                  className="aspect-[9/16] rounded-2xl overflow-hidden bg-black relative group cursor-pointer border border-slate-800 hover:border-amber-400 transition-all shadow-md"
                >
                  {reel.mediaType === 'image' ? (
                    <img
                      src={reel.videoUrl}
                      alt={reel.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <SafeVideoPlayer
                      src={reel.videoUrl}
                      muted
                      playsInline
                      theme={reel.videoUrl.includes('mountain') ? 'mountain' : reel.videoUrl.includes('food') ? 'food' : 'sunset'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                    <p className="text-[11px] font-medium truncate">{reel.caption}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{reel.likesCount} likes</span>
                      <span>{reel.commentsCount} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {profileTab === 'stories' && (
        <div>
          {myStories.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>No active 24h stories right now.</p>
              <button
                onClick={() => openCamera('story')}
                className="mt-3 px-4 py-2 bg-rose-500 text-white font-bold rounded-xl text-xs hover:bg-rose-600 transition-colors"
              >
                Record a Story Clip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {myStories.map((story) => (
                <div
                  key={story.id}
                  className="aspect-[9/16] rounded-2xl overflow-hidden bg-black relative border border-slate-800 shadow-md"
                >
                  {story.mediaType === 'video' ? (
                    <SafeVideoPlayer
                      src={story.mediaUrl}
                      muted
                      playsInline
                      autoPlay
                      loop
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img src={story.mediaUrl} alt="Story" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                    <span className="text-[10px] text-amber-400 font-mono">{story.timestamp}</span>
                    {story.locationName && (
                      <span className="text-[10px] text-slate-300 truncate">📍 {story.locationName}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {profileTab === 'saved' && (
        <div>
          {mySaved.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              <Bookmark className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>No bookmarked clips yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">Tap the bookmark icon on any Reel to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {mySaved.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setActiveTab('reels')}
                  className="aspect-[9/16] rounded-2xl overflow-hidden bg-black relative group cursor-pointer border border-slate-800 hover:border-amber-400 transition-all shadow-md"
                >
                  <SafeVideoPlayer
                    src={reel.videoUrl}
                    muted
                    playsInline
                    theme={reel.videoUrl.includes('mountain') ? 'mountain' : reel.videoUrl.includes('food') ? 'food' : 'sunset'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                    <span className="text-[11px] font-semibold">@{reel.username}</span>
                    <p className="text-[10px] text-slate-300 truncate mt-0.5">{reel.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
