import { useRouter } from 'expo-router';
import { useState, useMemo, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Compass, Users, Sparkles, ChevronRight, User } from 'lucide-react-native';
import { useIdentity } from '@/contexts/IdentityContext';
import { UNIVERSES } from '@/constants/universes';
import { ARCHETYPES } from '@/constants/archetypes';
import { MOCK_USERS } from '@/mocks/users';
import { getFeaturedGuilds } from '@/services/GuildService';
import { getAlignedUsers, ResonanceResult } from '@/services/CompatibilityService';
import { MistBackground, GlassChip, PortalCard } from '@/components/lunar';
import { getResonanceColor } from '@/components/lunar/ResonanceMeter';
import KORI_COLORS from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { identity } = useIdentity();
  const [activeView, setActiveView] = useState<'worlds' | 'people' | 'guilds'>('worlds');

  const handleNavigation = (view: typeof activeView) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveView(view);
  };

  const userUniverses = UNIVERSES.filter(u => identity?.universes.includes(u.id));
  const userArchetypes = ARCHETYPES.filter(a => identity?.archetypes.includes(a.id));

  const featuredGuilds = useMemo(() => getFeaturedGuilds(3), []);
  
  const alignedPeople = useMemo(() => {
    if (!identity) return [];
    return getAlignedUsers(identity, MOCK_USERS, 20).slice(0, 5);
  }, [identity]);

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
                <Text style={styles.tagline}>The Multiverse Awaits</Text>
              </View>
            </View>
            <ProfileButton onPress={() => router.push('/profile')} />
          </View>

          <View style={styles.statusBar}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: KORI_COLORS.status.success }]} />
              <Text style={styles.statusText}>Online</Text>
            </View>
            <Text style={styles.statusDivider}>•</Text>
            <Text style={styles.statusText}>{userUniverses.length} Universes</Text>
            <Text style={styles.statusDivider}>•</Text>
            <Text style={styles.statusText}>{userArchetypes.length} Archetypes</Text>
          </View>
        </View>

        <View style={styles.navigation}>
          {[
            { id: 'worlds' as const, label: 'Worlds', icon: Sparkles },
            { id: 'people' as const, label: 'Aligned', icon: Users },
            { id: 'guilds' as const, label: 'Guilds', icon: Compass },
          ].map(nav => {
            const isActive = activeView === nav.id;
            const Icon = nav.icon;
            return (
              <Pressable
                key={nav.id}
                onPress={() => handleNavigation(nav.id)}
                style={[styles.navItem, isActive && styles.navItemActive]}
              >
                <Icon 
                  size={18} 
                  color={isActive ? KORI_COLORS.accent.gold : KORI_COLORS.text.tertiary} 
                />
                <Text style={[
                  styles.navLabel,
                  isActive && styles.navLabelActive,
                ]}>
                  {nav.label}
                </Text>
                {isActive && <View style={styles.navIndicator} />}
              </Pressable>
            );
          })}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeView === 'worlds' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.moonHalo} />
                <Text style={styles.sectionTitle}>Your Universes</Text>
              </View>
              
              <View style={styles.universeGrid}>
                {userUniverses.map(universe => (
                  <UniverseCard
                    key={universe.id}
                    universe={universe}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push(`/universe/${universe.id}`);
                    }}
                  />
                ))}
              </View>

              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Featured Guilds</Text>
                {featuredGuilds.map((guild) => {
                  const universe = UNIVERSES.find(u => u.id === guild.universeId);
                  return (
                    <PortalCard
                      key={guild.id}
                      title={guild.name}
                      subtitle={`${guild.memberCount.toLocaleString()} members • ${universe?.name}`}
                      color={guild.color}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push(`/guild/${guild.id}`);
                      }}
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
                  );
                })}
              </View>
            </View>
          )}

          {activeView === 'people' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.moonHalo} />
                <Text style={styles.sectionTitle}>Aligned People</Text>
              </View>
              <Text style={styles.sectionSubtitle}>People who resonate with your identity</Text>
              
              {alignedPeople.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>👥</Text>
                  <Text style={styles.emptyTitle}>Complete onboarding first</Text>
                  <Text style={styles.emptyText}>Set up your identity to find aligned people</Text>
                </View>
              ) : (
                alignedPeople.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push(`/person/${person.id}`);
                    }}
                  />
                ))
              )}
            </View>
          )}

          {activeView === 'guilds' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.moonHalo} />
                <Text style={styles.sectionTitle}>Discover Guilds</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Communities built around shared canon</Text>
              
              {getFeaturedGuilds(6).map((guild) => {
                const universe = UNIVERSES.find(u => u.id === guild.universeId);
                return (
                  <GuildCard
                    key={guild.id}
                    guild={guild}
                    universe={universe}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push(`/guild/${guild.id}`);
                    }}
                  />
                );
              })}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ProfileButton({ onPress }: { onPress: () => void }) {
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
        style={styles.profileButton}
      >
        <View style={styles.profileRing} />
        <User size={22} color={KORI_COLORS.text.primary} />
      </Pressable>
    </Animated.View>
  );
}

