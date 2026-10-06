export type TabType = 'feed' | 'reels' | 'camera' | 'nearby' | 'chat' | 'profile';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  location: string;
  city?: string;
  state?: string;
  specialty?: string;
  isVerified?: boolean;
  isBot?: boolean;
  followersCount: number;
  followingCount: number;
  reelsCount: number;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export interface ReelItem {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  videoUrl: string; // Blob URL, Canvas theme, or Photo URL
  mediaType?: 'video' | 'image';
  thumbnailUrl?: string;
  caption: string;
  tags: string[];
  audioTitle: string;
  audioArtist: string;
  locationName: string;
  coordinates?: { lat: number; lng: number };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
  comments: Comment[];
  filterApplied?: string;
}

export interface StoryItem {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  caption?: string;
  locationName?: string;
  timestamp: string;
  durationMs: number;
  filterApplied?: string;
}

export interface UserStoryGroup {
  userId: string;
  username: string;
  userAvatar: string;
  hasUnseen: boolean;
  stories: StoryItem[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'video' | 'audio' | 'image';
  timestamp: string;
  reaction?: string;
  locationName?: string;
}

export interface ChatThread {
  id: string;
  participant: UserProfile;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  isOnline: boolean;
  messages: ChatMessage[];
}

export interface HotspotLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  distanceKm: number;
  activeUsers: number;
  trendingTopic: string;
  famousFor?: string;
  reelsCount: number;
  coordinates: { lat: number; lng: number };
  category?: 'promenade' | 'heritage' | 'food' | 'nature' | 'youth' | 'spiritual';
  popularTimes?: string;
}
