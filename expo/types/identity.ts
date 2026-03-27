import { IntentType } from '@/constants/archetypes';

export interface UserIdentity {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  
  universes: string[];
  canonAnchors: Record<string, string[]>;
  archetypes: string[];
  intents: IntentType[];
  
  location?: {
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  maxDistance?: number;
  
  visibility: 'public' | 'selective' | 'private';
  
  bio?: string;
  alignment?: {
    values: string[];
    dealbreakers: string[];
  };
  
  presence: {
    status: 'active' | 'away' | 'invisible';
    lastSeen: Date;
    signal: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingState {
  step: number;
  universes: string[];
  canonAnchors: Record<string, string[]>;
  archetypes: string[];
  intents: IntentType[];
  location?: {
    city: string;
    country: string;
  };
  maxDistance?: number;
  visibility: 'public' | 'selective' | 'private';
}
