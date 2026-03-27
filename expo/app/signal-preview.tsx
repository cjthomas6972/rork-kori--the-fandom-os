import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  X,
  Wifi,
  Clock,
  Eye,
  Sparkles,
  Check,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useUniverse } from '@/contexts/UniverseContext';
import { useEntitlements } from '@/contexts/EntitlementsContext';
import { MistBackground } from '@/components/lunar';

export default function SignalPreviewScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { selectedUniverseId, selectedUniverse } = useUniverse();
  const { hasUniversePass, activateSignal, hasActiveSignal } = useEntitlements();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const isAlreadyActive = selectedUniverseId ? hasActiveSignal(selectedUniverseId) : false;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
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
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, pulseAnim]);

  const handleActivate = useCallback(() => {
    if (!selectedUniverseId || !hasUniversePass) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    activateSignal(selectedUniverseId);
    
    setTimeout(() => {
      router.back();
    }, 300);
  }, [selectedUniverseId, hasUniversePass, activateSignal, router]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleGetPass = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/universe-pass');
  }, [router]);

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (isAlreadyActive) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg0 }]}>
        <MistBackground />
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.text1} />
          </TouchableOpacity>
          <View style={styles.activeContainer}>
            <View style={[styles.activeIcon, { backgroundColor: colors.accentGold + '20' }]}>
              <Wifi size={48} color={colors.accentGold} />
            </View>
            <Text style={[styles.activeTitle, { color: colors.text0 }]}>
              Signal Active
            </Text>
            <Text style={[styles.activeText, { color: colors.text1 }]}>
              You&apos;re already broadcasting in {selectedUniverse?.name || 'this universe'}
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

        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.heroSection}>
            <Animated.View style={[styles.pulseRing, { opacity: pulseOpacity }]}>
              <LinearGradient
                colors={[colors.accentGold + '40', 'transparent']}
                style={styles.pulseGradient}
              />
            </Animated.View>
            <View style={[styles.signalIcon, { backgroundColor: colors.accentGold + '20' }]}>
              <Wifi size={40} color={colors.accentGold} />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text0 }]}>Signal Your Universe</Text>
          <Text style={[styles.subtitle, { color: colors.text1 }]}>
            Boost your visibility in {selectedUniverse?.name || 'this universe'}
          </Text>

          <View style={[styles.benefitsCard, { backgroundColor: colors.bg1, borderColor: colors.glassBorder }]}>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.accentGold + '15' }]}>
                <Eye size={18} color={colors.accentGold} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text0 }]}>Boosted Discovery</Text>
                <Text style={[styles.benefitDesc, { color: colors.text2 }]}>
                  Appear higher in Aligned & Explore
                </Text>
              </View>
              <Check size={18} color={colors.accentGold} />
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.accentGold + '15' }]}>
                <Clock size={18} color={colors.accentGold} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text0 }]}>24 Hour Duration</Text>
                <Text style={[styles.benefitDesc, { color: colors.text2 }]}>
                  Signal active for a full day
                </Text>
              </View>
              <Check size={18} color={colors.accentGold} />
            </View>
          </View>

          {!hasUniversePass && (
            <View style={[styles.passRequired, { backgroundColor: colors.bg1, borderColor: colors.accentGold }]}>
              <Sparkles size={20} color={colors.accentGold} />
              <Text style={[styles.passRequiredText, { color: colors.text0 }]}>
                Universe Pass required
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={[styles.footer, { borderTopColor: colors.glassBorder }]}>
          {hasUniversePass ? (
            <TouchableOpacity
              style={[styles.activateButton, { backgroundColor: colors.accentGold }]}
              onPress={handleActivate}
              activeOpacity={0.8}
            >
              <Wifi size={20} color={colors.bg0} />
              <Text style={[styles.activateButtonText, { color: colors.bg0 }]}>
                Activate Signal
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.activateButton, { backgroundColor: colors.accentGold }]}
              onPress={handleGetPass}
              activeOpacity={0.8}
            >
              <Sparkles size={20} color={colors.bg0} />
              <Text style={[styles.activateButtonText, { color: colors.bg0 }]}>
                Get Universe Pass
              </Text>
            </TouchableOpacity>
          )}
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
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  pulseGradient: {
    flex: 1,
    borderRadius: 80,
  },
  signalIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  benefitsCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  passRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    width: '100%',
  },
  passRequiredText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
    alignItems: 'center',
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
  },
  activateButtonText: {
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
  activeIcon: {
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
