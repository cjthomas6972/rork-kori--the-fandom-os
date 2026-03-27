import { UserIdentity } from '@/types/identity';
import { MockUser } from '@/mocks/users';

export interface ResonanceResult {
  score: number;
  breakdown: {
    universes: number;
    canonAnchors: number;
    archetypes: number;
    intents: number;
  };
  sharedUniverses: string[];
  sharedCanon: string[];
  sharedArchetypes: string[];
  sharedIntents: string[];
}

const WEIGHTS = {
  universes: 0.35,
  canonAnchors: 0.30,
  archetypes: 0.20,
  intents: 0.15,
};

function calculateArrayOverlap(arr1: string[], arr2: string[]): { overlap: string[]; score: number } {
  const set1 = new Set(arr1);
  const overlap = arr2.filter(item => set1.has(item));
  const maxLength = Math.max(arr1.length, arr2.length);
  const score = maxLength > 0 ? (overlap.length / maxLength) * 100 : 0;
  return { overlap, score };
}

function calculateCanonOverlap(
  canon1: Record<string, string[]>,
  canon2: Record<string, string[]>
): { overlap: string[]; score: number } {
  const allCanon1 = Object.values(canon1).flat();
  const allCanon2 = Object.values(canon2).flat();
  return calculateArrayOverlap(allCanon1, allCanon2);
}

export function calculateResonance(
  user1: UserIdentity | MockUser,
  user2: UserIdentity | MockUser
): ResonanceResult {
  const universeResult = calculateArrayOverlap(user1.universes, user2.universes);
  const canonResult = calculateCanonOverlap(user1.canonAnchors, user2.canonAnchors);
  const archetypeResult = calculateArrayOverlap(user1.archetypes, user2.archetypes);
  const intentResult = calculateArrayOverlap(
    user1.intents as string[],
    user2.intents as string[]
  );

  const weightedScore = Math.round(
    universeResult.score * WEIGHTS.universes +
    canonResult.score * WEIGHTS.canonAnchors +
    archetypeResult.score * WEIGHTS.archetypes +
    intentResult.score * WEIGHTS.intents
  );

  return {
    score: Math.min(100, weightedScore),
    breakdown: {
      universes: Math.round(universeResult.score),
      canonAnchors: Math.round(canonResult.score),
      archetypes: Math.round(archetypeResult.score),
      intents: Math.round(intentResult.score),
    },
    sharedUniverses: universeResult.overlap,
    sharedCanon: canonResult.overlap,
    sharedArchetypes: archetypeResult.overlap,
    sharedIntents: intentResult.overlap,
  };
}

export function getAlignedUsers(
  currentUser: UserIdentity,
  users: MockUser[],
  minScore: number = 30
): (MockUser & { resonance: ResonanceResult })[] {
  return users
    .filter(user => user.id !== currentUser.id)
    .map(user => ({
      ...user,
      resonance: calculateResonance(currentUser, user),
    }))
    .filter(user => user.resonance.score >= minScore)
    .sort((a, b) => b.resonance.score - a.resonance.score);
}

export function getUsersInUniverse(
  currentUser: UserIdentity,
  users: MockUser[],
  universeId: string
): (MockUser & { resonance: ResonanceResult })[] {
  return users
    .filter(user => user.id !== currentUser.id && user.universes.includes(universeId))
    .map(user => ({
      ...user,
      resonance: calculateResonance(currentUser, user),
    }))
    .sort((a, b) => b.resonance.score - a.resonance.score);
}

export function getResonanceLabel(score: number): string {
  if (score >= 90) return 'Perfect Match';
  if (score >= 75) return 'High Resonance';
  if (score >= 60) return 'Strong Alignment';
  if (score >= 45) return 'Good Match';
  if (score >= 30) return 'Some Overlap';
  return 'Low Resonance';
}

export function getResonanceColor(score: number): string {
  if (score >= 90) return '#00FF94';
  if (score >= 75) return '#00F0FF';
  if (score >= 60) return '#4D7CFF';
  if (score >= 45) return '#B040FF';
  if (score >= 30) return '#FF6B35';
  return '#6B6B82';
}
