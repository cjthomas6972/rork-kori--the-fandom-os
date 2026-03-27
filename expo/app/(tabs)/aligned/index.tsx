import { useRouter } from 'expo-router';
import { useMemo, useRef, useCallback, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { 
  Search, 
  Filter, 
  MessageCircle, 
  UserPlus,
  ChevronRight,
  Sparkles,
  MapPin,
  Zap,
} from 'lucide-react-native';
import { useUniverse } from '@/contexts/UniverseContext';
import UniverseSwitcher from '@/components/UniverseSwitcher';
import { MistBackground, GlassChip, ResonanceMeter } from '@/components/lunar';
import { 
  getAlignedUsersForUniverse, 
  getAlignmentColor,
  getAlignmentLabel,
} from '@/services/SocialService';
import KORI_COLORS from '@/constants/colors';

const CURRENT_USER_ID = 'user_001';

export default function AlignedScreen() {
  const router = useRouter();
  const { selectedUniverseId, selectedUniverse } = useUniverse();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleWarp = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/warp');
  }, [router]);

  const alignedPeople = useMemo(() => {
    if (!selectedUniverseId) return [];
    return getAlignedUsersForUniverse(CURRENT_USER_ID, selectedUniverseId, 20);
  }, [selectedUniverseId]);

  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return alignedPeople;
    const query = searchQuery.toLowerCase();
    return alignedPeople.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.universeProfile?.identityTitle?.toLowerCase().includes(query)
    );
  }, [alignedPeople, searchQuery]);

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="low" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Aligned People</Text>
          <UniverseSwitcher compact />
        </View>

        {selectedUniverse && (
          <>
            <Pressable 
              style={styles.warpButton}
              onPress={handleWarp}
            >
              <View style={styles.warpContent}>
                <Zap size={20} color={KORI_COLORS.text.primary} />
                <View style={styles.warpTextContainer}>
                  <Text style={styles.warpTitle}>WARP</Text>
                  <Text style={styles.warpSubtitle}>Find someone like you now</Text>
                </View>
                <ChevronRight size={18} color={KORI_COLORS.text.primary} />
              </View>
            </Pressable>
          
            <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={18} color={KORI_COLORS.text.tertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search aligned people..."
                placeholderTextColor={KORI_COLORS.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Pressable 
              style={styles.filterButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowFilters(!showFilters);
              }}
            >
              <Filter size={18} color={KORI_COLORS.text.secondary} />
            </Pressable>
          </View>
          </>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedUniverse ? (
            <>
              <View style={styles.statsBar}>
                <Text style={styles.statsText}>
                  {filteredPeople.length} people aligned with you in {selectedUniverse.name}
                </Text>
              </View>

              {filteredPeople.length > 0 ? (
                filteredPeople.map(person => (
                  <PersonCard 
                    key={person.id} 
                    person={person}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push(`/person/${person.id}` as any);
                    }}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Sparkles size={48} color={KORI_COLORS.text.tertiary} />
                  <Text style={styles.emptyTitle}>No aligned people found</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Try a different search' : 'Check back later or explore other universes'}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noUniverseState}>
              <Sparkles size={48} color={KORI_COLORS.accent.gold} />
              <Text style={styles.noUniverseTitle}>Select a Universe</Text>
              <Text style={styles.noUniverseText}>
                Choose a universe to find aligned people
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function PersonCard({ person, onPress }: { person: any; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const alignmentColor = getAlignmentColor(person.alignment.score);
  const alignmentLabel = getAlignmentLabel(person.alignment.score);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.personCard}
      >
        <View style={styles.personHeader}>
          <View style={styles.personAvatarContainer}>
            <View style={[styles.avatarRing, { borderColor: alignmentColor }]} />
            <View style={[styles.personAvatar, { backgroundColor: alignmentColor + '30' }]}>
              <Text style={[styles.personAvatarText, { color: alignmentColor }]}>
                {person.name[0]}
              </Text>
            </View>
          </View>
          
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={styles.personTitle}>
              {person.universeProfile?.identityTitle || 'Explorer'}
            </Text>
            {person.location && (
              <View style={styles.locationRow}>
                <MapPin size={12} color={KORI_COLORS.text.tertiary} />
                <Text style={styles.locationText}>{person.location.city}</Text>
              </View>
            )}
          </View>

          <View style={styles.alignmentContainer}>
            <ResonanceMeter score={person.alignment.score} size={40} />
            <Text style={[styles.alignmentLabel, { color: alignmentColor }]}>
              {alignmentLabel}
            </Text>
          </View>
        </View>

        {person.alignment.reasons && person.alignment.reasons.length > 0 && (
          <View style={styles.reasonsContainer}>
            {person.alignment.reasons.slice(0, 2).map((reason: string, index: number) => (
              <GlassChip key={index} label={reason} size="small" />
            ))}
          </View>
        )}

        <View style={styles.personActions}>
          <Pressable 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <MessageCircle size={16} color={KORI_COLORS.accent.gold} />
            <Text style={styles.actionText}>Message</Text>
          </Pressable>
          <Pressable 
            style={[styles.actionButton, styles.primaryAction]}
            onPress={(e) => {
              e.stopPropagation();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <UserPlus size={16} color={KORI_COLORS.text.primary} />
            <Text style={[styles.actionText, styles.primaryActionText]}>Add Friend</Text>
          </Pressable>
          <ChevronRight size={18} color={KORI_COLORS.text.tertiary} />
        </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: KORI_COLORS.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: KORI_COLORS.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  content: {
    flex: 1,
  },
  statsBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  statsText: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
  },
  personCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  personAvatarContainer: {
    position: 'relative',
  },
  avatarRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  personAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  personAvatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  personInfo: {
    flex: 1,
    gap: 2,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  personTitle: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: KORI_COLORS.text.tertiary,
  },
  alignmentContainer: {
    alignItems: 'center',
    gap: 4,
  },
  alignmentLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: KORI_COLORS.glass.border,
  },
  personActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: KORI_COLORS.glass.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  primaryAction: {
    backgroundColor: KORI_COLORS.accent.primary,
    borderColor: KORI_COLORS.accent.primary,
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.secondary,
  },
  primaryActionText: {
    color: KORI_COLORS.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  emptyText: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
    textAlign: 'center',
  },
  noUniverseState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 16,
  },
  noUniverseTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  noUniverseText: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 24,
  },
  warpButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: KORI_COLORS.accent.primary,
    borderRadius: 14,
    overflow: 'hidden',
  },
  warpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  warpTextContainer: {
    flex: 1,
  },
  warpTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    letterSpacing: 1.5,
  },
  warpSubtitle: {
    fontSize: 11,
    color: KORI_COLORS.text.primary,
    opacity: 0.8,
    marginTop: 1,
  },
});
