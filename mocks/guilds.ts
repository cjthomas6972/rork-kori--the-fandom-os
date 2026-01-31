export interface Guild {
  id: string;
  name: string;
  description: string;
  universeId: string;
  color: string;
  memberCount: number;
  isPublic: boolean;
  tags: string[];
  foundedAt: Date;
  founderUserId: string;
  coverImageUrl?: string;
  rules?: string[];
}

export interface GuildPost {
  id: string;
  guildId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: Date;
  type: 'discussion' | 'art' | 'theory' | 'meme' | 'announcement';
}

export interface GuildEvent {
  id: string;
  guildId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  isVirtual: boolean;
  attendeeCount: number;
  maxAttendees?: number;
  imageUrl?: string;
}

export const MOCK_GUILDS: Guild[] = [
  {
    id: 'guild_001',
    name: 'One Piece Theorists',
    description: 'Deep dive into One Piece lore, theories, and chapter discussions. Weekly theory threads and manga breakdowns.',
    universeId: 'anime-shonen',
    color: '#FF6B35',
    memberCount: 2847,
    isPublic: true,
    tags: ['One Piece', 'Theories', 'Manga', 'Lore'],
    foundedAt: new Date('2023-06-15'),
    founderUserId: 'user_001',
    rules: [
      'Mark spoilers properly',
      'Respect all theories, no matter how wild',
      'No powerscaling toxicity',
      'Weekly chapter discussions only in pinned thread',
    ],
  },
  {
    id: 'guild_002',
    name: 'Souls Veterans',
    description: 'For those who have linked the flame countless times. PvP builds, challenge runs, and deep lore discussions.',
    universeId: 'gaming-souls',
    color: '#B040FF',
    memberCount: 1923,
    isPublic: true,
    tags: ['Dark Souls', 'Elden Ring', 'Bloodborne', 'Challenge Runs'],
    foundedAt: new Date('2023-03-22'),
    founderUserId: 'user_006',
    rules: [
      'Git gud mentality only',
      'Help new players',
      'Respect all playstyles',
      'Invasions are part of the game',
    ],
  },
  {
    id: 'guild_003',
    name: 'Star Wars Canon Debate',
    description: 'Civil discussions about Star Wars lore, timeline debates, and which trilogy is actually the best (it\'s always been the OT).',
    universeId: 'sci-fi-space',
    color: '#00D4FF',
    memberCount: 4521,
    isPublic: true,
    tags: ['Star Wars', 'Lore', 'Canon', 'Legends'],
    foundedAt: new Date('2022-12-01'),
    founderUserId: 'user_003',
    rules: [
      'Keep debates civil',
      'All eras are valid',
      'No sequel/prequel wars',
      'Legends content welcome',
    ],
  },
  {
    id: 'guild_004',
    name: 'Attack on Titan Analysis',
    description: 'For those still processing the ending. Deep character analysis, symbolism discussions, and timeline breakdowns.',
    universeId: 'anime-seinen',
    color: '#FF006E',
    memberCount: 3421,
    isPublic: true,
    tags: ['Attack on Titan', 'Analysis', 'Ending Discussion', 'Characters'],
    foundedAt: new Date('2023-01-10'),
    founderUserId: 'user_002',
    rules: [
      'Ending opinions are all valid',
      'No character hate threads',
      'Mark manga spoilers',
      'Be respectful in debates',
    ],
  },
  {
    id: 'guild_005',
    name: 'Elden Ring Lore Masters',
    description: 'VaatiVidya stan account. Every item description analyzed. The Greater Will demands answers.',
    universeId: 'gaming-souls',
    color: '#FFD700',
    memberCount: 2891,
    isPublic: true,
    tags: ['Elden Ring', 'Lore', 'VaatiVidya', 'Item Descriptions'],
    foundedAt: new Date('2023-04-05'),
    founderUserId: 'user_001',
    rules: [
      'All theories welcome',
      'Source your claims',
      'Spoiler tags for DLC',
      'Respect different interpretations',
    ],
  },
  {
    id: 'guild_006',
    name: 'Marvel Deep Cuts',
    description: 'Beyond the MCU. Classic runs, forgotten characters, and the comics that changed everything.',
    universeId: 'comics-marvel',
    color: '#ED1D24',
    memberCount: 5123,
    isPublic: true,
    tags: ['Marvel', 'Comics', 'X-Men', 'Classic Runs'],
    foundedAt: new Date('2022-09-20'),
    founderUserId: 'user_002',
    rules: [
      'Comics first, movies second',
      'Recommend runs, don\'t gatekeep',
      'Variant covers discussion welcome',
      'Mutant rights are human rights',
    ],
  },
  {
    id: 'guild_007',
    name: 'Cyberpunk Aesthetics',
    description: 'High tech, low life. Art, worldbuilding, fashion, and the genre that predicted everything.',
    universeId: 'sci-fi-cyberpunk',
    color: '#FF00FF',
    memberCount: 1567,
    isPublic: true,
    tags: ['Cyberpunk', 'Aesthetic', 'Art', 'Worldbuilding'],
    foundedAt: new Date('2023-07-01'),
    founderUserId: 'user_007',
    rules: [
      'OC art always welcome',
      'Credit original artists',
      'Discuss the genre, not just the game',
      'Neon everything',
    ],
  },
  {
    id: 'guild_008',
    name: 'Gundam Universe',
    description: 'All Gundam, all the time. UC, AU, Gunpla, and why Char did everything wrong.',
    universeId: 'anime-mecha',
    color: '#4D7CFF',
    memberCount: 2134,
    isPublic: true,
    tags: ['Gundam', 'Mecha', 'Gunpla', 'Char'],
    foundedAt: new Date('2023-02-14'),
    founderUserId: 'user_003',
    rules: [
      'All series are valid entries',
      'Gunpla builds always welcome',
      'No timeline gatekeeping',
      'Newtypes are just built different',
    ],
  },
];

