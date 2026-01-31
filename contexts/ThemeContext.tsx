import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeTokens {
  bg0: string;
  bg1: string;
  bg2: string;
  bg3: string;
  text0: string;
  text1: string;
  text2: string;
  textGold: string;
  border0: string;
  borderFocus: string;
  accentPrimary: string;
  accentSecondary: string;
  accentGold: string;
  glowEmber: string;
  glowMoon: string;
  glowSakura: string;
  glassBg: string;
  glassLight: string;
  glassBorder: string;
  danger: string;
  success: string;
  warning: string;
  chipBg: string;
  chipText: string;
  overlay: string;
  shadow: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
  tabBarBg: string;
  blurTint: 'dark' | 'light';
}

const STORAGE_KEY = 'kori_theme_mode';

const DARK_TOKENS: ThemeTokens = {
  bg0: '#07060B',
  bg1: '#0D0B14',
  bg2: '#13101C',
  bg3: '#1A1625',
  text0: '#F5F2F8',
  text1: '#8A8299',
  text2: '#6B6380',
  textGold: '#E8D5A3',
  border0: '#4A4560',
  borderFocus: '#D64550',
  accentPrimary: '#D64550',
  accentSecondary: '#F2A0B5',
  accentGold: '#E8D5A3',
  glowEmber: 'rgba(214, 69, 80, 0.2)',
  glowMoon: 'rgba(232, 213, 163, 0.12)',
  glowSakura: 'rgba(242, 160, 181, 0.15)',
  glassBg: 'rgba(26, 22, 37, 0.75)',
  glassLight: 'rgba(42, 31, 61, 0.6)',
  glassBorder: 'rgba(232, 213, 163, 0.15)',
  danger: '#D64550',
  success: '#4ADE80',
  warning: '#E8D5A3',
  chipBg: 'rgba(26, 22, 37, 0.75)',
  chipText: '#8A8299',
  overlay: 'rgba(7, 6, 11, 0.9)',
  shadow: '#000000',
  gradientStart: '#07060B',
  gradientMid: '#1E1530',
  gradientEnd: '#2A1F3D',
  tabBarBg: '#0D0B14',
  blurTint: 'dark',
};

const LIGHT_TOKENS: ThemeTokens = {
  bg0: '#FDFCFE',
  bg1: '#F8F6FA',
  bg2: '#F2EFF6',
  bg3: '#EBE7F0',
  text0: '#1A1625',
  text1: '#5C5470',
  text2: '#8A8299',
  textGold: '#9A7B3C',
  border0: '#E0DDE6',
  borderFocus: '#C94550',
  accentPrimary: '#C94550',
  accentSecondary: '#D87A8F',
  accentGold: '#9A7B3C',
  glowEmber: 'rgba(201, 69, 80, 0.12)',
  glowMoon: 'rgba(154, 123, 60, 0.08)',
  glowSakura: 'rgba(216, 122, 143, 0.1)',
  glassBg: 'rgba(255, 255, 255, 0.85)',
  glassLight: 'rgba(248, 246, 250, 0.9)',
  glassBorder: 'rgba(154, 123, 60, 0.2)',
  danger: '#C94550',
  success: '#2D9E5C',
  warning: '#9A7B3C',
  chipBg: 'rgba(242, 239, 246, 0.9)',
  chipText: '#5C5470',
  overlay: 'rgba(253, 252, 254, 0.95)',
  shadow: 'rgba(26, 22, 37, 0.08)',
  gradientStart: '#FDFCFE',
  gradientMid: '#F5F1F9',
  gradientEnd: '#EDE8F4',
  tabBarBg: '#F8F6FA',
  blurTint: 'light',
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const queryClient = useQueryClient();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  const themeQuery = useQuery({
    queryKey: ['themeMode'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('[Theme] Loaded theme mode from storage:', stored);
      return (stored as ThemeMode) || 'system';
    },
  });

  const { mutate: saveTheme } = useMutation({
    mutationFn: async (mode: ThemeMode) => {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
      console.log('[Theme] Saved theme mode:', mode);
      return mode;
    },
    onSuccess: (mode) => {
      setThemeModeState(mode);
      queryClient.invalidateQueries({ queryKey: ['themeMode'] });
    },
  });

  useEffect(() => {
    if (themeQuery.data) {
      setThemeModeState(themeQuery.data);
      setIsLoaded(true);
    } else if (!themeQuery.isLoading) {
      setIsLoaded(true);
    }
  }, [themeQuery.data, themeQuery.isLoading]);

  const effectiveMode = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'light' ? 'light' : 'dark';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const isDark = effectiveMode === 'dark';

  const colors = useMemo(() => {
    return isDark ? DARK_TOKENS : LIGHT_TOKENS;
  }, [isDark]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    saveTheme(mode);
  }, [saveTheme]);

  return {
    themeMode,
    effectiveMode,
    isDark,
    colors,
    setThemeMode,
    isLoaded,
    isLoading: themeQuery.isLoading,
  };
});

export { DARK_TOKENS, LIGHT_TOKENS };
