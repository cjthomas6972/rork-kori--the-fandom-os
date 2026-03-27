export interface Universe {
  id: string;
  name: string;
  category: 'anime' | 'gaming' | 'comics' | 'sci-fi' | 'fantasy' | 'horror' | 'other';
  color: string;
  icon: string;
}

export const UNIVERSES: Universe[] = [
  { id: 'anime-shonen', name: 'Shonen Anime', category: 'anime', color: '#FF6B35', icon: '⚡' },
  { id: 'anime-seinen', name: 'Seinen/Psychological', category: 'anime', color: '#B040FF', icon: '🧠' },
  { id: 'anime-mecha', name: 'Mecha', category: 'anime', color: '#4D7CFF', icon: '🤖' },
  { id: 'anime-isekai', name: 'Isekai', category: 'anime', color: '#00FF94', icon: '🌌' },
  { id: 'gaming-rpg', name: 'RPGs', category: 'gaming', color: '#FFD700', icon: '⚔️' },
  { id: 'gaming-fps', name: 'FPS/Shooters', category: 'gaming', color: '#FF0040', icon: '🎯' },
  { id: 'gaming-moba', name: 'MOBA/Strategy', category: 'gaming', color: '#00F0FF', icon: '♟️' },
  { id: 'gaming-souls', name: 'Souls-like', category: 'gaming', color: '#1A1A1A', icon: '💀' },
  { id: 'comics-marvel', name: 'Marvel', category: 'comics', color: '#ED1D24', icon: '🦸' },
  { id: 'comics-dc', name: 'DC', category: 'comics', color: '#0476F2', icon: '🦇' },
  { id: 'comics-indie', name: 'Indie Comics', category: 'comics', color: '#FF006E', icon: '📚' },
  { id: 'sci-fi-space', name: 'Space Opera', category: 'sci-fi', color: '#00D4FF', icon: '🚀' },
  { id: 'sci-fi-cyberpunk', name: 'Cyberpunk', category: 'sci-fi', color: '#FF00FF', icon: '🌃' },
  { id: 'fantasy-high', name: 'High Fantasy', category: 'fantasy', color: '#8B4513', icon: '🐉' },
  { id: 'fantasy-urban', name: 'Urban Fantasy', category: 'fantasy', color: '#9B59B6', icon: '🌙' },
  { id: 'horror-cosmic', name: 'Cosmic Horror', category: 'horror', color: '#1B5E20', icon: '👁️' },
];

export const CANON_ANCHORS: Record<string, string[]> = {
  'anime-shonen': ['One Piece', 'Naruto', 'Dragon Ball', 'Hunter x Hunter', 'My Hero Academia', 'Demon Slayer', 'Jujutsu Kaisen'],
  'anime-seinen': ['Attack on Titan', 'Berserk', 'Monster', 'Steins;Gate', 'Death Note', 'Tokyo Ghoul'],
  'anime-mecha': ['Gundam', 'Evangelion', 'Code Geass', 'Gurren Lagann', 'Darling in the Franxx'],
  'anime-isekai': ['Re:Zero', 'Overlord', 'Mushoku Tensei', 'That Time I Got Reincarnated as a Slime'],
  'gaming-rpg': ['Final Fantasy', 'The Witcher', 'Elder Scrolls', 'Persona', 'Dragon Age', 'Baldur\'s Gate'],
  'gaming-fps': ['Halo', 'Call of Duty', 'Valorant', 'Overwatch', 'Apex Legends', 'Destiny'],
  'gaming-moba': ['League of Legends', 'Dota 2', 'Smite'],
  'gaming-souls': ['Dark Souls', 'Elden Ring', 'Bloodborne', 'Sekiro'],
  'comics-marvel': ['X-Men', 'Spider-Man', 'Avengers', 'Fantastic Four', 'Daredevil'],
  'comics-dc': ['Batman', 'Superman', 'Wonder Woman', 'Green Lantern', 'The Flash', 'Sandman'],
  'comics-indie': ['Saga', 'The Walking Dead', 'Invincible', 'Watchmen', 'Hellboy'],
  'sci-fi-space': ['Star Wars', 'Star Trek', 'The Expanse', 'Foundation', 'Dune'],
  'sci-fi-cyberpunk': ['Cyberpunk 2077', 'Blade Runner', 'Ghost in the Shell', 'Neuromancer'],
  'fantasy-high': ['Lord of the Rings', 'Game of Thrones', 'Wheel of Time', 'The Stormlight Archive'],
  'fantasy-urban': ['Dresden Files', 'Supernatural', 'Buffy', 'The Magicians'],
  'horror-cosmic': ['Lovecraft', 'SCP Foundation', 'The Magnus Archives', 'Bloodborne'],
};
