import React from 'react';
import { Film, MapPin, Camera, MessageSquare, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openCamera, currentUser, chats } = useApp();

  const totalUnread = chats.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-1.5 pb-safe">
      <div className="grid grid-cols-5 items-center h-14">
        {/* Reels Tab */}
        <button
          onClick={() => setActiveTab('reels')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'reels' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Reels Feed"
        >
          <Film className="w-5 h-5" />
          <span className="text-[10px] mt-1">Reels</span>
        </button>

        {/* Hotspots Tab */}
        <button
          onClick={() => setActiveTab('nearby')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'nearby' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Nearby Hotspots"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] mt-1">Hotspots</span>
        </button>

        {/* CENTER PRIMARY RECORD BUTTON (Camera Studio) */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => openCamera('reel')}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-rose-600 text-slate-950 flex items-center justify-center shadow-lg shadow-rose-500/30 active:scale-95 transition-transform"
            title="Record short video clip"
            aria-label="Record Video with Camera"
          >
            <Camera className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </button>
        </div>

        {/* Chat Tab */}
        <button
          onClick={() => setActiveTab('chat')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center relative transition-colors ${
            activeTab === 'chat' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Chit-Chat"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                {totalUnread}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">Gapsap</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'profile' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Profile"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden border border-current">
            <img
              src={currentUser.avatar}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] mt-1">You</span>
        </button>
      </div>
    </div>
  );
};
