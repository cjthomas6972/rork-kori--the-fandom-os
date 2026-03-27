export interface Location {
  lat: number;
  lng: number;
  city: string;
  state?: string;
  country: string;
}

export interface SafetySettings {
  allowDMsFrom: 'everyone' | 'alignedOnly' | 'friendsOnly';
  showDistance: boolean;
  showLocation: 'off' | 'cityOnly' | 'approxArea';
  blockedUserIds: string[];
}

export interface UserCoreProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio: string;
  location: Location;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    instagram?: string;
  };
  safety: SafetySettings;
  friends: string[];
  activeUniverseIds: string[];
  createdAt: Date;
}

export interface UniverseProfileVisibility {
  publicInUniverse: boolean;
  showInAligned: boolean;
  showInDiscover: boolean;
}

export interface UserUniverseProfile {
  id: string;
  userId: string;
  universeId: string;
  identityTitle: string;
  fandomTags: string[];
  interests: string[];
  values: string[];
  vibeTags: string[];
  lookingFor: string[];
  dealbreakers: string[];
  visibility: UniverseProfileVisibility;
  media: {
    galleryUrls: string[];
    featuredClipUrl?: string;
  };
  lastActiveAt: Date;
}

export type PostScope = 'universe' | 'friends' | 'guild';

export interface Post {
  id: string;
  authorId: string;
  universeId: string;
  scope: PostScope;
  guildId?: string;
  content: string;
  mediaUrls: string[];
  tags: string[];
  createdAt: Date;
  likeUserIds: string[];
  commentIds: string[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface DMThread {
  id: string;
  memberIds: string[];
  universeId: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  mediaUrls?: string[];
  createdAt: Date;
  isRead: boolean;
}

export type GuildRole = 'leader' | 'officer' | 'member';

export interface GuildFull {
  id: string;
  universeId: string;
  name: string;
  tagline: string;
  description: string;
  planetImageUrl?: string;
  bannerUrl?: string;
  location?: Location;
  isMembersHidden: boolean;
  memberIds: string[];
  roleMap: Record<string, GuildRole>;
  powerScore: number;
  ratingAvg: number;
  ratingCount: number;
  tags: string[];
  rules?: string[];
  createdAt: Date;
}

export interface EventMeetup {
  id: string;
  universeId: string;
  guildId?: string;
  hostUserId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  locationText?: string;
  locationGeo?: { lat: number; lng: number };
  isOnline: boolean;
  visibility: 'public' | 'guildOnly' | 'friendsOnly';
  attendeeIds: string[];
  maxAttendees?: number;
  imageUrl?: string;
  tags: string[];
  createdAt: Date;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  universeId?: string;
  status: FriendRequestStatus;
  createdAt: Date;
}

export interface GuildInvite {
  id: string;
  guildId: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface MeetupInvite {
  id: string;
  eventId: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface AlignmentScore {
  score: number;
  reasons: string[];
  breakdown: {
    interests: number;
    fandomTags: number;
    values: number;
    vibeTags: number;
    lookingFor: number;
    distance: number;
    dealbreakers: number;
  };
}

export interface SocialUser extends UserCoreProfile {
  universeProfiles: UserUniverseProfile[];
}

export const VIBE_TAGS = [
  'soft-spoken', 'chaotic-good', 'deep-talk', 'meme-lord', 'theory-crafter',
  'creative', 'competitive', 'casual', 'night-owl', 'morning-person',
  'introvert', 'extrovert', 'chill', 'energetic', 'sarcastic',
  'supportive', 'analytical', 'spontaneous', 'organized', 'adventurous'
] as const;

export const LOOKING_FOR = [
  'friends', 'guilds', 'meetups', 'collabs', 'dating', 'study-buddy',
  'gaming-partner', 'cosplay-group', 'watch-party', 'convention-buddy'
] as const;

export const INTERESTS = [
  'cosplay', 'fan-art', 'fanfiction', 'collecting', 'gaming',
  'streaming', 'theory-crafting', 'conventions', 'merchandise',
  'manga-reading', 'anime-watching', 'competitive-gaming', 'speedrunning',
  'lore-diving', 'community-building', 'content-creation'
] as const;

export const VALUES = [
  'creativity', 'authenticity', 'community', 'growth', 'fun',
  'respect', 'inclusion', 'passion', 'dedication', 'humor',
  'support', 'exploration', 'competition', 'collaboration'
] as const;

export interface UserEntitlements {
  userId: string;
  universePassActive: boolean;
  universePassExpiresAt?: Date;
  guildProGuildIds: string[];
}

export interface Signal {
  id: string;
  userId: string;
  universeId: string;
  activatedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface Beacon {
  id: string;
  userId: string;
  universeId: string;
  content: string;
  imageUrl?: string;
  lookingFor: string[];
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface DailyPulse {
  id: string;
  userId: string;
  universeId: string;
  response: string;
  promptType: 'watching' | 'playing' | 'reading' | 'building' | 'going_to';
  createdAt: Date;
}

export const PULSE_PROMPTS = [
  { type: 'watching', label: 'Watching', emoji: '📺' },
  { type: 'playing', label: 'Playing', emoji: '🎮' },
  { type: 'reading', label: 'Reading', emoji: '📚' },
  { type: 'building', label: 'Building', emoji: '🛠️' },
  { type: 'going_to', label: 'Going to', emoji: '🎯' },
] as const;
