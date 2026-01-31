import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import KORI_COLORS from '@/constants/colors';

interface LunarHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  centerElement?: React.ReactNode;
  transparent?: boolean;
  showMoonHalo?: boolean;
}

export function LunarHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightElement,
  centerElement,
  transparent = false,
  showMoonHalo = false,
}: LunarHeaderProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleBackPressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleBackPressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  }, [onBack]);

  const headerContent = (
    <View style={styles.content}>
      <View style={styles.leftSection}>
        {showBack ? (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPress={handleBack}
              onPressIn={handleBackPressIn}
              onPressOut={handleBackPressOut}
              style={styles.backButton}
            >
              <ArrowLeft size={22} color={KORI_COLORS.text.primary} />
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={styles.centerSection}>
        {centerElement || (
          <View style={styles.titleContainer}>
            {showMoonHalo && <View style={styles.moonHalo} />}
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
      </View>

      <View style={styles.rightSection}>
        {rightElement || <View style={styles.placeholder} />}
      </View>
    </View>
  );

  if (transparent) {
    return <View style={styles.container}>{headerContent}</View>;
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.glassBackground]}>
        {headerContent}
        <View style={styles.goldEdge} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={40} style={StyleSheet.absoluteFillObject} tint="dark" />
      <View style={[StyleSheet.absoluteFillObject, styles.glassOverlay]} />
      {headerContent}
      <View style={styles.goldEdge} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  glassBackground: {
    backgroundColor: KORI_COLORS.glass.bg,
  },
  glassOverlay: {
    backgroundColor: KORI_COLORS.glass.bg,
  },
  goldEdge: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: KORI_COLORS.lunar.moonGold + '20',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: KORI_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    gap: 2,
  },
  moonHalo: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: KORI_COLORS.lunar.moonGold + '10',
    top: -15,
  },
  title: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
});
