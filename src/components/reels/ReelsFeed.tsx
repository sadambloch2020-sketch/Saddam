import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Camera, Sparkles, Filter, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReelCard } from './ReelCard';
import { CommentsModal } from './CommentsModal';
import { ReelItem } from '../../types';

export const ReelsFeed: React.FC = () => {
  const { reels, openCamera, selectedLocationTag, setSelectedLocationTag } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'chai' | 'travel' | 'food'>('all');
  const [activeCommentsReel, setActiveCommentsReel] = useState<ReelItem | null>(null);

  // Filter reels
  const filteredReels = reels.filter((r) => {
    if (selectedLocationTag) {
      const tagLower = selectedLocationTag.toLowerCase();
      const locLower = r.locationName.toLowerCase();
      const matchesDirect = locLower.includes(tagLower) || tagLower.includes(locLower);
      const cities = ['ahmedabad', 'rajkot', 'junagadh', 'surat', 'vadodara', 'mumbai', 'pune', 'delhi', 'jaipur', 'udaipur', 'bengaluru', 'amritsar'];
      const matchesCity = cities.some((city) => tagLower.includes(city) && locLower.includes(city));
      return matchesDirect || matchesCity;
    }
    if (activeCategory === 'chai') {
      return r.caption.toLowerCase().includes('chai') || r.tags.some((t) => t.toLowerCase().includes('chai'));
    }
    if (activeCategory === 'travel') {
      return r.caption.toLowerCase().includes('mountain') || r.caption.toLowerCase().includes('travel') || r.tags.some((t) => t.toLowerCase().includes('travel'));
    }
    if (activeCategory === 'food') {
      return r.caption.toLowerCase().includes('food') || r.caption.toLowerCase().includes('jalebi') || r.tags.some((t) => t.toLowerCase().includes('food'));
    }
    return true;
  });

  const currentReel = filteredReels[activeIndex] || filteredReels[0];

  const handleNext = () => {
    if (activeIndex < filteredReels.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Location Filter Alert Banner */}
      {selectedLocationTag && (
        <div className="w-full max-w-md mb-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold">Showing Reels from:</span>
            <span className="text-white truncate">{selectedLocationTag}</span>
          </div>
          <button
            onClick={() => setSelectedLocationTag(null)}
            className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Segmented Controls (Buttons with click handlers) */}
      <div className="w-full max-w-md flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveIndex(0);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeCategory === 'all' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Gapsap
          </button>
          <button
            onClick={() => {
              setActiveCategory('chai');
              setActiveIndex(0);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeCategory === 'chai' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            ☕ Chai Charcha
          </button>
          <button
            onClick={() => {
              setActiveCategory('travel');
              setActiveIndex(0);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeCategory === 'travel' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏔️ Travel
          </button>
          <button
            onClick={() => {
              setActiveCategory('food');
              setActiveIndex(0);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeCategory === 'food' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🍛 Street Food
          </button>
        </div>

        {/* Quick Launch Camera Button */}
        <button
          onClick={() => openCamera('reel')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold transition-colors"
          title="Record Reel with Camera"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Record</span>
        </button>
      </div>

      {/* Main Reels Container */}
      <div className="relative w-full flex items-center justify-center">
        {filteredReels.length === 0 ? (
          <div className="w-full max-w-md h-[500px] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Sparkles className="w-10 h-10 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Reels Found in this Category</h3>
            <p className="text-xs text-slate-400 mb-5 max-w-xs">
              Be the first to record a clip for this topic using the Aapni Gapsap Camera Studio!
            </p>
            <button
              onClick={() => openCamera('reel')}
              className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Open Camera Studio
            </button>
          </div>
        ) : (
          <div className="relative flex items-center justify-center w-full">
            {/* Desktop Navigation Arrows on left/right */}
            <div className="hidden lg:flex flex-col gap-3 absolute -right-16 top-1/2 -translate-y-1/2">
              <button
                onClick={handlePrev}
                disabled={activeIndex === 0}
                className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Reel (Up Arrow)"
                aria-label="Previous Reel"
              >
                <ChevronUp className="w-5 h-5" />
              </button>

              <div className="text-[11px] font-mono text-center text-slate-400 tabular-nums">
                {activeIndex + 1}/{filteredReels.length}
              </div>

              <button
                onClick={handleNext}
                disabled={activeIndex === filteredReels.length - 1}
                className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Reel (Down Arrow)"
                aria-label="Next Reel"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Reel Card */}
            {currentReel && (
              <ReelCard
                reel={currentReel}
                isActive={true}
                onOpenComments={() => setActiveCommentsReel(currentReel)}
              />
            )}
          </div>
        )}
      </div>

      {/* Comments Drawer / Modal */}
      {activeCommentsReel && (
        <CommentsModal
          reel={activeCommentsReel}
          onClose={() => setActiveCommentsReel(null)}
        />
      )}
    </div>
  );
};
