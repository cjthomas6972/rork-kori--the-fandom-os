import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useMemo, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Users, Shield, Calendar, ChevronRight } from 'lucide-react-native';
import { UNIVERSES } from '@/constants/universes';
import { useIdentity } from '@/contexts/IdentityContext';
import { MOCK_USERS } from '@/mocks/users';
import { getUsersInUniverse, ResonanceResult } from '@/services/CompatibilityService';
import { getGuildsByUniverse, formatMemberCount } from '@/services/GuildService';
import { getEventsByUniverse } from '@/mocks/events';
import { MistBackground, SigilLoader, GlassChip } from '@/components/lunar';
import { getResonanceColor } from '@/components/lunar/ResonanceMeter';
import KORI_COLORS from '@/constants/colors';

type TabType = 'people' | 'guilds' | 'events';
type AlignedUser = typeof MOCK_USERS[0] & { resonance: ResonanceResult };

export default function UniverseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { identity } = useIdentity();
  const [activeTab, setActiveTab] = useState<TabType>('people');

  const universe = useMemo(() => UNIVERSES.find(u => u.id === id), [id]);

  const alignedUsers = useMemo(() => {
    if (!identity || !id) return [];
    return getUsersInUniverse(identity, MOCK_USERS, id);
  }, [identity, id]);

  const guilds = useMemo(() => {
    if (!id) return [];
    return getGuildsByUniverse(id);
  }, [id]);

  const events = useMemo(() => {
    if (!id) return [];
    return getEventsByUniverse(id);
  }, [id]);

  if (!universe) {
    return (
      <View style={styles.container}>
        <MistBackground showMoonGlow intensity="low" />
        <SafeAreaView style={styles.loadingContainer}>
          <SigilLoader size={56} />
        </SafeAreaView>
      </View>
    );
  }

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="medium" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerIcon}>{universe.icon}</Text>
            <Text style={styles.headerTitle}>{universe.name}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.heroSection}>
          <LinearGradient
            colors={[universe.color + '20', universe.color + '08', 'transparent']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={[styles.heroEmber, { backgroundColor: universe.color }]} />
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: universe.color }]}>
                {alignedUsers.length}
              </Text>
              <Text style={styles.heroStatLabel}>Aligned</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: universe.color }]}>
                {guilds.length}
              </Text>
              <Text style={styles.heroStatLabel}>Guilds</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: universe.color }]}>
                {events.length}
              </Text>
              <Text style={styles.heroStatLabel}>Events</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabBar}>
          {[
            { id: 'people' as const, label: 'People', icon: Users },
            { id: 'guilds' as const, label: 'Guilds', icon: Shield },
            { id: 'events' as const, label: 'Events', icon: Calendar },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <Pressable
                key={tab.id}
                onPress={() => handleTabChange(tab.id)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
              >
                <Icon
                  size={16}
                  color={isActive ? universe.color : KORI_COLORS.text.tertiary}
                />
                <Text style={[styles.tabLabel, isActive && { color: universe.color }]}>
                  {tab.label}
                </Text>
                {isActive && (
                  <View style={[styles.tabIndicator, { backgroundColor: universe.color }]} />
                )}
              </Pressable>
            );
          })}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'people' && (
            <View style={styles.section}>
              {alignedUsers.length === 0 ? (
                <EmptyState
                  icon="👥"
                  title="No aligned users yet"
                  text="Be the first to explore this universe"
                />
              ) : (
                alignedUsers.map(user => (
                  <PersonCard
                    key={user.id}
                    person={user}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push(`/person/${user.id}`);
                    }}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'guilds' && (
            <View style={styles.section}>
              {guilds.length === 0 ? (
                <EmptyState
                  icon="🛡️"
                  title="No guilds yet"
                  text="Be the first to create a guild in this universe"
                />
              ) : (
                guilds.map(guild => (
                  <GuildCard
                    key={guild.id}
                    guild={guild}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push(`/guild/${guild.id}`);
                    }}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'events' && (
            <View style={styles.section}>
              {events.length === 0 ? (
                <EmptyState
                  icon="📅"
                  title="No events yet"
                  text="Check back later for upcoming events"
                />
              ) : (
                events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    formatDate={formatEventDate}
                  />
                ))
              )}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
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

function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function PersonCard({ person, onPress }: { person: AlignedUser; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const resonanceColor = getResonanceColor(person.resonance.score);

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
        <View style={[styles.personAvatar, { backgroundColor: person.avatarColor }]}>
          <View style={styles.avatarRing} />
          <Text style={styles.personAvatarText}>{person.displayName[0]}</Text>
        </View>
        <View style={styles.personContent}>
          <Text style={styles.personName}>{person.displayName}</Text>
          <Text style={styles.personMeta}>
            {person.archetypes[0]} • {person.location?.city || 'Unknown'}
          </Text>
        </View>
        <View style={[styles.resonanceBadge, { backgroundColor: resonanceColor + '15' }]}>
          <Text style={[styles.resonanceText, { color: resonanceColor }]}>
            {person.resonance.score}%
          </Text>
        </View>
        <ChevronRight size={18} color={KORI_COLORS.text.tertiary} />
      </Pressable>
    </Animated.View>
  );
}

function GuildCard({ guild, onPress }: { guild: ReturnType<typeof getGuildsByUniverse>[0]; onPress: () => void }) {
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
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.guildCard}
      >
        <LinearGradient
          colors={[guild.color + '12', guild.color + '05']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.guildEmber, { backgroundColor: guild.color }]} />
        <View style={styles.guildHeader}>
          <View style={[styles.guildDot, { backgroundColor: guild.color, shadowColor: guild.color }]} />
          <Text style={styles.guildName}>{guild.name}</Text>
        </View>
        <Text style={styles.guildDescription} numberOfLines={2}>
          {guild.description}
        </Text>
        <View style={styles.guildFooter}>
          <Text style={[styles.guildMembers, { color: guild.color }]}>
            {formatMemberCount(guild.memberCount)} members
          </Text>
          <View style={styles.guildTags}>
            {guild.tags.slice(0, 2).map(tag => (
              <GlassChip key={tag} label={tag} size="small" />
            ))}
          </View>
        </View>
        <ChevronRight size={18} color={KORI_COLORS.text.tertiary} style={styles.guildChevron} />
      </Pressable>
    </Animated.View>
  );
}

function EventCard({ event, formatDate }: { event: ReturnType<typeof getEventsByUniverse>[0]; formatDate: (date: Date) => string }) {
  return (
    <View style={styles.eventCard}>
      <View style={[styles.eventDate, { backgroundColor: event.color + '15' }]}>
        <Text style={[styles.eventDateText, { color: event.color }]}>
          {formatDate(event.startDate)}
        </Text>
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventMeta}>
          {event.isVirtual ? 'Virtual' : event.location} • {event.attendeeCount} attending
        </Text>
      </View>
      <View style={[styles.eventTypeBadge, { backgroundColor: event.color + '12', borderColor: event.color + '40' }]}>
        <Text style={[styles.eventTypeText, { color: event.color }]}>
          {event.type.replace('_', ' ')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 18,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  heroEmber: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heroStat: {
    alignItems: 'center',
    gap: 4,
  },
  heroStatValue: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  heroStatLabel: {
    fontSize: 11,
    color: KORI_COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroDivider: {
    width: 1,
    height: 36,
    backgroundColor: KORI_COLORS.border.subtle,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: KORI_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    position: 'relative',
    overflow: 'hidden',
  },
  tabItemActive: {
    backgroundColor: KORI_COLORS.bg.card,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.tertiary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 44,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  emptyText: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
    textAlign: 'center',
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: KORI_COLORS.lunar.moonGold + '40',
  },
  personAvatarText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: KORI_COLORS.bg.primary,
  },
  personContent: {
    flex: 1,
    gap: 3,
  },
  personName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  personMeta: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
  resonanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resonanceText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  guildCard: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  guildEmber: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  guildHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 24,
  },
  guildDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  guildName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  guildDescription: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
    lineHeight: 18,
  },
  guildFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guildMembers: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  guildTags: {
    flexDirection: 'row',
    gap: 6,
  },
  guildChevron: {
    position: 'absolute',
    top: 16,
    right: 14,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  eventDate: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  eventDateText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  eventContent: {
    flex: 1,
    gap: 3,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  eventMeta: {
    fontSize: 11,
    color: KORI_COLORS.text.secondary,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'capitalize',
  },
  bottomSpacer: {
    height: 40,
  },
});
