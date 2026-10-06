import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Users,
  Flame,
  Camera,
  Compass,
  Radio,
  Search,
  Sparkles,
  Coffee,
  Landmark,
  Waves,
  Mountain,
  Smile,
  X,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HotspotLocation } from '../../types';
import { SafeVideoPlayer } from '../common/SafeVideoPlayer';

const STATE_OPTIONS = [
  { id: 'all', label: 'All Regions' },
  { id: 'Gujarat', label: 'Gujarat ⭐', cities: ['Ahmedabad', 'Rajkot', 'Junagadh', 'Surat', 'Vadodara'] },
  { id: 'Maharashtra', label: 'Maharashtra', cities: ['Mumbai', 'Pune'] },
  { id: 'Delhi NCR', label: 'Delhi NCR', cities: ['New Delhi'] },
  { id: 'Rajasthan', label: 'Rajasthan', cities: ['Jaipur', 'Udaipur'] },
  { id: 'Karnataka', label: 'Karnataka', cities: ['Bengaluru'] },
  { id: 'Punjab', label: 'Punjab', cities: ['Amritsar', 'Lahore'] },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Vibes', icon: Sparkles },
  { id: 'promenade', label: 'Promenade & Lakes', icon: Waves },
  { id: 'food', label: 'Khau Gali & Chai', icon: Coffee },
  { id: 'heritage', label: 'Heritage & Forts', icon: Landmark },
  { id: 'spiritual', label: 'Spiritual & Treks', icon: Mountain },
  { id: 'youth', label: 'Youth & Cafes', icon: Smile },
];

