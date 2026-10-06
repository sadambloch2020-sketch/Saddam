import React, { useState, useMemo } from 'react';
import {
  Send,
  Camera,
  Search,
  Sparkles,
  Smile,
  MessageCircle,
  Users,
  X,
  MapPin,
  Bot,
  Heart,
  PartyPopper,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SafeVideoPlayer } from '../common/SafeVideoPlayer';
import { searchCommunityRobots, REGIONAL_CITIES } from '../../utils/robotCommunity';
import { UserProfile } from '../../types';

export const ChatHub: React.FC = () => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    sendMessage,
    openCamera,
    currentUser,
    typingBotId,
    typingBotName,
    startChatWithUser,
    showToast,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [selectedIcebreaker, setSelectedIcebreaker] = useState<string | null>(null);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [botSearchQuery, setBotSearchQuery] = useState('');
  const [botCityFilter, setBotCityFilter] = useState('all');

  const activeThread = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activeThread) {
      sendMessage(activeThread.id, {
        text: inputText.trim(),
      });
      setInputText('');
    }
  };

  const handleQuickSend = (prompt: string) => {
    if (activeThread) {
      sendMessage(activeThread.id, {
        text: prompt,
      });
      showToast(`Sent: "${prompt}"`);
    }
  };

  const QUICK_PROMPTS = [
    { label: '👋 Say Hello', text: 'Hello! Kem chho? 😊' },
    { label: '😊 "How are you?"', text: 'How are you doing today? ☕' },
    { label: '🎉 Congratulations!', text: 'Congratulations!! Wishing you wonderful success! 🥳🎊' },
    { label: '☕ Chai pe Charcha', text: 'Chai pe charcha! What is the best tea & street food spot in your city? 😋' },
  ];

  // 1,000 Community Bots filtered by search and city
  const communityRobots = useMemo(() => {
    return searchCommunityRobots(botSearchQuery, botCityFilter, 'all', 60);
  }, [botSearchQuery, botCityFilter]);

  return (
    <div className="w-full max-w-5xl mx-auto h-[82vh] sm:h-[720px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row pb-safe">
      {/* Threads Sidebar (Desktop or Mobile List) */}
      <div
        className={`w-full md:w-84 border-r border-slate-800 flex flex-col bg-slate-950/70 ${
          activeChatId && 'hidden md:flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-1.5">
              <span>Gapsap Chit-Chat</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                Live
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Direct conversations & companion bots</p>
          </div>
          <button
            onClick={() => openCamera('chat', activeThread?.id)}
            className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 flex items-center justify-center transition-colors cursor-pointer"
            title="Record Video Message"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* 1,000 Robot Community Explorer Button */}
        <div className="p-3 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10">
          <button
            onClick={() => setIsCommunityModalOpen(true)}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Find & Contact 1,000+ Members 🤖</span>
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            Instant replies for <strong className="text-amber-300">&ldquo;Hello&rdquo;</strong>, <strong className="text-amber-300">&ldquo;How are you&rdquo;</strong> & <strong className="text-amber-300">&ldquo;Congratulations&rdquo;</strong>!
          </p>
        </div>

        {/* Chat Threads List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
          {chats.map((thread) => {
            const isSelected = activeThread?.id === thread.id;
            const isTyping = typingBotId === thread.participant.id;
            return (
              <div
                key={thread.id}
                onClick={() => setActiveChatId(thread.id)}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-slate-850 bg-slate-900 border-l-4 border-amber-500'
                    : 'hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={thread.participant.avatar}
                      alt={thread.participant.displayName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border border-slate-700"
                    />
                    {thread.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white truncate">
                        {thread.participant.displayName}
                      </h4>
                      {thread.participant.isBot && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-mono px-1 rounded border border-indigo-500/30">
                          bot
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-[170px]">
                      {isTyping ? (
                        <span className="text-amber-400 font-semibold animate-pulse">Typing reply...</span>
                      ) : (
                        thread.lastMessage
                      )}
                    </p>
                    {thread.participant.location && (
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                        <span>{thread.participant.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {thread.lastTimestamp}
                  </span>
                  {thread.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Conversation Window */}
      {activeThread ? (
        <div className="flex-1 flex flex-col bg-slate-900">
          {/* Conversation Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveChatId(null)}
                className="md:hidden text-xs text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ← Back
              </button>
              <div className="relative">
                <img
                  src={activeThread.participant.avatar}
                  alt={activeThread.participant.displayName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">{activeThread.participant.displayName}</h3>
                  {activeThread.participant.isBot && (
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-mono px-1 rounded border border-indigo-500/30">
                      bot id
                    </span>
                  )}
                  {activeThread.participant.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>@{activeThread.participant.username}</span>
                  <span>·</span>
                  <span className="text-amber-300 font-medium">{activeThread.participant.location || 'Gujarat'}</span>
                  <span>·</span>
                  {typingBotId === activeThread.participant.id ? (
                    <span className="text-emerald-400 font-semibold animate-pulse">Typing...</span>
                  ) : (
                    <span className="text-emerald-400">Online</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openCamera('chat', activeThread.id)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
                title="Record video clip directly into this chat"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Send Clip</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/20">
            {activeThread.messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed relative ${
                      isMe
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                        : 'bg-slate-800 text-white rounded-tl-none border border-slate-700 shadow-md'
                    }`}
                  >
                    {/* Media Video Clip if attached */}
                    {msg.mediaType === 'video' && msg.mediaUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden bg-black max-w-xs relative border border-black/20">
                        <SafeVideoPlayer
                          src={msg.mediaUrl}
                          controls
                          playsInline
                          theme="studio"
                          className="w-full max-h-56 object-cover"
                        />
                        <div className="p-1 bg-black/60 text-white text-[10px] flex items-center justify-between">
                          <span>📹 Recorded Clip</span>
                          {msg.locationName && <span>📍 {msg.locationName}</span>}
                        </div>
                      </div>
                    )}

                    {/* Media Photo if attached */}
                    {msg.mediaType === 'image' && msg.mediaUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden bg-black max-w-xs relative border border-black/20">
                        <img
                          src={msg.mediaUrl}
                          alt="Photo message"
                          className="w-full max-h-56 object-cover"
                        />
                        <div className="p-1 bg-black/60 text-white text-[10px] flex items-center justify-between">
                          <span>📸 Photo Upload</span>
                          {msg.locationName && <span>📍 {msg.locationName}</span>}
                        </div>
                      </div>
                    )}

                    {/* Text content */}
                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                    {/* Reaction Badge if any */}
                    {msg.reaction && (
                      <div className="absolute -bottom-2 right-2 bg-slate-900 border border-slate-700 text-base rounded-full px-1.5 shadow-md">
                        {msg.reaction}
                      </div>
                    )}

                    <div
                      className={`text-[9px] mt-1.5 text-right font-mono ${
                        isMe ? 'text-slate-900/70' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator bubble */}
            {typingBotId === activeThread.participant.id && (
              <div className="flex items-start">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-3 text-xs text-slate-300 flex items-center gap-2 shadow-md">
                  <span className="font-semibold text-amber-300">{typingBotName || activeThread.participant.displayName}</span> is typing
                  <span className="flex items-center gap-1 ml-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Conversation Starter Chips (Hello, How are you, Congratulations) */}
          <div className="px-3 pt-2 pb-1 bg-slate-950/70 border-t border-slate-850 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 mr-1">
              Tap to Send:
            </span>
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickSend(p.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-[11px] font-medium whitespace-nowrap transition-colors border border-slate-700/60 cursor-pointer shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Box & Action Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openCamera('chat', activeThread.id)}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title="Record Video or Photo with Camera Studio"
              >
                <Camera className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type 'Hello', 'How are you', 'Congratulations', or local gapsap..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold flex items-center justify-center shrink-0 transition-colors shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <MessageCircle className="w-12 h-12 text-slate-600 mb-2" />
          <h3 className="text-sm font-bold text-white">Select a Conversation</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Start chit-chatting with friends, explore the 1,000+ community robot IDs, or send a quick camera clip.
          </p>
        </div>
      )}

      {/* 1,000 COMMUNITY MEMBERS & ROBOT IDs MODAL */}
      {isCommunityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-white flex items-center gap-1.5">
                    <Bot className="w-5 h-5 text-amber-400" />
                    <span>Aapni Gapsap Community Directory</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    1,000 IDs Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Connect with people from Gujarat (Ahmedabad, Rajkot, Junagadh, Surat, Vadodara) & across India.
                </p>
              </div>

              <button
                onClick={() => setIsCommunityModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="mt-4 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={botSearchQuery}
                onChange={(e) => setBotSearchQuery(e.target.value)}
                placeholder="Search by name, city, or interest (e.g., Aarav, Surat, Kathiyawadi, Photography, Vadodara, Rajkot...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* City Filter Pills */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setBotCityFilter('all')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  botCityFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All 1,000 Members
              </button>
              {['Ahmedabad', 'Rajkot', 'Junagadh', 'Surat', 'Vadodara', 'Mumbai', 'Pune', 'Delhi', 'Jaipur', 'Bengaluru'].map(
                (city) => {
                  const isActive = botCityFilter.toLowerCase() === city.toLowerCase();
                  return (
                    <button
                      key={city}
                      onClick={() => setBotCityFilter(city)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-rose-500 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {city}
                    </button>
                  );
                }
              )}
            </div>

            {/* Members List */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
              {communityRobots.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No community members found matching your search.
                </div>
              ) : (
                communityRobots.map((robot) => (
                  <div
                    key={robot.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={robot.avatar}
                          alt={robot.displayName}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-slate-700"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-white truncate">{robot.displayName}</h4>
                          <span className="text-[10px] text-slate-400">@{robot.username}</span>
                          <span className="text-[9px] bg-amber-500/15 text-amber-300 font-medium px-1.5 py-0.2 rounded-full border border-amber-500/30">
                            {robot.city}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {robot.bio}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        startChatWithUser(robot);
                        setIsCommunityModalOpen(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform shrink-0 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
