import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface MistBackgroundProps {
  showMoonGlow?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export function MistBackground({ showMoonGlow = true, intensity = 'medium' }: MistBackgroundProps) {
  const { colors, isDark } = useTheme();
  const mistAnim1 = useRef(new Animated.Value(0)).current;
  const mistAnim2 = useRef(new Animated.Value(0)).current;
  const moonPulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const createMistAnimation = (anim: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const moonAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(moonPulse, {
          toValue: 0.8,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(moonPulse, {
          toValue: 0.6,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    createMistAnimation(mistAnim1, 8000).start();
    createMistAnimation(mistAnim2, 12000).start();
    moonAnimation.start();

    return () => {
      mistAnim1.stopAnimation();
      mistAnim2.stopAnimation();
      moonPulse.stopAnimation();
    };
  }, [mistAnim1, mistAnim2, moonPulse]);

  const opacityMap = {
    low: 0.03,
    medium: 0.06,
    high: 0.1,
  };

  const mistOpacity = opacityMap[intensity];

  const gradientColors: [string, string, string] = [
    colors.gradientStart,
    colors.gradientMid,
    colors.gradientEnd,
  ];

  const mistColor1 = isDark ? 'rgba(242, 160, 181, 0.08)' : 'rgba(154, 123, 60, 0.04)';
  const mistColor2 = isDark ? 'rgba(232, 213, 163, 0.06)' : 'rgba(154, 123, 60, 0.03)';
  const moonGlowColor = isDark ? colors.accentGold : colors.accentGold;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {showMoonGlow && (
        <Animated.View
          style={[
            styles.moonGlow,
            {
              opacity: isDark ? moonPulse : Animated.multiply(moonPulse, 0.3),
              backgroundColor: moonGlowColor,
              shadowColor: moonGlowColor,
            },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.mistLayer,
          {
            opacity: mistAnim1.interpolate({
              inputRange: [0, 1],
              outputRange: [mistOpacity * 0.5, mistOpacity],
            }),
            transform: [
              {
                translateX: mistAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 20],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', mistColor1, 'transparent']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 1, y: 0.7 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.mistLayer2,
          {
            opacity: mistAnim2.interpolate({
              inputRange: [0, 1],
              outputRange: [mistOpacity * 0.3, mistOpacity * 0.7],
            }),
            transform: [
              {
                translateY: mistAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, -10],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', mistColor2, 'transparent']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        />
      </Animated.View>

      <View style={styles.noiseOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  moonGlow: {
    position: 'absolute',
    top: -height * 0.15,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 100,
  },
  mistLayer: {
    position: 'absolute',
    top: height * 0.2,
    left: -width * 0.3,
    width: width * 1.6,
    height: height * 0.4,
  },
  mistLayer2: {
    position: 'absolute',
    bottom: height * 0.1,
    right: -width * 0.2,
    width: width * 1.4,
    height: height * 0.3,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.02,
  },
});
