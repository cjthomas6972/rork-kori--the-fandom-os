import { useRouter } from 'expo-router';
import { useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Compass, Users, Sparkles, Calendar } from 'lucide-react-native';
import { MistBackground, CrescentButton } from '@/components/lunar';
import KORI_COLORS from '@/constants/colors';

export default function DiscoverScreen() {
  const router = useRouter();

  const features = [
    { icon: Users, label: 'Aligned People', desc: 'Find your kindred spirits', color: KORI_COLORS.lunar.moonGold },
    { icon: Compass, label: 'Explore Guilds', desc: 'Communities built on canon', color: KORI_COLORS.lunar.blossomPink },
    { icon: Calendar, label: 'Events', desc: 'Converge in the real world', color: KORI_COLORS.lunar.emberRed },
    { icon: Sparkles, label: 'Universes', desc: 'Expand your multiverse', color: KORI_COLORS.status.success },
  ];

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="medium" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Discover</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <View style={styles.heroGlow} />
              <Text style={styles.heroEmoji}>🔮</Text>
            </View>
            <Text style={styles.heroTitle}>Discovery Mode</Text>
            <Text style={styles.heroSubtitle}>
              Explore aligned people, guilds, and events{'\n'}within your universes
            </Text>
          </View>

          <View style={styles.featureGrid}>
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.label}
                icon={feature.icon}
                label={feature.label}
                description={feature.desc}
                color={feature.color}
                delay={index * 100}
              />
            ))}
          </View>

          <View style={styles.ctaSection}>
            <CrescentButton
              title="Coming Soon"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              variant="secondary"
              size="large"
              disabled
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.backButton}
      >
        <ArrowLeft size={22} color={KORI_COLORS.text.primary} />
      </Pressable>
    </Animated.View>
  );
}

function FeatureCard({ 
  icon: Icon, 
  label, 
  description, 
  color,
}: { 
  icon: typeof Users; 
  label: string; 
  description: string; 
  color: string;
  delay: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.featureCard}
      >
        <View style={[styles.featureGlow, { backgroundColor: color + '10' }]} />
        <View style={[styles.featureEmber, { backgroundColor: color }]} />
        <View style={[styles.featureIconContainer, { backgroundColor: color + '15' }]}>
          <Icon size={22} color={color} />
        </View>
        <Text style={styles.featureLabel}>{label}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: KORI_COLORS.glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  heroIcon: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: KORI_COLORS.lunar.moonGold,
    opacity: 0.12,
  },
  heroEmoji: {
    fontSize: 56,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: KORI_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  featureCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 16,
    padding: 18,
    gap: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  featureGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  featureEmber: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  featureDesc: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
    lineHeight: 16,
  },
  ctaSection: {
    marginTop: 28,
    alignItems: 'center',
  },
});