export const LocationDiscovery: React.FC = () => {
  const {
    hotspots,
    userLocation,
    requestUserLocation,
    selectedHotspot,
    setSelectedHotspot,
    openCamera,
    setSelectedLocationTag,
    setActiveTab,
    reels,
    showToast,
  } = useApp();

  const [selectedState, setSelectedState] = useState<string>('Gujarat');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = async () => {
    setIsLocating(true);
    await requestUserLocation();
    setIsLocating(false);
  };

  // Find cities list for current selected state
  const availableCities = useMemo(() => {
    if (selectedState === 'all') {
      const citySet = new Set(hotspots.map((h) => h.city));
      return Array.from(citySet);
    }
    const stateObj = STATE_OPTIONS.find((s) => s.id === selectedState);
    return stateObj?.cities || [];
  }, [selectedState, hotspots]);

  // Filter hotspots based on state, city, category, and search query
  const filteredHotspots = useMemo(() => {
    return hotspots.filter((spot) => {
      // State filter
      if (selectedState !== 'all' && spot.state !== selectedState) {
        return false;
      }

      // City filter
      if (selectedCity !== 'all' && spot.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && spot.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = spot.name.toLowerCase().includes(query);
        const matchesCity = spot.city.toLowerCase().includes(query);
        const matchesState = spot.state.toLowerCase().includes(query);
        const matchesFamous = spot.famousFor?.toLowerCase().includes(query) || false;
        const matchesTrending = spot.trendingTopic.toLowerCase().includes(query);
        if (!matchesName && !matchesCity && !matchesState && !matchesFamous && !matchesTrending) {
          return false;
        }
      }

      return true;
    });
  }, [hotspots, selectedState, selectedCity, selectedCategory, searchQuery]);

  const activeSpot = selectedHotspot && filteredHotspots.some((h) => h.id === selectedHotspot.id)
    ? selectedHotspot
    : filteredHotspots[0] || hotspots[0];

  const spotReels = reels.filter((r) => {
    if (!activeSpot) return false;
    const loc = r.locationName.toLowerCase();
    const spotName = activeSpot.name.toLowerCase();
    const spotCity = activeSpot.city.toLowerCase();
    return loc.includes(spotName) || loc.includes(spotCity);
  });

  const handleRecordAtHotspot = (spot: HotspotLocation) => {
    setSelectedLocationTag(`${spot.name}, ${spot.city}`);
    openCamera('reel');
    showToast(`Tagged location: ${spot.name}, ${spot.city}`);
  };

  const handleStartChatAtHotspot = (spot: HotspotLocation) => {
    setSelectedLocationTag(`${spot.name}, ${spot.city}`);
    setActiveTab('chat');
    showToast(`Switched to Chit-Chat with location: ${spot.name}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-5 flex flex-col gap-5 pb-24">
      {/* Header & Geolocation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
            <Radio className="w-4 h-4 animate-pulse text-rose-500" />
            <span>Aapni Gapsap City & State Hotspots Radar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Discover Conversations Across India & Gujarat
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Explore live chai charchas, trending spots in <strong className="text-amber-400">Ahmedabad, Rajkot, Junagadh, Surat, Vadodara</strong>, and cultural hubs nationwide. Connect with people and record video reels tagged to your city!
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Detecting GPS...' : userLocation ? 'Refresh GPS Location' : 'Detect My Location'}
          </button>
        </div>
      </div>

      {/* Active User GPS Indicator */}
      {userLocation && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Active GPS Position: <strong>{userLocation.name}</strong></span>
          </div>
          <span className="text-[11px] text-emerald-400/80">Live Coordinates Active</span>
        </div>
      )}

      {/* Search Bar & State Filter Bar */}
      <div className="flex flex-col gap-3">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, state, or landmark (e.g., Ahmedabad, Rajkot, Junagadh, Surat, Vadodara, Riverfront, Dumas, Girnar...)"
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* State Selector Tabs */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Select State / Region
            </span>
            <span className="text-[10px] text-amber-400">
              {filteredHotspots.length} hotspots active
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {STATE_OPTIONS.map((state) => {
              const isSelected = selectedState === state.id;
              return (
                <button
                  key={state.id}
                  onClick={() => {
                    setSelectedState(state.id);
                    setSelectedCity('all'); // reset city selection when state switches
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-102'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {state.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* City Filter Chips */}
        {availableCities.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCity('all')}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedCity === 'all'
                  ? 'bg-slate-700 text-amber-300 border border-amber-400/40'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All {selectedState !== 'all' ? selectedState : 'Cities'}
            </button>
            {availableCities.map((city) => {
              const isCityActive = selectedCity.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    isCityActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-rose-400" />
                  {city}
                </button>
              );
            })}
          </div>
        )}

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_FILTERS.map((cat) => {
            const Icon = cat.icon;
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isCatActive
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-3 h-3 text-amber-400" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Hotspots List on Left, Selected Hotspot Showcase on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hotspot Cards List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {selectedState !== 'all' ? `${selectedState} Hotspots` : 'Nearby Hotspots'}
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {filteredHotspots.length} location{filteredHotspots.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredHotspots.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs flex flex-col items-center gap-2">
              <MapPin className="w-6 h-6 text-slate-600" />
              <p>No hotspots matching your filters.</p>
              <button
                onClick={() => {
                  setSelectedState('all');
                  setSelectedCity('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-amber-400 hover:underline font-semibold text-xs mt-1 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[720px] overflow-y-auto pr-1">
              {filteredHotspots.map((spot) => {
                const isSelected = activeSpot?.id === spot.id;
                return (
                  <div
                    key={spot.id}
                    onClick={() => setSelectedHotspot(spot)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-850 bg-slate-900/95 border-amber-500/90 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                            <span className="truncate">{spot.name}</span>
                          </h4>
                        </div>

                        {/* City, State & Distance */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                          <span className="font-semibold text-amber-300">
                            {spot.city}, {spot.state}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{spot.distanceKm} km away</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{spot.reelsCount} clips</span>
                        </div>
                      </div>

                      {/* Live Users Counter */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                        <Users className="w-3 h-3" />
                        <span className="font-mono tabular-nums">{spot.activeUsers}</span>
                      </div>
                    </div>

                    {/* Famous for highlight */}
                    {spot.famousFor && (
                      <div className="mt-2 text-[11px] text-slate-300/90 bg-slate-950/60 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
                        <span className="text-amber-400 font-semibold">Specialty: </span>
                        {spot.famousFor}
                      </div>
                    )}

                    {/* Trending conversation snippet */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300 truncate max-w-[280px]">
                        <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate text-[11px]">{spot.trendingTopic}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecordAtHotspot(spot);
                        }}
                        className="p-1 px-2 text-[10px] rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Record a Reel at this hotspot"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Record</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Hotspot Deep Dive */}
        {activeSpot && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
            <div>
              {/* Top Banner */}
              <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeSpot.city}, {activeSpot.state}
                    </span>
                    {activeSpot.popularTimes && (
                      <span className="text-[10px] text-slate-400">
                        Best Time: {activeSpot.popularTimes}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
                    {activeSpot.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-slate-500" />
                    <span>GPS: {activeSpot.coordinates.lat.toFixed(4)}° N, {activeSpot.coordinates.lng.toFixed(4)}° E</span>
                    <span>·</span>
                    <span>{activeSpot.distanceKm} km from you</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleRecordAtHotspot(activeSpot)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Record Reel Here
                  </button>
                  <button
                    onClick={() => handleStartChatAtHotspot(activeSpot)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                    Start Gapsap Chat
                  </button>
                </div>
              </div>

              {/* Cultural Highlight / Famous For */}
              {activeSpot.famousFor && (
                <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 mb-4">
                  <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    What This Hotspot Is Famous For
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeSpot.famousFor}
                  </p>
                </div>
              )}

              {/* Discussion Highlight */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-5">
                <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  Today&apos;s Active Conversation Topic
                </div>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  &ldquo;{activeSpot.trendingTopic}&rdquo;
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Users className="w-3.5 h-3.5" />
                    {activeSpot.activeUsers} people chatting nearby right now
                  </span>
                  <span>Updated moments ago</span>
                </div>
              </div>

              {/* Reels Tagged with this location */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Recent Clips from {activeSpot.name}</span>
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedLocationTag(activeSpot.name);
                      setActiveTab('reels');
                    }}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View in Reels Feed</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {spotReels.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
                    <p>No video clips recorded at this specific hotspot yet.</p>
                    <button
                      onClick={() => handleRecordAtHotspot(activeSpot)}
                      className="mt-2 text-amber-400 hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Be the first to record a clip here with Camera Studio!
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {spotReels.map((reel) => (
                      <div
                        key={reel.id}
                        onClick={() => {
                          setSelectedLocationTag(activeSpot.name);
                          setActiveTab('reels');
                        }}
                        className="aspect-[9/16] rounded-xl overflow-hidden bg-black relative group cursor-pointer border border-slate-800 hover:border-amber-400 transition-all shadow-md"
                      >
                        <SafeVideoPlayer
                          src={reel.videoUrl}
                          muted
                          playsInline
                          theme={
                            reel.videoUrl.includes('mountain')
                              ? 'mountain'
                              : reel.videoUrl.includes('food')
                              ? 'food'
                              : reel.videoUrl.includes('studio')
                              ? 'studio'
                              : 'sunset'
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                          <span className="text-[11px] font-bold truncate">@{reel.username}</span>
                          <span className="text-[10px] text-slate-300 font-mono">{reel.likesCount} likes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
