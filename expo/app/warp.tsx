import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Zap,
  MessageCircle,
  UserPlus,
  ChevronRight,
  X,
  Sparkles,
  MapPin,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useUniverse } from '@/contexts/UniverseContext';
import { MistBackground, ResonanceMeter, GlassChip } from '@/components/lunar';
import { 
  getAlignedUsersForUniverse, 
  getAlignmentColor,
  getAlignmentLabel,
} from '@/services/SocialService';

const CURRENT_USER_ID = 'user_001';

export default function WarpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { selectedUniverseId, selectedUniverse } = useUniverse();
  const [, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  const alignedPeople = useMemo(() => {
    if (!selectedUniverseId) return [];
    return getAlignedUsersForUniverse(CURRENT_USER_ID, selectedUniverseId, 20);
  }, [selectedUniverseId]);

  const currentMatch = useMemo(() => {
    const available = alignedPeople.filter(p => !seenIds.has(p.id));
    return available[0] || null;
  }, [alignedPeople, seenIds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearTimeout(timer);
  }, [cardScale, cardOpacity, glowPulse]);

  const handleNextWarp = useCallback(() => {
    if (!currentMatch) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.parallel([
      Animated.timing(cardScale, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSeenIds(prev => new Set([...prev, currentMatch.id]));
      setCurrentIndex(prev => prev + 1);
      
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [currentMatch, cardScale, cardOpacity]);

  const handleDM = useCallback(() => {
    if (!currentMatch) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/inbox` as any);
  }, [currentMatch, router]);

  const handleAddFriend = useCallback(() => {
    if (!currentMatch) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('[Warp] Add friend:', currentMatch.id);
  }, [currentMatch]);

  const handleViewProfile = useCallback(() => {
    if (!currentMatch) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/person/${currentMatch.id}` as any);
  }, [currentMatch, router]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const glowInterpolate = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg0 }]}>
        <MistBackground />
        <SafeAreaView style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingGlow, { opacity: glowInterpolate }]}>
            <LinearGradient
              colors={[colors.accentPrimary + '40', 'transparent']}
              style={styles.loadingGradient}
            />
          </Animated.View>
          <Zap size={48} color={colors.accentPrimary} />
          <Text style={[styles.loadingText, { color: colors.text0 }]}>
            Finding your match...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  if (!currentMatch) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg0 }]}>
        <MistBackground />
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.text1} />
          </TouchableOpacity>
          <View style={styles.emptyContainer}>
            <Sparkles size={64} color={colors.accentGold} />
            <Text style={[styles.emptyTitle, { color: colors.text0 }]}>
              No more matches
            </Text>
            <Text style={[styles.emptyText, { color: colors.text1 }]}>
              You&apos;ve seen everyone aligned with you in {selectedUniverse?.name || 'this universe'}
            </Text>
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: colors.accentPrimary }]}
              onPress={() => {
                setSeenIds(new Set());
                setCurrentIndex(0);
              }}
            >
              <Text style={[styles.resetButtonText, { color: colors.text0 }]}>
                Start Over
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const alignmentColor = getAlignmentColor(currentMatch.alignment.score);
  const alignmentLabel = getAlignmentLabel(currentMatch.alignment.score);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg0 }]}>
      <MistBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.text1} />
          </TouchableOpacity>
          <View style={styles.warpBadge}>
            <Zap size={16} color={colors.accentPrimary} />
            <Text style={[styles.warpText, { color: colors.accentPrimary }]}>WARP</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <Animated.View 
          style={[
            styles.cardContainer,
            {
              transform: [{ scale: cardScale }],
              opacity: cardOpacity,
            }
          ]}
        >
          <View style={[styles.card, { backgroundColor: colors.bg1, borderColor: colors.glassBorder }]}>
            <Animated.View 
              style={[
                styles.cardGlow,
                { 
                  opacity: glowInterpolate,
                  backgroundColor: alignmentColor + '20',
                }
              ]} 
            />
            
            <View style={styles.avatarSection}>
              <View style={[styles.avatarRing, { borderColor: alignmentColor }]}>
                {currentMatch.avatarUrl ? (
                  <Image source={{ uri: currentMatch.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: alignmentColor + '30' }]}>
                    <Text style={[styles.avatarText, { color: alignmentColor }]}>
                      {currentMatch.name[0]}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.resonanceContainer}>
                <ResonanceMeter score={currentMatch.alignment.score} size={56} />
              </View>
            </View>

            <Text style={[styles.name, { color: colors.text0 }]}>{currentMatch.name}</Text>
            <Text style={[styles.identity, { color: colors.accentGold }]}>
              {currentMatch.universeProfile?.identityTitle || 'Explorer'}
            </Text>

            {currentMatch.location && (
              <View style={styles.locationRow}>
                <MapPin size={14} color={colors.text2} />
                <Text style={[styles.locationText, { color: colors.text2 }]}>
                  {currentMatch.location.city}
                </Text>
              </View>
            )}

            <View style={[styles.alignmentBadge, { backgroundColor: alignmentColor + '20' }]}>
              <Text style={[styles.alignmentScore, { color: alignmentColor }]}>
                {currentMatch.alignment.score}% {alignmentLabel}
              </Text>
            </View>

            {currentMatch.alignment.reasons && currentMatch.alignment.reasons.length > 0 && (
              <View style={styles.reasonsContainer}>
                {currentMatch.alignment.reasons.slice(0, 2).map((reason, index) => (
                  <GlassChip key={index} label={reason} size="small" />
                ))}
              </View>
            )}

            <TouchableOpacity 
              style={styles.viewProfileButton}
              onPress={handleViewProfile}
            >
              <Text style={[styles.viewProfileText, { color: colors.accentGold }]}>
                View Full Profile
              </Text>
              <ChevronRight size={16} color={colors.accentGold} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.bg1, borderColor: colors.glassBorder }]}
            onPress={handleDM}
          >
            <MessageCircle size={22} color={colors.accentGold} />
            <Text style={[styles.actionText, { color: colors.text0 }]}>DM</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: colors.accentPrimary }]}
            onPress={handleAddFriend}
          >
            <UserPlus size={22} color={colors.text0} />
            <Text style={[styles.primaryActionText, { color: colors.text0 }]}>Add Friend</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.bg1, borderColor: colors.glassBorder }]}
            onPress={handleNextWarp}
          >
            <Zap size={22} color={colors.accentPrimary} />
            <Text style={[styles.actionText, { color: colors.text0 }]}>Next</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.matchCount, { color: colors.text2 }]}>
          {alignedPeople.length - seenIds.size} matches remaining
        </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  loadingGradient: {
    flex: 1,
    borderRadius: 100,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  warpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  warpText: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  placeholder: {
    width: 40,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    maxHeight: 480,
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    height: 200,
    borderRadius: 100,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    padding: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700' as const,
  },
  resonanceContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  identity: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 13,
  },
  alignmentBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  alignmentScore: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  primaryAction: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  matchCount: {
    textAlign: 'center',
    fontSize: 12,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