function UniverseCard({ universe, onPress }: { universe: typeof UNIVERSES[0]; onPress: () => void }) {
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
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.universeCard}
      >
        <View style={[styles.universeGlow, { backgroundColor: universe.color + '15' }]} />
        <Text style={styles.universeCardIcon}>{universe.icon}</Text>
        <Text style={styles.universeCardName}>{universe.name}</Text>
        <View style={styles.universeCardStats}>
          <Text style={[styles.universeCardStat, { color: universe.color }]}>124 aligned</Text>
        </View>
        <View style={[styles.universeBorder, { borderColor: universe.color + '40' }]} />
        <View style={[styles.universeEmberTop, { backgroundColor: universe.color }]} />
      </Pressable>
    </Animated.View>
  );
}

type AlignedUser = typeof MOCK_USERS[0] & { resonance: ResonanceResult };

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
            {ARCHETYPES.find(a => a.id === person.archetypes[0])?.name} • {person.location?.city || 'Unknown'}
          </Text>
        </View>
        <View style={[styles.resonanceBadge, { backgroundColor: resonanceColor + '15' }]}>
          <View style={[styles.resonanceCrescent, { borderColor: resonanceColor }]} />
          <Text style={[styles.resonanceText, { color: resonanceColor }]}>
            {person.resonance.score}%
          </Text>
        </View>
        <ChevronRight size={18} color={KORI_COLORS.text.tertiary} />
      </Pressable>
    </Animated.View>
  );
}

function GuildCard({ guild, universe, onPress }: { guild: ReturnType<typeof getFeaturedGuilds>[0]; universe?: typeof UNIVERSES[0]; onPress: () => void }) {
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
        style={styles.guildCardLarge}
      >
        <View style={[styles.guildGlow, { backgroundColor: guild.color + '10' }]} />
        <View style={[styles.guildEmberEdge, { backgroundColor: guild.color }]} />
        <View style={styles.guildCardHeader}>
          <View style={[styles.guildDot, { backgroundColor: guild.color, shadowColor: guild.color }]} />
          <Text style={styles.guildNameLarge}>{guild.name}</Text>
        </View>
        <View style={styles.guildCardFooter}>
          <Text style={styles.guildCategory}>{universe?.name}</Text>
          <Text style={[styles.guildMembers, { color: guild.color }]}>
            {guild.memberCount.toLocaleString()} members
          </Text>
        </View>
        <ChevronRight 
          size={18} 
          color={KORI_COLORS.text.tertiary} 
          style={styles.guildChevron}
        />
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
    paddingTop: 16,
    paddingBottom: 12,
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
    fontSize: 26,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
    marginTop: 2,
    letterSpacing: 1,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: KORI_COLORS.glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  profileRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: KORI_COLORS.lunar.moonGold + '30',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
  statusDivider: {
    color: KORI_COLORS.text.tertiary,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  navItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: KORI_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    overflow: 'hidden',
  },
  navItemActive: {
    backgroundColor: KORI_COLORS.bg.card,
    borderColor: KORI_COLORS.lunar.moonGold + '30',
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.tertiary,
  },
  navLabelActive: {
    color: KORI_COLORS.accent.gold,
  },
  navIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: KORI_COLORS.accent.primary,
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  moonHalo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: KORI_COLORS.lunar.moonGold + '15',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
    marginBottom: 16,
    marginLeft: 44,
  },
  subsection: {
    marginTop: 24,
  },
  subsectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    marginBottom: 12,
  },
  universeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  universeCard: {
    width: (width - 52) / 2,
    aspectRatio: 1.15,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  universeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  universeCardIcon: {
    fontSize: 36,
  },
  universeCardName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  universeCardStats: {
    gap: 4,
  },
  universeCardStat: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  universeBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderRadius: 16,
  },
  universeEmberTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  guildCard: {
    marginBottom: 10,
  },
  guildTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: KORI_COLORS.lunar.moonGold + '40',
  },
  personAvatarText: {
    fontSize: 18,
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
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resonanceCrescent: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  resonanceText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  guildCardLarge: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  guildGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  guildEmberEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  guildCardHeader: {
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
    shadowRadius: 6,
  },
  guildNameLarge: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  guildCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guildCategory: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
  guildMembers: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  guildChevron: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  emptyText: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});
