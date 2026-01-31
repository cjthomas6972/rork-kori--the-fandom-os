import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { UserIdentity, OnboardingState } from '@/types/identity';

const STORAGE_KEYS = {
  USER_IDENTITY: 'kori_user_identity',
  ONBOARDING_COMPLETE: 'kori_onboarding_complete',
};

export const [IdentityProvider, useIdentity] = createContextHook(() => {
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const identityQuery = useQuery({
    queryKey: ['userIdentity'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_IDENTITY);
      const onboardingDone = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      
      setOnboardingComplete(onboardingDone === 'true');
      
      return stored ? JSON.parse(stored) : null;
    },
  });

  const saveIdentityMutation = useMutation({
    mutationFn: async (newIdentity: UserIdentity) => {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_IDENTITY, JSON.stringify(newIdentity));
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
      return newIdentity;
    },
    onSuccess: (data) => {
      setIdentity(data);
      setOnboardingComplete(true);
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async (onboardingData: OnboardingState) => {
      const newIdentity: UserIdentity = {
        id: `user_${Date.now()}`,
        username: `user_${Math.random().toString(36).substr(2, 9)}`,
        displayName: 'New User',
        universes: onboardingData.universes,
        canonAnchors: onboardingData.canonAnchors,
        archetypes: onboardingData.archetypes,
        intents: onboardingData.intents,
        location: onboardingData.location,
        maxDistance: onboardingData.maxDistance,
        visibility: onboardingData.visibility,
        presence: {
          status: 'active',
          lastSeen: new Date(),
          signal: 100,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_IDENTITY, JSON.stringify(newIdentity));
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
      
      return newIdentity;
    },
    onSuccess: (data) => {
      setIdentity(data);
      setOnboardingComplete(true);
    },
  });

  const updateIdentityMutation = useMutation({
    mutationFn: async (updates: Partial<UserIdentity>) => {
      if (!identity) throw new Error('No identity to update');
      
      const updated = {
        ...identity,
        ...updates,
        updatedAt: new Date(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_IDENTITY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      setIdentity(data);
    },
  });

  useEffect(() => {
    if (identityQuery.data) {
      setIdentity(identityQuery.data);
    }
  }, [identityQuery.data]);

  return {
    identity,
    onboardingComplete,
    isLoading: identityQuery.isLoading,
    completeOnboarding: completeOnboardingMutation.mutate,
    updateIdentity: updateIdentityMutation.mutate,
    saveIdentity: saveIdentityMutation.mutate,
  };
});
