import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  X,
  Crown,
  Pin,
  Users,
  Shield,
  Palette,
  Check,

} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useEntitlements } from '@/contexts/EntitlementsContext';
import { MistBackground } from '@/components/lunar';
import { getGuildById } from '@/services/GuildService';

const BENEFITS = [
  {
    icon: Palette,
    title: 'Custom Theme Accents',
    description: 'Badge flourish and banner accents for your guild',
  },
  {
    icon: Pin,
    title: 'Pinned Event',
    description: 'Pin one meetup to always show at the top',
  },
  {
    icon: Users,
    title: 'Moderator Roles',
    description: 'Add moderators to help manage your guild',
  },
  {
    icon: Shield,
    title: 'Enhanced Moderation',
    description: 'Approve posts and control member visibility',
  },
];

export default function GuildProScreen() {
  const router = useRouter();
  const { guildId } = useLocalSearchParams<{ guildId: string }>();
  const { colors } = useTheme();
  const { hasGuildPro, purchaseGuildPro, isPurchasing } = useEntitlements();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const guild = guildId ? getGuildById(guildId) : null;
  const isAlreadyPro = guildId ? hasGuildPro(guildId) : false;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, glowAnim]);

  const handlePurchase = useCallback(() => {
    if (!guildId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    purchaseGuildPro(guildId);
    setTimeout(() => {
      router.back();
    }, 500);
  }, [guildId, purchaseGuildPro, router]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  if (isAlreadyPro) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg0 }]}>
        <MistBackground />
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.text1} />
          </TouchableOpacity>
          <View style={styles.activeContainer}>
            <View style={[styles.proBadgeLarge, { backgroundColor: colors.accentGold + '20' }]}>
              <Crown size={48} color={colors.accentGold} />
            </View>
            <Text style={[styles.activeTitle, { color: colors.text0 }]}>
              Guild Pro Active
            </Text>
            <Text style={[styles.activeText, { color: colors.text1 }]}>
              {guild?.name || 'This guild'} has all premium features unlocked
            </Text>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.accentPrimary }]}
              onPress={handleClose}
            >
              <Text style={[styles.doneButtonText, { color: colors.text0 }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg0 }]}>
      <MistBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.text1} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.heroContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <Animated.View style={[styles.heroGlow, { opacity: glowOpacity }]}>
              <LinearGradient
                colors={[colors.accentGold + '40', 'transparent']}
                style={styles.heroGradient}
              />
            </Animated.View>
            <View style={[styles.proIcon, { backgroundColor: colors.accentGold + '20' }]}>
              <Crown size={40} color={colors.accentGold} />
            </View>
            <Text style={[styles.title, { color: colors.text0 }]}>Guild Pro</Text>
            <Text style={[styles.subtitle, { color: colors.text1 }]}>
              Unlock premium features for {guild?.name || 'your guild'}
            </Text>
          </Animated.View>

          <View style={styles.benefitsContainer}>
            {BENEFITS.map((benefit, index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.benefitCard,
                  { 
                    backgroundColor: colors.bg1,
                    borderColor: colors.glassBorder,
                    opacity: fadeAnim,
                  }
                ]}
              >
                <View style={[styles.benefitIcon, { backgroundColor: colors.accentGold + '15' }]}>
                  <benefit.icon size={22} color={colors.accentGold} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={[styles.benefitTitle, { color: colors.text0 }]}>
                    {benefit.title}
                  </Text>
                  <Text style={[styles.benefitDescription, { color: colors.text2 }]}>
                    {benefit.description}
                  </Text>
                </View>
                <Check size={18} color={colors.accentGold} />
              </Animated.View>
            ))}
          </View>

          <View style={styles.pricingContainer}>
            <View style={[styles.priceCard, { backgroundColor: colors.bg1, borderColor: colors.accentGold }]}>
              <Text style={[styles.priceLabel, { color: colors.text1 }]}>One-time Purchase</Text>
              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: colors.text0 }]}>$4.99</Text>
                <Text style={[styles.pricePeriod, { color: colors.text2 }]}>/guild</Text>
              </View>
              <Text style={[styles.priceNote, { color: colors.text2 }]}>
                Lifetime access for this guild
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.glassBorder }]}>
          <TouchableOpacity
            style={[styles.purchaseButton, { backgroundColor: colors.accentGold }]}
            onPress={handlePurchase}
            disabled={isPurchasing}
            activeOpacity={0.8}
          >
            <Crown size={20} color={colors.bg0} />
            <Text style={[styles.purchaseButtonText, { color: colors.bg0 }]}>
              {isPurchasing ? 'Processing...' : 'Upgrade to Pro'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClose}>
            <Text style={[styles.notNowText, { color: colors.text2 }]}>Not now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  heroGradient: {
    flex: 1,
    borderRadius: 100,
  },
  proIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  benefitsContainer: {
    gap: 12,
    marginTop: 24,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  pricingContainer: {
    marginTop: 28,
    marginBottom: 20,
  },
  priceCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 36,
    fontWeight: '700' as const,
  },
  pricePeriod: {
    fontSize: 14,
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
    alignItems: 'center',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  notNowText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  activeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  proBadgeLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  activeText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  doneButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
