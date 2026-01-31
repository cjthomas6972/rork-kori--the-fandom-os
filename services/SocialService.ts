import { AlignmentScore, SocialUser, UserUniverseProfile } from '@/types/social';
import { SOCIAL_USERS, getSocialUsersByUniverse, getUserUniverseProfile } from '@/mocks/socialUsers';
import { 
  GUILDS_FULL, 
  POSTS, 
  EVENTS, 
  DM_THREADS, 
  MESSAGES, 
  FRIEND_REQUESTS, 
  GUILD_INVITES, 
  MEETUP_INVITES,
  getGuildsFullByUniverse,
  getPostsByUniverse,
  getEventsByUniverse,
  getUserGuilds,
} from '@/mocks/socialData';

const ALIGNMENT_WEIGHTS = {
  interests: 30,
  fandomTags: 20,
  values: 15,
  vibeTags: 15,
  lookingFor: 10,
  distance: 10,
  dealbreakers: -40,
};

function calculateArrayOverlap(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 || arr2.length === 0) return 0;
  const set1 = new Set(arr1.map(s => s.toLowerCase()));
  const overlap = arr2.filter(item => set1.has(item.toLowerCase())).length;
  const maxLength = Math.max(arr1.length, arr2.length);
  return (overlap / maxLength) * 100;
}

function getTopMatchReasons(
  profile1: UserUniverseProfile,
  profile2: UserUniverseProfile
): string[] {
  const reasons: string[] = [];
  
  const sharedFandom = profile1.fandomTags.filter(t => 
    profile2.fandomTags.map(s => s.toLowerCase()).includes(t.toLowerCase())
  );
  if (sharedFandom.length > 0) {
    reasons.push(`Both love ${sharedFandom[0]}`);
  }
  
  const sharedInterests = profile1.interests.filter(i => 
    profile2.interests.includes(i)
  );
  if (sharedInterests.length > 0) {
    reasons.push(`Shared interest: ${sharedInterests[0].replace('-', ' ')}`);
  }
  
  const sharedVibes = profile1.vibeTags.filter(v => 
    profile2.vibeTags.includes(v)
  );
  if (sharedVibes.length > 0) {
    reasons.push(`Similar vibe: ${sharedVibes[0].replace('-', ' ')}`);
  }
  
  const sharedValues = profile1.values.filter(v => 
    profile2.values.includes(v)
  );
  if (sharedValues.length > 0 && reasons.length < 3) {
    reasons.push(`Values ${sharedValues[0]}`);
  }
  
  return reasons.slice(0, 3);
}

export function calculateAlignment(
  user1Profile: UserUniverseProfile,
  user2Profile: UserUniverseProfile,
  user1Location?: { lat: number; lng: number },
  user2Location?: { lat: number; lng: number }
): AlignmentScore {
  const interestsScore = calculateArrayOverlap(user1Profile.interests, user2Profile.interests);
  const fandomScore = calculateArrayOverlap(user1Profile.fandomTags, user2Profile.fandomTags);
  const valuesScore = calculateArrayOverlap(user1Profile.values, user2Profile.values);
  const vibesScore = calculateArrayOverlap(user1Profile.vibeTags, user2Profile.vibeTags);
  const lookingForScore = calculateArrayOverlap(user1Profile.lookingFor, user2Profile.lookingFor);
  
  let distanceScore = 50;
  if (user1Location && user2Location) {
    const distance = calculateDistance(user1Location, user2Location);
    if (distance < 50) distanceScore = 100;
    else if (distance < 100) distanceScore = 80;
    else if (distance < 500) distanceScore = 50;
    else distanceScore = 20;
  }
  
  let dealbreakerPenalty = 0;
  const user1Dealbreakers = user1Profile.dealbreakers.map(d => d.toLowerCase());
  const user2Dealbreakers = user2Profile.dealbreakers.map(d => d.toLowerCase());
  
  if (user1Dealbreakers.includes('toxicity') || user2Dealbreakers.includes('toxicity')) {
    dealbreakerPenalty = 0;
  }
  
  const weightedScore = Math.round(
    (interestsScore * ALIGNMENT_WEIGHTS.interests / 100) +
    (fandomScore * ALIGNMENT_WEIGHTS.fandomTags / 100) +
    (valuesScore * ALIGNMENT_WEIGHTS.values / 100) +
    (vibesScore * ALIGNMENT_WEIGHTS.vibeTags / 100) +
    (lookingForScore * ALIGNMENT_WEIGHTS.lookingFor / 100) +
    (distanceScore * ALIGNMENT_WEIGHTS.distance / 100) +
    dealbreakerPenalty
  );
  
  const reasons = getTopMatchReasons(user1Profile, user2Profile);
  
  return {
    score: Math.max(0, Math.min(100, weightedScore)),
    reasons,
    breakdown: {
      interests: Math.round(interestsScore),
      fandomTags: Math.round(fandomScore),
      values: Math.round(valuesScore),
      vibeTags: Math.round(vibesScore),
      lookingFor: Math.round(lookingForScore),
      distance: Math.round(distanceScore),
      dealbreakers: dealbreakerPenalty,
    },
  };
}

