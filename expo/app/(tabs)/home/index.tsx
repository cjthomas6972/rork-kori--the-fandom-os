import { useRouter } from 'expo-router';
import { useMemo, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { 
  ChevronRight, 
  Users, 
  Calendar, 
  Shield, 
  Compass,
  Plus,
  Sparkles,
  Star,
  Award,
} from 'lucide-react-native';
import { useUniverse } from '@/contexts/UniverseContext';
import UniverseSwitcher from '@/components/UniverseSwitcher';
import { MistBackground, PortalCard, GlassChip } from '@/components/lunar';
import { 
  getAlignedUsersForUniverse, 
  getUniverseGuilds, 
  getUniverseEvents,
  getAlignmentColor,
} from '@/services/SocialService';
import { UNIVERSES } from '@/constants/universes';
import KORI_COLORS from '@/constants/colors';

const { width } = Dimensions.get('window');
const CURRENT_USER_ID = 'user_001';

export default function HomeScreen() {
  const router = useRouter();
  const { selectedUniverseId, selectedUniverse } = useUniverse();

  const alignedPeople = useMemo(() => {
    if (!selectedUniverseId) return [];
    return getAlignedUsersForUniverse(CURRENT_USER_ID, selectedUniverseId, 30).slice(0, 8);
  }, [selectedUniverseId]);

  const featuredGuilds = useMemo(() => {
    if (!selectedUniverseId) return [];
    return getUniverseGuilds(selectedUniverseId).slice(0, 5);
  }, [selectedUniverseId]);

  const upcomingEvents = useMemo(() => {
    if (!selectedUniverseId) return [];
    return getUniverseEvents(selectedUniverseId).slice(0, 5);
  }, [selectedUniverseId]);

  const handleNavigate = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="medium" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brandContainer}>
              <View style={styles.sigilMark} />
              <View>
                <Text style={styles.logo}>KORI</Text>
                <Text style={styles.tagline}>Universe Hub</Text>
              </View>
            </View>
          </View>
          
          <UniverseSwitcher />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedUniverse ? (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.moonHalo, { backgroundColor: selectedUniverse.color + '20' }]} />
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Your Aligned</Text>
                    <Text style={styles.sectionSubtitle}>{alignedPeople.length} people resonate with you</Text>
                  </View>
                  <Pressable onPress={() => handleNavigate('/(tabs)/aligned')}>
                    <Text style={styles.seeAll}>See All</Text>
                  </Pressable>
                </View>
                
                {alignedPeople.length > 0 ? (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                  >
                    {alignedPeople.map(person => (
                      <AlignedPersonCard
                        key={person.id}
                        person={person}
                        onPress={() => handleNavigate(`/person/${person.id}`)}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyState}>
                    <Users size={32} color={KORI_COLORS.text.tertiary} />
                    <Text style={styles.emptyText}>No aligned people yet</Text>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.moonHalo, { backgroundColor: KORI_COLORS.accent.gold + '20' }]}>
                    <Star size={16} color={KORI_COLORS.accent.gold} />
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Weekly Spotlight</Text>
                    <Text style={styles.sectionSubtitle}>Featured guilds this week</Text>
                  </View>
                </View>

                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.spotlightList}
                >
                  {featuredGuilds.slice(0, 3).map((guild, index) => (
                    <Pressable
                      key={guild.id}
                      style={styles.spotlightCard}
                      onPress={() => handleNavigate(`/guild/${guild.id}`)}
                    >
                      <View style={[styles.spotlightBadge, { backgroundColor: index === 0 ? KORI_COLORS.accent.gold : KORI_COLORS.accent.primary }]}>
                        <Award size={12} color={KORI_COLORS.text.primary} />
                        <Text style={styles.spotlightBadgeText}>#{index + 1}</Text>
                      </View>
                      <View style={[styles.spotlightIcon, { backgroundColor: UNIVERSES.find(u => u.id === guild.universeId)?.color + '30' || KORI_COLORS.accent.primary + '30' }]}>
                        <Shield size={24} color={UNIVERSES.find(u => u.id === guild.universeId)?.color || KORI_COLORS.accent.primary} />
                      </View>
                      <Text style={styles.spotlightName} numberOfLines={1}>{guild.name}</Text>
                      <Text style={styles.spotlightMeta}>{guild.memberIds.length} members</Text>
                      <View style={styles.spotlightPower}>
                        <Text style={styles.spotlightPowerText}>⚡ {guild.powerScore}</Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.moonHalo, { backgroundColor: KORI_COLORS.accent.primary + '20' }]} />
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Featured Guilds</Text>
                    <Text style={styles.sectionSubtitle}>Top communities in {selectedUniverse.name}</Text>
                  </View>
                  <Pressable onPress={() => handleNavigate('/(tabs)/guilds')}>
                    <Text style={styles.seeAll}>See All</Text>
                  </Pressable>
                </View>

                {featuredGuilds.map(guild => (
                  <PortalCard
                    key={guild.id}
                    title={guild.name}
                    subtitle={`${guild.memberIds.length} members • Power: ${guild.powerScore}`}
                    color={UNIVERSES.find(u => u.id === guild.universeId)?.color || KORI_COLORS.accent.primary}
                    onPress={() => handleNavigate(`/guild/${guild.id}`)}
                    showEmberEdge
                    compact
                    style={styles.guildCard}
                  >
                    <View style={styles.guildTags}>
                      {guild.tags.slice(0, 2).map(tag => (
                        <GlassChip key={tag} label={tag} size="small" />
                      ))}
                    </View>
                  </PortalCard>
                ))}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.moonHalo, { backgroundColor: KORI_COLORS.accent.secondary + '20' }]} />
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Upcoming Meetups</Text>
                    <Text style={styles.sectionSubtitle}>Events in {selectedUniverse.name}</Text>
                  </View>
                </View>

                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Calendar size={32} color={KORI_COLORS.text.tertiary} />
                    <Text style={styles.emptyText}>No upcoming events</Text>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Jump Portals</Text>
                <View style={styles.portalsGrid}>
                  <JumpPortal
                    icon={Compass}
                    label="Explore People"
                    color={KORI_COLORS.accent.gold}
                    onPress={() => handleNavigate('/(tabs)/aligned')}
                  />
                  <JumpPortal
                    icon={Shield}
                    label="Discover Guilds"
                    color={KORI_COLORS.accent.primary}
                    onPress={() => handleNavigate('/(tabs)/guilds')}
                  />
                  <JumpPortal
                    icon={Plus}
                    label="Create Guild"
                    color={KORI_COLORS.accent.secondary}
                    onPress={() => handleNavigate('/create-guild')}
                  />
                  <JumpPortal
                    icon={Calendar}
                    label="Create Meetup"
                    color="#00F0FF"
                    onPress={() => handleNavigate('/create-meetup')}
                  />
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noUniverseState}>
              <Sparkles size={48} color={KORI_COLORS.accent.gold} />
              <Text style={styles.noUniverseTitle}>Select a Universe</Text>
              <Text style={styles.noUniverseText}>
                Choose a universe to see aligned people, guilds, and events
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function AlignedPersonCard({ person, onPress }: { person: any; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const alignmentColor = getAlignmentColor(person.alignment.score);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
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
        <View style={styles.personAvatarContainer}>
          <View style={[styles.avatarRing, { borderColor: alignmentColor }]} />
          <View style={[styles.personAvatar, { backgroundColor: alignmentColor + '30' }]}>
            <Text style={styles.personAvatarText}>{person.name[0]}</Text>
          </View>
        </View>
        <Text style={styles.personName} numberOfLines={1}>{person.name}</Text>
        <Text style={styles.personTitle} numberOfLines={1}>
          {person.universeProfile?.identityTitle || 'Explorer'}
        </Text>
        <View style={[styles.alignmentBadge, { backgroundColor: alignmentColor + '20' }]}>
          <Text style={[styles.alignmentText, { color: alignmentColor }]}>
            {person.alignment.score}%
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function EventCard({ event }: { event: any }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.eventCard}
      >
        <View style={styles.eventDateBadge}>
          <Text style={styles.eventDay}>
            {event.startTime.toLocaleDateString('en-US', { day: 'numeric' })}
          </Text>
          <Text style={styles.eventMonth}>
            {event.startTime.toLocaleDateString('en-US', { month: 'short' })}
          </Text>
        </View>
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
          <Text style={styles.eventMeta}>
            {event.isOnline ? '🌐 Online' : `📍 ${event.locationText}`} • {event.attendeeIds.length} attending
          </Text>
        </View>
        <ChevronRight size={18} color={KORI_COLORS.text.tertiary} />
      </Pressable>
    </Animated.View>
  );
}

