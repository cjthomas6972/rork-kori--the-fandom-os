import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import KORI_COLORS from '@/constants/colors';

interface SigilLoaderProps {
  size?: number;
  color?: string;
}

export function SigilLoader({ size = 48, color = KORI_COLORS.accent.primary }: SigilLoaderProps) {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.8)).current;
  const crescentGlow = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const rotationAnimation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.8,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(crescentGlow, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(crescentGlow, {
          toValue: 0.5,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    rotationAnimation.start();
    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      rotation.stopAnimation();
      pulse.stopAnimation();
      crescentGlow.stopAnimation();
    };
  }, [rotation, pulse, crescentGlow]);

  const moonSize = size * 0.6;
  const crescentSize = size * 0.7;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.moon,
          {
            width: moonSize,
            height: moonSize,
            borderRadius: moonSize / 2,
            backgroundColor: KORI_COLORS.lunar.moonGold,
            opacity: pulse,
            shadowColor: KORI_COLORS.lunar.moonGold,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.crescentContainer,
          {
            width: size,
            height: size,
            transform: [
              {
                rotate: rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.crescent,
            {
              width: crescentSize,
              height: crescentSize,
              borderRadius: crescentSize / 2,
              borderColor: color,
              opacity: crescentGlow,
              shadowColor: color,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moon: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  crescentContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crescent: {
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
});
