import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Animated, Dimensions, View } from 'react-native';
import KORI_COLORS from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface Petal {
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  opacity: Animated.Value;
  size: number;
  delay: number;
  startX: number;
}

interface SakuraPetalsProps {
  count?: number;
  duration?: number;
  enabled?: boolean;
}

export function SakuraPetals({ count = 8, duration = 6000, enabled = true }: SakuraPetalsProps) {
  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i): Petal => {
      const startX = Math.random() * width;
      return {
        x: new Animated.Value(startX),
        y: new Animated.Value(-50),
        rotation: new Animated.Value(0),
        opacity: new Animated.Value(0),
        size: 8 + Math.random() * 8,
        delay: i * (duration / count) * 0.5,
        startX,
      };
    });
  }, [count, duration]);

  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    if (!enabled) return;

    animationsRef.current = petals.map((petal) => {
      const createPetalAnimation = () => {
        const newStartX = Math.random() * width;
        petal.y.setValue(-50);
        petal.x.setValue(newStartX);
        petal.rotation.setValue(0);
        petal.opacity.setValue(0);

        return Animated.sequence([
          Animated.delay(petal.delay),
          Animated.parallel([
            Animated.timing(petal.y, {
              toValue: height + 50,
              duration: duration + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(petal.x, {
              toValue: newStartX + (Math.random() - 0.5) * 200,
              duration: duration + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(petal.rotation, {
              toValue: 360 * (2 + Math.random() * 2),
              duration: duration + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(petal.opacity, {
                toValue: 0.7,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.delay(duration * 0.6),
              Animated.timing(petal.opacity, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]);
      };

      const animation = Animated.loop(createPetalAnimation());
      animation.start();
      return animation;
    });

    return () => {
      animationsRef.current.forEach((anim) => anim.stop());
    };
  }, [enabled, petals, duration]);

  if (!enabled) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {petals.map((petal, index) => (
        <Animated.View
          key={index}
          style={[
            styles.petal,
            {
              width: petal.size,
              height: petal.size * 0.6,
              opacity: petal.opacity,
              transform: [
                { translateX: petal.x },
                { translateY: petal.y },
                {
                  rotate: petal.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  petal: {
    position: 'absolute',
    backgroundColor: KORI_COLORS.lunar.blossomPink,
    borderRadius: 50,
    shadowColor: KORI_COLORS.lunar.blossomPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});
