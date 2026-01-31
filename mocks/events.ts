export interface KoriEvent {
  id: string;
  title: string;
  description: string;
  universeIds: string[];
  startDate: Date;
  endDate?: Date;
  location?: string;
  isVirtual: boolean;
  attendeeCount: number;
  maxAttendees?: number;
  imageUrl?: string;
  tags: string[];
  color: string;
  type: 'convention' | 'meetup' | 'watch_party' | 'tournament' | 'release' | 'cosplay';
}

export const MOCK_EVENTS: KoriEvent[] = [
  {
    id: 'kevent_001',
    title: 'Anime Expo 2024',
    description: 'The largest anime convention in North America. Panels, premieres, artist alley, and more.',
    universeIds: ['anime-shonen', 'anime-seinen', 'anime-mecha', 'anime-isekai'],
    startDate: new Date('2024-07-04T09:00:00'),
    endDate: new Date('2024-07-07T18:00:00'),
    location: 'Los Angeles, CA',
    isVirtual: false,
    attendeeCount: 15234,
    tags: ['Convention', 'Anime', 'Cosplay', 'Panels'],
    color: '#FF6B35',
    type: 'convention',
  },
  {
    id: 'kevent_002',
    title: 'San Diego Comic-Con 2024',
    description: 'The ultimate celebration of pop culture. Comics, movies, TV, and everything in between.',
    universeIds: ['comics-marvel', 'comics-dc', 'comics-indie', 'sci-fi-space'],
    startDate: new Date('2024-07-25T09:00:00'),
    endDate: new Date('2024-07-28T19:00:00'),
    location: 'San Diego, CA',
    isVirtual: false,
    attendeeCount: 23567,
    tags: ['Convention', 'Comics', 'Movies', 'Panels'],
    color: '#4D7CFF',
    type: 'convention',
  },
  {
    id: 'kevent_003',
    title: 'Elden Ring DLC Launch Party',
    description: 'Global launch party for Shadow of the Erdtree. Watch streams, discuss theories, suffer together.',
    universeIds: ['gaming-souls'],
    startDate: new Date('2024-06-21T00:00:00'),
    isVirtual: true,
    attendeeCount: 4521,
    tags: ['Gaming', 'Launch', 'Elden Ring', 'DLC'],
    color: '#FFD700',
    type: 'release',
  },
  {
    id: 'kevent_004',
    title: 'Bay Area Anime Meetup',
    description: 'Monthly meetup for anime fans in the San Francisco Bay Area. Casual hangout, discussions, and food.',
    universeIds: ['anime-shonen', 'anime-seinen'],
    startDate: new Date('2024-02-10T14:00:00'),
    endDate: new Date('2024-02-10T18:00:00'),
    location: 'San Francisco, CA',
    isVirtual: false,
    attendeeCount: 45,
    maxAttendees: 60,
    tags: ['Meetup', 'Anime', 'Social'],
    color: '#FF006E',
    type: 'meetup',
  },
  {
    id: 'kevent_005',
    title: 'One Piece Film: Red Watch Party',
    description: 'Discord watch party for One Piece Film: Red. Live reactions and discussions.',
    universeIds: ['anime-shonen'],
    startDate: new Date('2024-01-20T19:00:00'),
    isVirtual: true,
    attendeeCount: 234,
    tags: ['Watch Party', 'One Piece', 'Movie'],
    color: '#FF6B35',
    type: 'watch_party',
  },
  {
    id: 'kevent_006',
    title: 'Marvel Cosplay Contest',
    description: 'Online cosplay contest for Marvel characters. Prizes for best craftsmanship and performance.',
    universeIds: ['comics-marvel'],
    startDate: new Date('2024-03-15T12:00:00'),
    endDate: new Date('2024-03-15T16:00:00'),
    isVirtual: true,
    attendeeCount: 156,
    tags: ['Cosplay', 'Marvel', 'Contest'],
    color: '#ED1D24',
    type: 'cosplay',
  },
  {
    id: 'kevent_007',
    title: 'Star Wars Celebration 2024',
    description: 'The official Star Wars fan convention. Exclusive announcements, panels, and merchandise.',
    universeIds: ['sci-fi-space'],
    startDate: new Date('2024-04-18T09:00:00'),
    endDate: new Date('2024-04-21T18:00:00'),
    location: 'Chicago, IL',
    isVirtual: false,
    attendeeCount: 8934,
    tags: ['Convention', 'Star Wars', 'Panels'],
    color: '#00D4FF',
    type: 'convention',
  },
  {
    id: 'kevent_008',
    title: 'Valorant Tournament - Kori Cup',
    description: 'Community tournament for Kori members. Teams of 5, bracket elimination.',
    universeIds: ['gaming-fps'],
    startDate: new Date('2024-02-24T13:00:00'),
    endDate: new Date('2024-02-24T21:00:00'),
    isVirtual: true,
    attendeeCount: 80,
    maxAttendees: 80,
    tags: ['Tournament', 'Valorant', 'Competitive'],
    color: '#FF0040',
    type: 'tournament',
  },
];

export function getEventsByUniverse(universeId: string): KoriEvent[] {
  return MOCK_EVENTS.filter(event => event.universeIds.includes(universeId));
}

export function getEventById(eventId: string): KoriEvent | undefined {
  return MOCK_EVENTS.find(event => event.id === eventId);
}

export function getUpcomingEvents(limit?: number): KoriEvent[] {
  const now = new Date();
  const upcoming = MOCK_EVENTS
    .filter(event => event.startDate > now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  return limit ? upcoming.slice(0, limit) : upcoming;
}
