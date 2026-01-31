export interface Archetype {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const ARCHETYPES: Archetype[] = [
  {
    id: 'hero',
    name: 'Hero',
    description: 'The main character energy. Driven, optimistic, never gives up.',
    color: '#FFD700',
    icon: '⭐',
  },
  {
    id: 'strategist',
    name: 'Strategist',
    description: 'The mastermind. Plans three steps ahead, loves theory and analysis.',
    color: '#4D7CFF',
    icon: '♟️',
  },
  {
    id: 'guardian',
    name: 'Guardian',
    description: 'The protector. Loyal to the core, puts the team first.',
    color: '#00FF94',
    icon: '🛡️',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'The wild card. Chaotic, unpredictable, breaks the rules.',
    color: '#FF006E',
    icon: '🃏',
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'The artist. Makes art, cosplay, content, fanfic, and magic.',
    color: '#B040FF',
    icon: '✨',
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'The lorekeeper. Knows the deep lore, canon debates, and hidden details.',
    color: '#00F0FF',
    icon: '📖',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'The adventurer. Always seeking new worlds, new stories, new experiences.',
    color: '#FF6B35',
    icon: '🧭',
  },
];

export const INTENTS = [
  { id: 'dating', label: 'Dating', icon: '💕', color: '#FF006E' },
  { id: 'friends', label: 'Friends / Guild', icon: '👥', color: '#00F0FF' },
  { id: 'creator', label: 'Creator / Collab', icon: '✨', color: '#B040FF' },
  { id: 'events', label: 'Events / IRL', icon: '🎭', color: '#FFD700' },
] as const;

export type IntentType = typeof INTENTS[number]['id'];
