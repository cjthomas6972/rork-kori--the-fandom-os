import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

interface PortalCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  emoji?: string;
  color?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
  showEmberEdge?: boolean;
  compact?: boolean;
}

export function PortalCard({
  title,
  subtitle,
  icon,
  emoji,
  color,
  onPress,
  children,
  style,
  showEmberEdge = false,
  compact = false,
}: PortalCardProps) {
  const { colors } = useTheme();
  const cardColor = color || colors.accentGold;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, glowAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, glowAnim]);

  const handlePress = useCallback(() => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  }, [onPress]);

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: colors.bg3 },
        compact && styles.cardCompact,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <LinearGradient
        colors={[cardColor + '18', cardColor + '08', 'transparent']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View
        style={[
          styles.glowBorder,
          {
            borderColor: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.glassBorder, cardColor + '60'],
            }),
          },
        ]}
      />

      {showEmberEdge && (
        <View style={[styles.emberEdge, { backgroundColor: colors.accentPrimary }]} />
      )}

      <View style={styles.header}>
        {emoji && <Text style={styles.emoji}>{emoji}</Text>}
        {icon && <View style={[styles.iconContainer, { backgroundColor: colors.bg2 }]}>{icon}</View>}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text0 }]} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: colors.text1 }]} numberOfLines={1}>{subtitle}</Text>}
        </View>
      </View>

      {children && <View style={styles.content}>{children}</View>}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  cardCompact: {
    padding: 12,
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
  },
  emberEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  subtitle: {
    fontSize: 13,
  },
  content: {
    marginTop: 12,
  },
});
