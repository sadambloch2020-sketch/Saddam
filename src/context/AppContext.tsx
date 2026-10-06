import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TabType,
  UserProfile,
  ReelItem,
  UserStoryGroup,
  StoryItem,
  ChatThread,
  ChatMessage,
  HotspotLocation,
} from '../types';
import {
  CURRENT_USER,
  INITIAL_REELS,
  INITIAL_STORIES,
  INITIAL_HOTSPOTS,
  INITIAL_CHATS,
} from '../data/initialData';
import { generateBotReply } from '../utils/botChatEngine';

interface AppContextType {
  currentUser: UserProfile;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  // Camera Studio modal/overlay
  isCameraOpen: boolean;
  cameraMode: 'reel' | 'story' | 'chat';
  openCamera: (mode?: 'reel' | 'story' | 'chat', chatRecipientId?: string) => void;
  closeCamera: () => void;
  cameraChatRecipientId: string | null;

  // Reels
  reels: ReelItem[];
  addReel: (reel: Omit<ReelItem, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'comments'>) => void;
  toggleLikeReel: (reelId: string) => void;
  toggleBookmarkReel: (reelId: string) => void;
  addCommentToReel: (reelId: string, text: string) => void;

  // Stories
  stories: UserStoryGroup[];
  activeStoryGroup: UserStoryGroup | null;
  activeStoryIndex: number;
  openStoryViewer: (group: UserStoryGroup, startIndex?: number) => void;
  closeStoryViewer: () => void;
  nextStory: () => void;
  prevStory: () => void;
  addStory: (story: Omit<StoryItem, 'id' | 'timestamp'>) => void;

  // Chat
  chats: ChatThread[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  sendMessage: (threadId: string, message: Partial<ChatMessage>) => void;
  typingBotId: string | null;
  typingBotName: string | null;
  startChatWithUser: (participant: UserProfile) => void;

  // Hotspots / Geolocation
  hotspots: HotspotLocation[];
  userLocation: { lat: number; lng: number; name: string } | null;
  requestUserLocation: () => Promise<void>;
  selectedHotspot: HotspotLocation | null;
  setSelectedHotspot: (spot: HotspotLocation | null) => void;

  // Filtered Reels by location tag
  selectedLocationTag: string | null;
  setSelectedLocationTag: (loc: string | null) => void;

  // Notifications toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aapni_gapsap_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [activeTab, setActiveTab] = useState<TabType>('reels');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'reel' | 'story' | 'chat'>('reel');
  const [cameraChatRecipientId, setCameraChatRecipientId] = useState<string | null>(null);

  // Reels
  const [reels, setReels] = useState<ReelItem[]>(() => {
    try {
      const saved = localStorage.getItem('aapni_gapsap_reels');
      if (saved) {
        const parsed: ReelItem[] = JSON.parse(saved);
        return parsed.map((r, i) => {
          if (r.videoUrl.includes('commondatastorage.googleapis.com')) {
            const themes: ('sunset' | 'mountain' | 'food')[] = ['sunset', 'mountain', 'food'];
            return { ...r, videoUrl: `theme:${themes[i % 3]}` };
          }
          return r;
        });
      }
    } catch {
      // Fallback
    }
    return INITIAL_REELS;
  });

  // Stories
  const [stories, setStories] = useState<UserStoryGroup[]>(() => {
    const saved = localStorage.getItem('aapni_gapsap_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });
  const [activeStoryGroup, setActiveStoryGroup] = useState<UserStoryGroup | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Chats
  const [chats, setChats] = useState<ChatThread[]>(() => {
    const saved = localStorage.getItem('aapni_gapsap_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [typingBotId, setTypingBotId] = useState<string | null>(null);
  const [typingBotName, setTypingBotName] = useState<string | null>(null);

  // Hotspots & Location
  const [hotspots] = useState<HotspotLocation[]>(INITIAL_HOTSPOTS);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotLocation | null>(null);
  const [selectedLocationTag, setSelectedLocationTag] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('aapni_gapsap_reels', JSON.stringify(reels));
    } catch {
      // localStorage quota safeguard
    }
  }, [reels]);

  useEffect(() => {
    try {
      localStorage.setItem('aapni_gapsap_stories', JSON.stringify(stories));
    } catch {
      // localStorage quota safeguard
    }
  }, [stories]);

  useEffect(() => {
    try {
      localStorage.setItem('aapni_gapsap_chats', JSON.stringify(chats));
    } catch {
      // localStorage quota safeguard
    }
  }, [chats]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const openCamera = (mode: 'reel' | 'story' | 'chat' = 'reel', chatRecipientId?: string) => {
    setCameraMode(mode);
    setCameraChatRecipientId(chatRecipientId || null);
    setIsCameraOpen(true);
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    setCameraChatRecipientId(null);
  };

  const addReel = (newReelData: Omit<ReelItem, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'comments'>) => {
    const newReel: ReelItem = {
      ...newReelData,
      id: `reel_${Date.now()}`,
      createdAt: 'Just now',
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      comments: [],
    };
    setReels((prev) => [newReel, ...prev]);
    showToast('Your video Reel has been shared on Aapni Gapsap! 🎉');
  };

  const toggleLikeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const isLiked = !r.isLiked;
          return {
            ...r,
            isLiked,
            likesCount: isLiked ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
          };
        }
        return r;
      })
    );
  };