export const MOCK_GUILD_POSTS: GuildPost[] = [
  {
    id: 'post_001',
    guildId: 'guild_001',
    authorId: 'user_001',
    authorName: 'Alex Chen',
    authorAvatar: '#FF6B35',
    content: 'New theory: The One Piece is actually the friends we made along the way. But seriously, what if it\'s Joyboy\'s dream journal?',
    likes: 234,
    comments: 89,
    createdAt: new Date('2024-01-10T14:30:00'),
    type: 'theory',
  },
  {
    id: 'post_002',
    guildId: 'guild_001',
    authorId: 'user_004',
    authorName: 'Sam Nakamura',
    authorAvatar: '#FF006E',
    content: 'Weekly chapter discussion is live! What did everyone think about that final panel? I literally screamed.',
    likes: 456,
    comments: 203,
    createdAt: new Date('2024-01-12T10:00:00'),
    type: 'discussion',
  },
  {
    id: 'post_003',
    guildId: 'guild_002',
    authorId: 'user_006',
    authorName: 'Kai Winters',
    authorAvatar: '#4D7CFF',
    content: 'Just completed my SL1 run. 47 hours. My hands are shaking. Ask me anything about pure pain.',
    likes: 892,
    comments: 156,
    createdAt: new Date('2024-01-11T23:15:00'),
    type: 'discussion',
  },
  {
    id: 'post_004',
    guildId: 'guild_005',
    authorId: 'user_001',
    authorName: 'Alex Chen',
    authorAvatar: '#FF6B35',
    content: 'Deep dive: The Outer Gods and their connection to the Elden Beast. 20 minute read but worth it.',
    likes: 567,
    comments: 98,
    createdAt: new Date('2024-01-09T16:45:00'),
    type: 'theory',
  },
  {
    id: 'post_005',
    guildId: 'guild_006',
    authorId: 'user_002',
    authorName: 'Maya Rodriguez',
    authorAvatar: '#B040FF',
    content: 'Just finished my X-Men 97 inspired Jean Grey cosplay! Progress pics in thread.',
    likes: 1203,
    comments: 89,
    createdAt: new Date('2024-01-08T12:00:00'),
    type: 'art',
  },
];

export const MOCK_GUILD_EVENTS: GuildEvent[] = [
  {
    id: 'event_001',
    guildId: 'guild_001',
    title: 'One Piece Chapter 1100 Watch Party',
    description: 'Live reaction to the new chapter drop. Discord voice chat and screen share.',
    startDate: new Date('2024-01-20T18:00:00'),
    isVirtual: true,
    attendeeCount: 145,
    maxAttendees: 200,
  },
  {
    id: 'event_002',
    guildId: 'guild_002',
    title: 'Souls Veterans Meetup - NYC',
    description: 'IRL meetup at a gaming cafe in Manhattan. Challenge runs, PvP tournaments, and good vibes.',
    startDate: new Date('2024-02-15T14:00:00'),
    endDate: new Date('2024-02-15T22:00:00'),
    location: 'New York, NY',
    isVirtual: false,
    attendeeCount: 32,
    maxAttendees: 50,
  },
  {
    id: 'event_003',
    guildId: 'guild_003',
    title: 'Star Wars Marathon - Machete Order',
    description: 'Full saga watch in Machete order. Discord stream party with live commentary.',
    startDate: new Date('2024-01-27T10:00:00'),
    isVirtual: true,
    attendeeCount: 89,
  },
  {
    id: 'event_004',
    guildId: 'guild_006',
    title: 'Comic Con Group Meetup',
    description: 'Guild meetup at SDCC 2024. Marvel panel lineup and photo ops.',
    startDate: new Date('2024-07-25T09:00:00'),
    endDate: new Date('2024-07-28T20:00:00'),
    location: 'San Diego, CA',
    isVirtual: false,
    attendeeCount: 78,
  },
];

export function getGuildsByUniverse(universeId: string): Guild[] {
  return MOCK_GUILDS.filter(guild => guild.universeId === universeId);
}

export function getGuildById(guildId: string): Guild | undefined {
  return MOCK_GUILDS.find(guild => guild.id === guildId);
}

export function getGuildPosts(guildId: string): GuildPost[] {
  return MOCK_GUILD_POSTS.filter(post => post.guildId === guildId);
}

export function getGuildEvents(guildId: string): GuildEvent[] {
  return MOCK_GUILD_EVENTS.filter(event => event.guildId === guildId);
}
