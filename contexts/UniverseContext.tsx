import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { UNIVERSES } from '@/constants/universes';
import { useIdentity } from '@/contexts/IdentityContext';

const STORAGE_KEY = 'kori_selected_universe';

export const [UniverseProvider, useUniverse] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { identity, updateIdentity } = useIdentity();
  const [selectedUniverseId, setSelectedUniverseId] = useState<string | null>(null);

  const storageQuery = useQuery({
    queryKey: ['selectedUniverse'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored;
    },
  });

  useEffect(() => {
    if (storageQuery.data && identity?.universes.includes(storageQuery.data)) {
      setSelectedUniverseId(storageQuery.data);
    } else if (identity?.universes && identity.universes.length > 0 && !selectedUniverseId) {
      setSelectedUniverseId(identity.universes[0]);
    }
  }, [storageQuery.data, identity?.universes, selectedUniverseId]);

  const selectUniverseMutation = useMutation({
    mutationFn: async (universeId: string) => {
      await AsyncStorage.setItem(STORAGE_KEY, universeId);
      return universeId;
    },
    onSuccess: (universeId) => {
      setSelectedUniverseId(universeId);
      queryClient.invalidateQueries({ queryKey: ['alignedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['universeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['universeGuilds'] });
      queryClient.invalidateQueries({ queryKey: ['universeEvents'] });
      console.log('[UniverseContext] Switched to universe:', universeId);
    },
  });

  const addUniverseMutation = useMutation({
    mutationFn: async (universeId: string) => {
      if (!identity) throw new Error('No identity');
      const newUniverses = [...identity.universes, universeId];
      return newUniverses;
    },
    onSuccess: (newUniverses) => {
      if (updateIdentity) {
        updateIdentity({ universes: newUniverses });
      }
      queryClient.invalidateQueries({ queryKey: ['alignedUsers'] });
      console.log('[UniverseContext] Added universe, total:', newUniverses.length);
    },
  });

  const removeUniverseMutation = useMutation({
    mutationFn: async (universeId: string) => {
      if (!identity) throw new Error('No identity');
      const newUniverses = identity.universes.filter(id => id !== universeId);
      return { newUniverses, removedId: universeId };
    },
    onSuccess: ({ newUniverses, removedId }) => {
      if (updateIdentity) {
        updateIdentity({ universes: newUniverses });
      }
      if (selectedUniverseId === removedId && newUniverses.length > 0) {
        selectUniverseMutation.mutate(newUniverses[0]);
      }
      queryClient.invalidateQueries({ queryKey: ['alignedUsers'] });
      console.log('[UniverseContext] Removed universe:', removedId);
    },
  });

  const { mutate: selectUniverseMutate } = selectUniverseMutation;
  const { mutate: addUniverseMutate } = addUniverseMutation;
  const { mutate: removeUniverseMutate } = removeUniverseMutation;

  const selectUniverse = useCallback((universeId: string) => {
    if (identity?.universes.includes(universeId)) {
      selectUniverseMutate(universeId);
    } else {
      console.warn('[UniverseContext] Attempted to select universe not in user list:', universeId);
    }
  }, [identity?.universes, selectUniverseMutate]);

  const addUniverse = useCallback((universeId: string) => {
    if (!identity?.universes.includes(universeId)) {
      addUniverseMutate(universeId);
    }
  }, [identity?.universes, addUniverseMutate]);

  const removeUniverse = useCallback((universeId: string) => {
    if (identity?.universes.includes(universeId)) {
      removeUniverseMutate(universeId);
    }
  }, [identity?.universes, removeUniverseMutate]);

  const toggleUniverse = useCallback((universeId: string) => {
    if (identity?.universes.includes(universeId)) {
      removeUniverse(universeId);
    } else {
      addUniverse(universeId);
    }
  }, [identity?.universes, addUniverse, removeUniverse]);

  const selectedUniverse = useMemo(() => {
    return UNIVERSES.find(u => u.id === selectedUniverseId) || null;
  }, [selectedUniverseId]);

  const userUniverses = useMemo(() => {
    return UNIVERSES.filter(u => identity?.universes.includes(u.id));
  }, [identity?.universes]);

  const availableUniverses = useMemo(() => {
    return UNIVERSES.filter(u => !identity?.universes.includes(u.id));
  }, [identity?.universes]);

  const isUniverseActive = useCallback((universeId: string) => {
    return identity?.universes.includes(universeId) || false;
  }, [identity?.universes]);

  const refreshCounter = useRef(0);

  const triggerRefresh = useCallback(() => {
    refreshCounter.current += 1;
    queryClient.invalidateQueries({ queryKey: ['alignedUsers'] });
    queryClient.invalidateQueries({ queryKey: ['universeFeed'] });
    queryClient.invalidateQueries({ queryKey: ['universeGuilds'] });
    queryClient.invalidateQueries({ queryKey: ['universeEvents'] });
    console.log('[UniverseContext] Triggered global refresh:', refreshCounter.current);
  }, [queryClient]);

  return {
    selectedUniverseId,
    selectedUniverse,
    userUniverses,
    availableUniverses,
    allUniverses: UNIVERSES,
    selectUniverse,
    addUniverse,
    removeUniverse,
    toggleUniverse,
    isUniverseActive,
    isLoading: storageQuery.isLoading,
    triggerRefresh,
    refreshCounter: refreshCounter.current,
  };
});
