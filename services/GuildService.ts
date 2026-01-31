import { Guild, GuildPost, GuildEvent, MOCK_GUILDS, MOCK_GUILD_POSTS, MOCK_GUILD_EVENTS } from '@/mocks/guilds';

export interface GuildWithStats extends Guild {
  recentActivity: number;
  upcomingEventCount: number;
}

export function getAllGuilds(): Guild[] {
  return MOCK_GUILDS;
}

export function getGuildById(guildId: string): Guild | undefined {
  return MOCK_GUILDS.find(guild => guild.id === guildId);
}

export function getGuildsByUniverse(universeId: string): Guild[] {
  return MOCK_GUILDS.filter(guild => guild.universeId === universeId);
}

export function getGuildPosts(guildId: string): GuildPost[] {
  return MOCK_GUILD_POSTS
    .filter(post => post.guildId === guildId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getGuildEvents(guildId: string): GuildEvent[] {
  return MOCK_GUILD_EVENTS
    .filter(event => event.guildId === guildId)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export function getUpcomingGuildEvents(guildId: string): GuildEvent[] {
  const now = new Date();
  return getGuildEvents(guildId).filter(event => event.startDate > now);
}

export function getFeaturedGuilds(limit: number = 5): GuildWithStats[] {
  return MOCK_GUILDS
    .map(guild => ({
      ...guild,
      recentActivity: MOCK_GUILD_POSTS.filter(p => p.guildId === guild.id).length,
      upcomingEventCount: MOCK_GUILD_EVENTS.filter(
        e => e.guildId === guild.id && e.startDate > new Date()
      ).length,
    }))
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, limit);
}

export function searchGuilds(query: string): Guild[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_GUILDS.filter(
    guild =>
      guild.name.toLowerCase().includes(lowerQuery) ||
      guild.description.toLowerCase().includes(lowerQuery) ||
      guild.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getGuildMembers(guildId: string): string[] {
  const guild = getGuildById(guildId);
  if (!guild) return [];
  
  const memberIds = new Set<string>();
  memberIds.add(guild.founderUserId);
  
  MOCK_GUILD_POSTS
    .filter(post => post.guildId === guildId)
    .forEach(post => memberIds.add(post.authorId));
  
  return Array.from(memberIds);
}

export function formatMemberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function getPostTypeLabel(type: GuildPost['type']): string {
  const labels: Record<GuildPost['type'], string> = {
    discussion: 'Discussion',
    art: 'Fan Art',
    theory: 'Theory',
    meme: 'Meme',
    announcement: 'Announcement',
  };
  return labels[type];
}

export function getPostTypeColor(type: GuildPost['type']): string {
  const colors: Record<GuildPost['type'], string> = {
    discussion: '#4D7CFF',
    art: '#B040FF',
    theory: '#00F0FF',
    meme: '#FF6B35',
    announcement: '#FFD700',
  };
  return colors[type];
}
