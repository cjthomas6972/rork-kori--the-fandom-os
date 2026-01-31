import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';

interface PlanetHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}

export default function PlanetHeader({ title, rightAction, onBack }: PlanetHeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const handleReturn = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/planet');
    }
  };

  const HeaderContent = () => (
    <View style={styles.headerContent}>
      <TouchableOpacity
        style={styles.returnButton}
        onPress={handleReturn}
        testID="return-btn"
        activeOpacity={0.7}
      >
        <View style={[styles.returnIconContainer, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
          <ChevronLeft size={20} color={colors.text0} />
        </View>
        <Text style={[styles.returnText, { color: colors.text0 }]}>Return</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text0 }]} numberOfLines={1}>{title}</Text>

      <View style={styles.rightContainer}>
        {rightAction || <View style={styles.spacer} />}
      </View>
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={60} tint={colors.blurTint} style={[styles.container, { borderBottomColor: colors.glassBorder }]}>
        <View style={[styles.glowAccent, { backgroundColor: colors.accentGold }]} />
        <HeaderContent />
      </BlurView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg1, borderBottomColor: colors.glassBorder }]}>
      <View style={[styles.glowAccent, { backgroundColor: colors.accentGold }]} />
      <HeaderContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  glowAccent: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -100,
    width: 200,
    height: 2,
    opacity: 0.3,
    borderRadius: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingRight: 12,
    minWidth: 90,
  },
  returnIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  rightContainer: {
    minWidth: 90,
    alignItems: 'flex-end',
  },
  spacer: {
    width: 90,
  },
});