function calculateDistance(
  loc1: { lat: number; lng: number },
  loc2: { lat: number; lng: number }
): number {
  const R = 3959;
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export interface AlignedUser extends SocialUser {
  alignment: AlignmentScore;
  universeProfile: UserUniverseProfile;
}

export function getAlignedUsersForUniverse(
  currentUserId: string,
  universeId: string,
  minScore: number = 20
): AlignedUser[] {
  const currentUser = SOCIAL_USERS.find(u => u.id === currentUserId);
  if (!currentUser) return [];
  
  const currentProfile = getUserUniverseProfile(currentUserId, universeId);
  if (!currentProfile) return [];
  
  const universeUsers = getSocialUsersByUniverse(universeId)
    .filter(u => u.id !== currentUserId);
  
  const alignedUsers: AlignedUser[] = [];
  
  for (const user of universeUsers) {
    const userProfile = getUserUniverseProfile(user.id, universeId);
    if (!userProfile || !userProfile.visibility.showInAligned) continue;
    
    const alignment = calculateAlignment(
      currentProfile,
      userProfile,
      currentUser.location,
      user.location
    );
    
    if (alignment.score >= minScore) {
      alignedUsers.push({
        ...user,
        alignment,
        universeProfile: userProfile,
      });
    }
  }
  
  return alignedUsers.sort((a, b) => b.alignment.score - a.alignment.score);
}

export function getPublicUsersInUniverse(
  universeId: string,
  excludeUserId?: string
): SocialUser[] {
  return getSocialUsersByUniverse(universeId)
    .filter(u => {
      if (excludeUserId && u.id === excludeUserId) return false;
      const profile = getUserUniverseProfile(u.id, universeId);
      return profile?.visibility.publicInUniverse && profile?.visibility.showInDiscover;
    });
}

export function getUniverseFeed(universeId: string) {
  return getPostsByUniverse(universeId);
}

export function getUniverseGuilds(universeId: string) {
  return getGuildsFullByUniverse(universeId);
}

export function getUniverseEvents(universeId: string) {
  return getEventsByUniverse(universeId);
}

export function getUserGuildsList(userId: string) {
  return getUserGuilds(userId);
}

export function getDiscoverGuilds(universeId?: string) {
  if (universeId) {
    return GUILDS_FULL.filter(g => g.universeId === universeId)
      .sort((a, b) => b.powerScore - a.powerScore);
  }
  return GUILDS_FULL.sort((a, b) => b.powerScore - a.powerScore);
}

export function getUserDMThreads(userId: string) {
  return DM_THREADS.filter(t => t.memberIds.includes(userId))
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

export function getThreadMessages(threadId: string) {
  return MESSAGES.filter(m => m.threadId === threadId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export function getPendingFriendRequests(userId: string) {
  return FRIEND_REQUESTS.filter(r => r.toUserId === userId && r.status === 'pending');
}

export function getSentFriendRequests(userId: string) {
  return FRIEND_REQUESTS.filter(r => r.fromUserId === userId);
}

export function getPendingGuildInvites(userId: string) {
  return GUILD_INVITES.filter(i => i.toUserId === userId && i.status === 'pending');
}

export function getPendingMeetupInvites(userId: string) {
  return MEETUP_INVITES.filter(i => i.toUserId === userId && i.status === 'pending');
}

export function getUnreadCount(userId: string): number {
  const threads = getUserDMThreads(userId);
  const friendRequests = getPendingFriendRequests(userId);
  const guildInvites = getPendingGuildInvites(userId);
  const meetupInvites = getPendingMeetupInvites(userId);
  
  const unreadMessages = threads.reduce((sum, t) => sum + t.unreadCount, 0);
  
  return unreadMessages + friendRequests.length + guildInvites.length + meetupInvites.length;
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatEventDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getAlignmentLabel(score: number): string {
  if (score >= 90) return 'Perfect Match';
  if (score >= 75) return 'High Resonance';
  if (score >= 60) return 'Strong Alignment';
  if (score >= 45) return 'Good Match';
  if (score >= 30) return 'Some Overlap';
  return 'Low Resonance';
}

export function getAlignmentColor(score: number): string {
  if (score >= 90) return '#00FF94';
  if (score >= 75) return '#00F0FF';
  if (score >= 60) return '#4D7CFF';
  if (score >= 45) return '#B040FF';
  if (score >= 30) return '#FF6B35';
  return '#6B6B82';
}

export { SOCIAL_USERS, GUILDS_FULL, POSTS, EVENTS };