function JumpPortal({ icon: Icon, label, color, onPress }: { 
  icon: any; 
  label: string; 
  color: string; 
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
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
        style={styles.portalButton}
      >
        <View style={[styles.portalIcon, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={styles.portalLabel}>{label}</Text>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 14,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sigilMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: KORI_COLORS.lunar.moonGold,
    shadowColor: KORI_COLORS.lunar.moonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  moonHalo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
    marginTop: 2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.accent.gold,
  },
  horizontalList: {
    paddingRight: 20,
    gap: 12,
  },
  personCard: {
    width: 100,
    alignItems: 'center',
    padding: 12,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  personAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  personAvatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  personName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    textAlign: 'center',
  },
  personTitle: {
    fontSize: 10,
    color: KORI_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  alignmentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  alignmentText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  guildCard: {
    marginBottom: 10,
  },
  guildTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  eventDateBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: KORI_COLORS.accent.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: KORI_COLORS.accent.primary,
  },
  eventMonth: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: KORI_COLORS.accent.primary,
    textTransform: 'uppercase',
  },
  eventContent: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  eventMeta: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
  portalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  portalButton: {
    width: (width - 52) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  portalIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
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
  spotlightList: {
    paddingRight: 20,
    gap: 12,
  },
  spotlightCard: {
    width: 140,
    padding: 14,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    alignItems: 'center',
    position: 'relative',
  },
  spotlightBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  spotlightBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  spotlightIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  spotlightName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  spotlightMeta: {
    fontSize: 11,
    color: KORI_COLORS.text.secondary,
    marginBottom: 8,
  },
  spotlightPower: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: KORI_COLORS.accent.gold + '20',
    borderRadius: 8,
  },
  spotlightPowerText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: KORI_COLORS.accent.gold,
  },
});
