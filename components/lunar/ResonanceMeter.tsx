import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import KORI_COLORS from '@/constants/colors';

interface ResonanceMeterProps {
  score: number;
  size?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export function getResonanceColor(score: number): string {
  if (score >= 80) return '#4ADE80';
  if (score >= 60) return KORI_COLORS.lunar.moonGold;
  if (score >= 40) return KORI_COLORS.lunar.blossomPink;
  return KORI_COLORS.lunar.emberRed;
}

export function ResonanceMeter({
  score,
  size = 100,
  showLabel = true,
  label,
  animated = true,
}: ResonanceMeterProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: score / 100,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      progressAnim.setValue(score / 100);
    }

    return () => {
      progressAnim.stopAnimation();
      glowAnim.stopAnimation();
    };
  }, [score, animated, progressAnim, glowAnim]);

  const color = getResonanceColor(score);
  const strokeWidth = size * 0.08;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.track,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.progressContainer,
          {
            width: size,
            height: size,
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              transform: [
                {
                  rotate: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '270deg'],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size + 10,
            height: size + 10,
            borderRadius: (size + 10) / 2,
            borderColor: color,
            opacity: glowAnim,
            shadowColor: color,
          },
        ]}
      />

      <View
        style={[
          styles.crescentAccent,
          {
            width: strokeWidth * 1.5,
            height: strokeWidth * 1.5,
            borderRadius: strokeWidth * 0.75,
            backgroundColor: KORI_COLORS.accent.primary,
            top: strokeWidth / 2,
            right: size / 2 - strokeWidth * 0.75,
            shadowColor: KORI_COLORS.accent.primary,
          },
        ]}
      />

      <View style={styles.center}>
        <Text style={[styles.score, { color, fontSize: size * 0.28 }]}>
          {score}%
        </Text>
        {showLabel && (
          <Text style={[styles.label, { fontSize: size * 0.11 }]}>
            {label || 'Resonance'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    borderColor: KORI_COLORS.bg.elevated,
  },
  progressContainer: {
    position: 'absolute',
  },
  progress: {
    position: 'absolute',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  crescentAccent: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  score: {
    fontWeight: '700' as const,
  },
  label: {
    color: KORI_COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
