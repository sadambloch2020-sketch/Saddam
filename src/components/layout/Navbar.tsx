import React from 'react';
import { Camera, MapPin, MessageSquare, Film, User, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../../types';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, openCamera, currentUser, chats } = useApp();

  const totalUnread = chats.reduce((acc, c) => acc + c.unreadCount, 0);

  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'reels', label: 'Reels Feed', icon: Film },
    { id: 'nearby', label: 'Nearby Hotspots', icon: MapPin },
    { id: 'chat', label: 'Chit-Chat', icon: MessageSquare },
    { id: 'profile', label: 'My Studio', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single Text Element Wordmark */}
        <button
          onClick={() => setActiveTab('reels')}
          className="text-lg sm:text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-400 font-sans"
        >
          Aapni Gapsap
        </button>

        {/* Zone 2: 4-6 Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative py-1 transition-colors hover:text-white whitespace-nowrap ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-400'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'chat' && totalUnread > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-mono">
                    {totalUnread}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-rose-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Primary Record Button using Camera */}
          <button
            onClick={() => openCamera('reel')}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/15 active:scale-95 transition-all whitespace-nowrap"
            title="Open Camera Studio to record short video clip"
          >
            <Camera className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span className="hidden sm:inline">Record Gapsap</span>
          </button>

          {/* User Profile Avatar shortcut */}
          <button
            onClick={() => setActiveTab('profile')}
            className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-slate-700 hover:border-amber-400 transition-colors shrink-0"
            title="Open Profile"
            aria-label="Profile"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
