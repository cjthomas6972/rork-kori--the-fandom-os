import { UserIdentity } from '@/types/identity';

export interface MockUser extends Omit<UserIdentity, 'presence' | 'createdAt' | 'updatedAt'> {
  avatarColor: string;
  resonanceScore?: number;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'user_001',
    username: 'alex_chen',
    displayName: 'Alex Chen',
    avatarColor: '#FF6B35',
    universes: ['anime-shonen', 'gaming-rpg', 'gaming-souls'],
    canonAnchors: {
      'anime-shonen': ['One Piece', 'Hunter x Hunter'],
      'gaming-rpg': ['Final Fantasy', 'Persona'],
      'gaming-souls': ['Elden Ring', 'Bloodborne'],
    },
    archetypes: ['strategist', 'sage'],
    intents: ['friends', 'events'],
    location: { city: 'San Francisco', country: 'USA' },
    maxDistance: 50,
    visibility: 'public',
    bio: 'Lore obsessed. Theory crafting is my love language. Currently on my 5th Elden Ring playthrough.',
  },
  {
    id: 'user_002',
    username: 'maya_rodriguez',
    displayName: 'Maya Rodriguez',
    avatarColor: '#B040FF',
    universes: ['comics-marvel', 'fantasy-high', 'anime-seinen'],
    canonAnchors: {
      'comics-marvel': ['X-Men', 'Spider-Man'],
      'fantasy-high': ['The Stormlight Archive', 'Lord of the Rings'],
      'anime-seinen': ['Attack on Titan', 'Monster'],
    },
    archetypes: ['creator', 'hero'],
    intents: ['creator', 'friends'],
    location: { city: 'Los Angeles', country: 'USA' },
    maxDistance: 100,
    visibility: 'public',
    bio: 'Cosplayer & artist. Currently building an X-Men cosplay group. Always down to talk Sanderson.',
  },
  {
    id: 'user_003',
    username: 'jordan_kim',
    displayName: 'Jordan Kim',
    avatarColor: '#00F0FF',
    universes: ['sci-fi-space', 'gaming-moba', 'anime-mecha'],
    canonAnchors: {
      'sci-fi-space': ['Star Wars', 'Dune'],
      'gaming-moba': ['League of Legends'],
      'anime-mecha': ['Gundam', 'Evangelion'],
    },
    archetypes: ['sage', 'explorer'],
    intents: ['friends', 'events'],
    location: { city: 'Seattle', country: 'USA' },
    maxDistance: 75,
    visibility: 'selective',
    bio: 'Deep lore enthusiast. Can explain the entire Gundam timeline. Pro at being hardstuck Diamond.',
  },
  {
    id: 'user_004',
    username: 'sam_nakamura',
    displayName: 'Sam Nakamura',
    avatarColor: '#FF006E',
    universes: ['anime-shonen', 'anime-isekai', 'gaming-rpg'],
    canonAnchors: {
      'anime-shonen': ['Jujutsu Kaisen', 'Demon Slayer'],
      'anime-isekai': ['Re:Zero', 'Mushoku Tensei'],
      'gaming-rpg': ['Baldur\'s Gate', 'Dragon Age'],
    },
    archetypes: ['rogue', 'explorer'],
    intents: ['dating', 'friends'],
    location: { city: 'Tokyo', country: 'Japan' },
    maxDistance: 25,
    visibility: 'public',
    bio: 'Chaos energy personified. Will debate which Jujutsu Kaisen opening is best until dawn.',
  },
  {
    id: 'user_005',
    username: 'riley_storm',
    displayName: 'Riley Storm',
    avatarColor: '#00FF94',
    universes: ['fantasy-urban', 'horror-cosmic', 'comics-indie'],
    canonAnchors: {
      'fantasy-urban': ['Dresden Files', 'Supernatural'],
      'horror-cosmic': ['Lovecraft', 'SCP Foundation'],
      'comics-indie': ['Saga', 'Hellboy'],
    },
    archetypes: ['guardian', 'sage'],
    intents: ['friends', 'creator'],
    location: { city: 'Austin', country: 'USA' },
    maxDistance: 50,
    visibility: 'public',
    bio: 'Horror nerd & SCP archivist. Writing my own urban fantasy novel. The Ninth Doctor is my doctor.',
  },
  {
    id: 'user_006',
    username: 'kai_winters',
    displayName: 'Kai Winters',
    avatarColor: '#4D7CFF',
    universes: ['gaming-souls', 'anime-seinen', 'horror-cosmic'],
    canonAnchors: {
      'gaming-souls': ['Dark Souls', 'Sekiro'],
      'anime-seinen': ['Berserk', 'Death Note'],
      'horror-cosmic': ['Bloodborne', 'The Magnus Archives'],
    },
    archetypes: ['strategist', 'guardian'],
    intents: ['friends', 'events'],
    location: { city: 'New York', country: 'USA' },
    maxDistance: 30,
    visibility: 'selective',
    bio: 'Souls veteran. Griffith did nothing wrong (joking). The Magnus Archives changed my brain chemistry.',
  },
  {
    id: 'user_007',
    username: 'nova_starling',
    displayName: 'Nova Starling',
    avatarColor: '#FFD700',
    universes: ['sci-fi-cyberpunk', 'gaming-fps', 'anime-mecha'],
    canonAnchors: {
      'sci-fi-cyberpunk': ['Cyberpunk 2077', 'Ghost in the Shell'],
      'gaming-fps': ['Valorant', 'Apex Legends'],
      'anime-mecha': ['Code Geass', 'Gurren Lagann'],
    },
    archetypes: ['hero', 'rogue'],
    intents: ['friends', 'events'],
    location: { city: 'Chicago', country: 'USA' },
    maxDistance: 60,
    visibility: 'public',
    bio: 'Aim trainer addict. Cyberpunk aesthetic lover. My mech collection is out of control.',
  },
  {
    id: 'user_008',
    username: 'ember_phoenix',
    displayName: 'Ember Phoenix',
    avatarColor: '#FF6B35',
    universes: ['comics-dc', 'fantasy-high', 'anime-shonen'],
    canonAnchors: {
      'comics-dc': ['Batman', 'Sandman'],
      'fantasy-high': ['Game of Thrones', 'Wheel of Time'],
      'anime-shonen': ['My Hero Academia', 'Dragon Ball'],
    },
    archetypes: ['creator', 'hero'],
    intents: ['creator', 'dating'],
    location: { city: 'Portland', country: 'USA' },
    maxDistance: 40,
    visibility: 'public',
    bio: 'Digital artist & animator. Currently on a Batman obsession phase. Plus Ultra forever.',
  },
];

export function getUsersByUniverse(universeId: string): MockUser[] {
  return MOCK_USERS.filter(user => user.universes.includes(universeId));
}

export function getUserById(userId: string): MockUser | undefined {
  return MOCK_USERS.find(user => user.id === userId);
}