  const toggleBookmarkReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const isBookmarked = !r.isBookmarked;
          showToast(isBookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks');
          return { ...r, isBookmarked };
        }
        return r;
      })
    );
  };

  const addCommentToReel = (reelId: string, text: string) => {
    if (!text.trim()) return;
    const newComment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: 'Just now',
      likes: 0,
    };

    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: [newComment, ...r.comments],
          };
        }
        return r;
      })
    );
    showToast('Comment posted! 💬');
  };

  // Stories navigation
  const openStoryViewer = (group: UserStoryGroup, startIndex = 0) => {
    setActiveStoryGroup(group);
    setActiveStoryIndex(startIndex);
  };

  const closeStoryViewer = () => {
    setActiveStoryGroup(null);
    setActiveStoryIndex(0);
  };

  const nextStory = () => {
    if (!activeStoryGroup) return;
    if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
      setActiveStoryIndex((prev) => prev + 1);
    } else {
      // Find next story group
      const currentIndex = stories.findIndex((g) => g.userId === activeStoryGroup.userId);
      if (currentIndex !== -1 && currentIndex < stories.length - 1) {
        setActiveStoryGroup(stories[currentIndex + 1]);
        setActiveStoryIndex(0);
      } else {
        closeStoryViewer();
      }
    }
  };

  const prevStory = () => {
    if (!activeStoryGroup) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => prev - 1);
    } else {
      const currentIndex = stories.findIndex((g) => g.userId === activeStoryGroup.userId);
      if (currentIndex > 0) {
        const prevGroup = stories[currentIndex - 1];
        setActiveStoryGroup(prevGroup);
        setActiveStoryIndex(prevGroup.stories.length - 1);
      } else {
        closeStoryViewer();
      }
    }
  };

  const addStory = (storyData: Omit<StoryItem, 'id' | 'timestamp'>) => {
    const newStory: StoryItem = {
      ...storyData,
      id: `story_${Date.now()}`,
      timestamp: 'Just now',
    };

    setStories((prev) => {
      const myGroupIndex = prev.findIndex((g) => g.userId === currentUser.id);
      if (myGroupIndex !== -1) {
        const updated = [...prev];
        updated[myGroupIndex] = {
          ...updated[myGroupIndex],
          hasUnseen: true,
          stories: [newStory, ...updated[myGroupIndex].stories],
        };
        return updated;
      } else {
        const newGroup: UserStoryGroup = {
          userId: currentUser.id,
          username: currentUser.username,
          userAvatar: currentUser.avatar,
          hasUnseen: true,
          stories: [newStory],
        };
        return [newGroup, ...prev];
      }
    });
    showToast('Added to your 24h Story! 📸');
  };

  // Chat
  const sendMessage = (threadId: string, message: Partial<ChatMessage>) => {
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...message,
    };

    const targetThread = chats.find((t) => t.id === threadId);
    const participant = targetThread?.participant;

    setChats((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          const preview = message.text || (message.mediaType === 'video' ? '📹 Video clip' : '🎤 Audio note');
          return {
            ...thread,
            lastMessage: preview,
            lastTimestamp: 'Just now',
            messages: [...thread.messages, newMsg],
          };
        }
        return thread;
      })
    );

    // If recipient is a community bot or contact, generate intelligent auto-reply
    if (participant && participant.id !== currentUser.id) {
      setTypingBotId(participant.id);
      setTypingBotName(participant.displayName);

      const delay = Math.floor(Math.random() * 300) + 850; // realistic typing pause
      setTimeout(() => {
        const reply = generateBotReply(message.text || '', participant);
        const botMsg: ChatMessage = {
          id: `m_bot_${Date.now()}`,
          senderId: participant.id,
          text: reply.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reaction: reply.reaction,
          mediaType: reply.mediaType,
          mediaUrl: reply.mediaUrl,
        };

        setChats((current) =>
          current.map((t) => {
            if (t.id === threadId) {
              return {
                ...t,
                lastMessage: reply.text,
                lastTimestamp: 'Just now',
                messages: [...t.messages, botMsg],
              };
            }
            return t;
          })
        );
        setTypingBotId(null);
        setTypingBotName(null);
      }, delay);
    }
  };

  const startChatWithUser = (participant: UserProfile) => {
    setChats((prev) => {
      const existing = prev.find((t) => t.participant.id === participant.id);
      if (existing) {
        setActiveChatId(existing.id);
        return prev;
      }

      const welcomeReply = generateBotReply('hello', participant);
      const newThreadId = `chat_${participant.id}`;
      const newThread: ChatThread = {
        id: newThreadId,
        participant,
        lastMessage: welcomeReply.text,
        lastTimestamp: 'Just now',
        unreadCount: 0,
        isOnline: true,
        messages: [
          {
            id: `m_bot_wel_${Date.now()}`,
            senderId: participant.id,
            text: welcomeReply.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reaction: welcomeReply.reaction,
          },
        ],
      };
      setActiveChatId(newThreadId);
      return [newThread, ...prev];
    });

    setActiveTab('chat');
    showToast(`Connected with ${participant.displayName}! 💬`);
  };

  // Geolocation
  const requestUserLocation = async () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }
    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({
            lat,
            lng,
            name: `Nearby GPS (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
          });
          showToast('Location updated! Showing nearby Gapsap conversation hotspots.');
          resolve();
        },
        () => {
          // Fallback location for demo
          setUserLocation({
            lat: 18.9438,
            lng: 72.8231,
            name: 'Marine Drive & South Coast',
          });
          showToast('Using regional location (Marine Drive)');
          resolve();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeTab,
        setActiveTab,
        isCameraOpen,
        cameraMode,
        openCamera,
        closeCamera,
        cameraChatRecipientId,
        reels,
        addReel,
        toggleLikeReel,
        toggleBookmarkReel,
        addCommentToReel,
        stories,
        activeStoryGroup,
        activeStoryIndex,
        openStoryViewer,
        closeStoryViewer,
        nextStory,
        prevStory,
        addStory,
        chats,
        activeChatId,
        setActiveChatId,
        sendMessage,
        typingBotId,
        typingBotName,
        startChatWithUser,
        hotspots,
        userLocation,
        requestUserLocation,
        selectedHotspot,
        setSelectedHotspot,
        selectedLocationTag,
        setSelectedLocationTag,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
