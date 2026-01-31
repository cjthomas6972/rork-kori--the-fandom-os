import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { UserEntitlements, Beacon, Signal, DailyPulse } from '@/types/social';

const STORAGE_KEYS = {
  ENTITLEMENTS: 'kori_entitlements',
  BEACONS: 'kori_beacons',
  SIGNALS: 'kori_signals',
  PULSES: 'kori_pulses',
};

const CURRENT_USER_ID = 'user_001';

export const [EntitlementsProvider, useEntitlements] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [entitlements, setEntitlements] = useState<UserEntitlements>({
    userId: CURRENT_USER_ID,
    universePassActive: false,
    guildProGuildIds: [],
  });
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [pulses, setPulses] = useState<DailyPulse[]>([]);

  const entitlementsQuery = useQuery({
    queryKey: ['entitlements'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ENTITLEMENTS);
      return stored ? JSON.parse(stored) : null;
    },
  });

  const beaconsQuery = useQuery({
    queryKey: ['beacons'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.BEACONS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const signalsQuery = useQuery({
    queryKey: ['signals'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SIGNALS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const pulsesQuery = useQuery({
    queryKey: ['pulses'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PULSES);
      return stored ? JSON.parse(stored) : [];
    },
  });

  useEffect(() => {
    if (entitlementsQuery.data) {
      setEntitlements(entitlementsQuery.data);
    }
  }, [entitlementsQuery.data]);

  useEffect(() => {
    if (beaconsQuery.data) {
      setBeacons(beaconsQuery.data);
    }
  }, [beaconsQuery.data]);

  useEffect(() => {
    if (signalsQuery.data) {
      setSignals(signalsQuery.data);
    }
  }, [signalsQuery.data]);

  useEffect(() => {
    if (pulsesQuery.data) {
      setPulses(pulsesQuery.data);
    }
  }, [pulsesQuery.data]);

  const purchaseUniversePassMutation = useMutation({
    mutationFn: async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      const updated: UserEntitlements = {
        ...entitlements,
        universePassActive: true,
        universePassExpiresAt: expiresAt,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.ENTITLEMENTS, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      setEntitlements(data);
      queryClient.invalidateQueries({ queryKey: ['entitlements'] });
      console.log('[Entitlements] Universe Pass purchased');
    },
  });

  const purchaseGuildProMutation = useMutation({
    mutationFn: async (guildId: string) => {
      const updated: UserEntitlements = {
        ...entitlements,
        guildProGuildIds: [...entitlements.guildProGuildIds, guildId],
      };
      await AsyncStorage.setItem(STORAGE_KEYS.ENTITLEMENTS, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      setEntitlements(data);
      queryClient.invalidateQueries({ queryKey: ['entitlements'] });
      console.log('[Entitlements] Guild Pro purchased');
    },
  });

  const activateSignalMutation = useMutation({
    mutationFn: async (universeId: string) => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      const newSignal: Signal = {
        id: `signal_${Date.now()}`,
        userId: CURRENT_USER_ID,
        universeId,
        activatedAt: new Date(),
        expiresAt,
        isActive: true,
      };
      const updated = [...signals, newSignal];
      await AsyncStorage.setItem(STORAGE_KEYS.SIGNALS, JSON.stringify(updated));
      return { signals: updated, newSignal };
    },
    onSuccess: ({ signals: updatedSignals }) => {
      setSignals(updatedSignals);
      queryClient.invalidateQueries({ queryKey: ['signals'] });
      console.log('[Entitlements] Signal activated');
    },
  });

  const dropBeaconMutation = useMutation({
    mutationFn: async (beacon: Omit<Beacon, 'id' | 'createdAt' | 'expiresAt' | 'isActive'>) => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      const newBeacon: Beacon = {
        ...beacon,
        id: `beacon_${Date.now()}`,
        createdAt: new Date(),
        expiresAt,
        isActive: true,
      };
      const updated = [...beacons, newBeacon];
      await AsyncStorage.setItem(STORAGE_KEYS.BEACONS, JSON.stringify(updated));
      return { beacons: updated, newBeacon };
    },
    onSuccess: ({ beacons: updatedBeacons }) => {
      setBeacons(updatedBeacons);
      queryClient.invalidateQueries({ queryKey: ['beacons'] });
      console.log('[Entitlements] Beacon dropped');
    },
  });

  const createPulseMutation = useMutation({
    mutationFn: async (pulse: Omit<DailyPulse, 'id' | 'createdAt'>) => {
      const newPulse: DailyPulse = {
        ...pulse,
        id: `pulse_${Date.now()}`,
        createdAt: new Date(),
      };
      const updated = [...pulses, newPulse];
      await AsyncStorage.setItem(STORAGE_KEYS.PULSES, JSON.stringify(updated));
      return { pulses: updated, newPulse };
    },
    onSuccess: ({ pulses: updatedPulses }) => {
      setPulses(updatedPulses);
      queryClient.invalidateQueries({ queryKey: ['pulses'] });
      console.log('[Entitlements] Pulse created');
    },
  });

  const hasUniversePass = entitlements.universePassActive;

  const hasGuildPro = useCallback((guildId: string) => {
    return entitlements.guildProGuildIds.includes(guildId);
  }, [entitlements.guildProGuildIds]);

  const getActiveBeaconsForUniverse = useCallback((universeId: string) => {
    const now = new Date();
    return beacons.filter(b => 
      b.universeId === universeId && 
      b.isActive && 
      new Date(b.expiresAt) > now
    );
  }, [beacons]);

  const hasActiveSignal = useCallback((universeId: string) => {
    const now = new Date();
    return signals.some(s => 
      s.universeId === universeId && 
      s.isActive && 
      new Date(s.expiresAt) > now
    );
  }, [signals]);

  const getTodaysPulse = useCallback((universeId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return pulses.find(p => {
      const pulseDate = new Date(p.createdAt);
      pulseDate.setHours(0, 0, 0, 0);
      return p.universeId === universeId && 
             p.userId === CURRENT_USER_ID && 
             pulseDate.getTime() === today.getTime();
    });
  }, [pulses]);

  const getPulseStreak = useCallback((universeId: string) => {
    const userPulses = pulses
      .filter(p => p.universeId === universeId && p.userId === CURRENT_USER_ID)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (userPulses.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < userPulses.length; i++) {
      const pulseDate = new Date(userPulses[i].createdAt);
      pulseDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (pulseDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [pulses]);

  return {
    entitlements,
    hasUniversePass,
    hasGuildPro,
    purchaseUniversePass: purchaseUniversePassMutation.mutate,
    purchaseGuildPro: purchaseGuildProMutation.mutate,
    isPurchasing: purchaseUniversePassMutation.isPending || purchaseGuildProMutation.isPending,
    beacons,
    signals,
    pulses,
    activateSignal: activateSignalMutation.mutate,
    dropBeacon: dropBeaconMutation.mutate,
    createPulse: createPulseMutation.mutate,
    getActiveBeaconsForUniverse,
    hasActiveSignal,
    getTodaysPulse,
    getPulseStreak,
    isLoading: entitlementsQuery.isLoading,
  };
});
