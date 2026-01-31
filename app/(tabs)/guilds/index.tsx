import { useRouter } from 'expo-router';
import { useMemo, useRef, useCallback, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { 
  ChevronRight, 
  Users,
  Star,
  Zap,
  Plus,
  Sparkles,
} from 'lucide-react-native';
import { useUniverse } from '@/contexts/UniverseContext';
import UniverseSwitcher from '@/components/UniverseSwitcher';
import { MistBackground, GlassChip, PortalCard } from '@/components/lunar';
import { 
  getDiscoverGuilds, 
  getUserGuildsList,
} from '@/services/SocialService';
import { UNIVERSES } from '@/constants/universes';
import KORI_COLORS from '@/constants/colors';

const CURRENT_USER_ID = 'user_001';

type TabType = 'your' | 'discover';

export default function GuildsScreen() {
  const router = useRouter();
  const { selectedUniverseId, selectedUniverse } = useUniverse();
  const [activeTab, setActiveTab] = useState<TabType>('discover');

  const userGuilds = useMemo(() => {
    return getUserGuildsList(CURRENT_USER_ID);
  }, []);

  const discoverGuilds = useMemo(() => {
    return getDiscoverGuilds(selectedUniverseId || undefined);
  }, [selectedUniverseId]);

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="low" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Guilds</Text>
          <UniverseSwitcher compact />
        </View>

        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tab, activeTab === 'your' && styles.tabActive]}
            onPress={() => handleTabChange('your')}
          >
            <Text style={[styles.tabText, activeTab === 'your' && styles.tabTextActive]}>
              Your Guilds
            </Text>
            {userGuilds.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{userGuilds.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
            onPress={() => handleTabChange('discover')}
          >
            <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
              Discover
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'your' ? (
            <>
              {userGuilds.length > 0 ? (
                userGuilds.map(guild => {
                  const universe = UNIVERSES.find(u => u.id === guild.universeId);
                  return (
                    <GuildCard 
                      key={guild.id} 
                      guild={guild}
                      universe={universe}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push(`/guild/${guild.id}` as any);
                      }}
                    />
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Sparkles size={48} color={KORI_COLORS.text.tertiary} />
                  <Text style={styles.emptyTitle}>No guilds yet</Text>
                  <Text style={styles.emptyText}>
                    Join or create a guild to connect with your people
                  </Text>
                  <Pressable 
                    style={styles.createButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push('/create-guild' as any);
                    }}
                  >
                    <Plus size={18} color={KORI_COLORS.text.primary} />
                    <Text style={styles.createButtonText}>Create Guild</Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.discoverHeader}>
                <Text style={styles.discoverTitle}>
                  {selectedUniverse 
                    ? `Top Guilds in ${selectedUniverse.name}`
                    : 'Most Powerful Guilds'
                  }
                </Text>
                <Text style={styles.discoverSubtitle}>
                  Ranked by power score
                </Text>
              </View>

              {discoverGuilds.map((guild, index) => {
                const universe = UNIVERSES.find(u => u.id === guild.universeId);
                return (
                  <RankedGuildCard 
                    key={guild.id} 
                    guild={guild}
                    rank={index + 1}
                    universe={universe}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push(`/guild/${guild.id}` as any);
                    }}
                  />
                );
              })}
            </>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function GuildCard({ guild, universe, onPress }: { 
  guild: any; 
  universe?: any;
  onPress: () => void;
}) {
  const color = universe?.color || KORI_COLORS.accent.primary;

  return (
    <View>
      <PortalCard
        title={guild.name}
        subtitle={guild.tagline}
        color={color}
        onPress={onPress}
        showEmberEdge
        style={styles.guildCard}
      >
        <View style={styles.guildMeta}>
          <View style={styles.guildStat}>
            <Users size={14} color={KORI_COLORS.text.secondary} />
            <Text style={styles.guildStatText}>{guild.memberIds.length}</Text>
          </View>
          <View style={styles.guildStat}>
            <Zap size={14} color={color} />
            <Text style={[styles.guildStatText, { color }]}>{guild.powerScore}</Text>
          </View>
          <View style={styles.guildStat}>
            <Star size={14} color={KORI_COLORS.accent.gold} />
            <Text style={styles.guildStatText}>{guild.ratingAvg}</Text>
          </View>
        </View>
        <View style={styles.guildTags}>
          {guild.tags.slice(0, 3).map((tag: string) => (
            <GlassChip key={tag} label={tag} size="small" />
          ))}
        </View>
      </PortalCard>
    </View>
  );
}

function RankedGuildCard({ guild, rank, universe, onPress }: { 
  guild: any; 
  rank: number;
  universe?: any;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const color = universe?.color || KORI_COLORS.accent.primary;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const getRankColor = () => {
    if (rank === 1) return KORI_COLORS.accent.gold;
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return KORI_COLORS.text.tertiary;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.rankedCard}
      >
        <View style={[styles.rankBadge, { backgroundColor: getRankColor() + '20' }]}>
          <Text style={[styles.rankText, { color: getRankColor() }]}>#{rank}</Text>
        </View>
        
        <View style={styles.rankedContent}>
          <View style={styles.rankedHeader}>
            <View style={[styles.guildDot, { backgroundColor: color }]} />
            <View style={styles.rankedInfo}>
              <Text style={styles.rankedName}>{guild.name}</Text>
              <Text style={styles.rankedUniverse}>{universe?.name || 'Unknown'}</Text>
            </View>
          </View>
          
          <View style={styles.rankedStats}>
            <View style={styles.guildStat}>
              <Users size={12} color={KORI_COLORS.text.tertiary} />
              <Text style={styles.rankedStatText}>{guild.memberIds.length}</Text>
            </View>
            <View style={[styles.powerBadge, { backgroundColor: color + '20' }]}>
              <Zap size={12} color={color} />
              <Text style={[styles.powerText, { color }]}>{guild.powerScore}</Text>
            </View>
          </View>
        </View>
        
        <ChevronRight size={18} color={KORI_COLORS.text.tertiary} />
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
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
  },
  tabActive: {
    backgroundColor: KORI_COLORS.bg.card,
    borderColor: KORI_COLORS.accent.gold + '30',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.tertiary,
  },
  tabTextActive: {
    color: KORI_COLORS.accent.gold,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: KORI_COLORS.accent.primary + '30',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: KORI_COLORS.accent.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  discoverHeader: {
    marginBottom: 16,
  },
  discoverTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  discoverSubtitle: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
    marginTop: 2,
  },
  guildCard: {
    marginBottom: 12,
  },
  guildMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  guildStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guildStatText: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
  guildTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rankedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  rankedContent: {
    flex: 1,
    gap: 8,
  },
  rankedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  guildDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rankedInfo: {
    flex: 1,
  },
  rankedName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  rankedUniverse: {
    fontSize: 11,
    color: KORI_COLORS.text.secondary,
  },
  rankedStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 20,
  },
  rankedStatText: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
  },
  powerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  powerText: {
    fontSize: 11,
    fontWeight: '600' as const,
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
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: KORI_COLORS.accent.primary,
    borderRadius: 24,
    marginTop: 12,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  bottomSpacer: {
    height: 24,
  },
});
