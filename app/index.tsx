import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useIdentity } from '@/contexts/IdentityContext';
import KORI_COLORS from '@/constants/colors';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  const { onboardingComplete, isLoading } = useIdentity();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  const moonScale = useRef(new Animated.Value(0)).current;
  const moonOpacity = useRef(new Animated.Value(0)).current;
  const crescentRotation = useRef(new Animated.Value(0)).current;
  const crescentOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(20)).current;
  const petalOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const splashAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(moonScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(moonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(crescentRotation, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(crescentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(petalOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(400),
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    splashAnimation.start(() => {
      setShowSplash(false);
    });

    return () => {
      moonScale.stopAnimation();
      moonOpacity.stopAnimation();
      crescentRotation.stopAnimation();
      crescentOpacity.stopAnimation();
      logoOpacity.stopAnimation();
      logoTranslateY.stopAnimation();
      petalOpacity.stopAnimation();
      fadeOut.stopAnimation();
    };
  }, [moonScale, moonOpacity, crescentRotation, crescentOpacity, logoOpacity, logoTranslateY, petalOpacity, fadeOut]);

  useEffect(() => {
    if (!showSplash && !isLoading) {
      if (onboardingComplete) {
        router.replace('/(tabs)/home' as any);
      } else {
        router.replace('/onboarding');
      }
    }
  }, [showSplash, isLoading, onboardingComplete, router]);

  const petals = [
    { x: width * 0.2, y: height * 0.3, delay: 0 },
    { x: width * 0.7, y: height * 0.25, delay: 100 },
    { x: width * 0.4, y: height * 0.6, delay: 200 },
    { x: width * 0.8, y: height * 0.5, delay: 150 },
    { x: width * 0.15, y: height * 0.7, delay: 250 },
  ];

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <LinearGradient
        colors={KORI_COLORS.gradient.moonrise as [string, string, string]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Animated.View
        style={[
          styles.moonGlow,
          {
            opacity: moonOpacity,
            transform: [{ scale: moonScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.moon,
          {
            opacity: moonOpacity,
            transform: [{ scale: moonScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.crescentContainer,
          {
            opacity: crescentOpacity,
            transform: [
              {
                rotate: crescentRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-90deg', '0deg'],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.crescent} />
      </Animated.View>

      {petals.map((petal, index) => (
        <Animated.View
          key={index}
          style={[
            styles.petal,
            {
              left: petal.x,
              top: petal.y,
              opacity: petalOpacity,
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }],
          },
        ]}
      >
        <Text style={styles.logo}>KORI</Text>
        <Text style={styles.tagline}>The Multiverse Awaits</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KORI_COLORS.bg.primary,
  },
  moonGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: KORI_COLORS.lunar.moonGold,
    opacity: 0.15,
    shadowColor: KORI_COLORS.lunar.moonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
  },
  moon: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: KORI_COLORS.lunar.moonGold,
    shadowColor: KORI_COLORS.lunar.moonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  crescentContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crescent: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: KORI_COLORS.accent.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    shadowColor: KORI_COLORS.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  petal: {
    position: 'absolute',
    width: 10,
    height: 6,
    backgroundColor: KORI_COLORS.lunar.blossomPink,
    borderRadius: 5,
    shadowColor: KORI_COLORS.lunar.blossomPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  logoContainer: {
    position: 'absolute',
    bottom: height * 0.25,
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    letterSpacing: 12,
    textShadowColor: KORI_COLORS.lunar.moonGold + '40',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
