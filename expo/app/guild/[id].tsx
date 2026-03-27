import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useMemo, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Users, MessageSquare, Calendar, Heart, MessageCircle, ChevronRight, Crown } from 'lucide-react-native';
import { getGuildById, getGuildPosts, getGuildEvents, formatMemberCount, getPostTypeLabel, getPostTypeColor } from '@/services/GuildService';
import { MOCK_USERS } from '@/mocks/users';
import { UNIVERSES } from '@/constants/universes';
import { MistBackground, SigilLoader, CrescentButton, GlassChip } from '@/components/lunar';
import { useEntitlements } from '@/contexts/EntitlementsContext';
import KORI_COLORS from '@/constants/colors';

type TabType = 'posts' | 'events' | 'members';

export default function GuildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  const { hasGuildPro } = useEntitlements();
  const guild = useMemo(() => id ? getGuildById(id) : undefined, [id]);
  const isGuildPro = id ? hasGuildPro(id) : false;
  const posts = useMemo(() => id ? getGuildPosts(id) : [], [id]);
  const events = useMemo(() => id ? getGuildEvents(id) : [], [id]);
  const universe = useMemo(() => guild ? UNIVERSES.find(u => u.id === guild.universeId) : undefined, [guild]);

  const members = useMemo(() => {
    if (!guild) return [];
    return MOCK_USERS.filter(user => 
      user.universes.includes(guild.universeId)
    ).slice(0, 10);
  }, [guild]);

  if (!guild) {
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m ago`;
  };

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="medium" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Guild</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={[guild.color + '18', guild.color + '05', 'transparent']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={[styles.heroEmber, { backgroundColor: guild.color }]} />
            
            <View style={[styles.guildIcon, { backgroundColor: guild.color }]}>
              <Text style={styles.guildIconText}>{guild.name[0]}</Text>
            </View>
            <Text style={styles.guildName}>{guild.name}</Text>
            {universe && (
              <View style={styles.universeBadge}>
                <Text style={styles.universeIcon}>{universe.icon}</Text>
                <Text style={styles.universeText}>{universe.name}</Text>
              </View>
            )}
            <Text style={styles.guildDescription}>{guild.description}</Text>
            
            <View style={styles.guildStats}>
              <View style={styles.guildStat}>
                <Text style={[styles.guildStatValue, { color: guild.color }]}>
                  {formatMemberCount(guild.memberCount)}
                </Text>
                <Text style={styles.guildStatLabel}>Members</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.guildStat}>
                <Text style={[styles.guildStatValue, { color: guild.color }]}>
                  {posts.length}
                </Text>
                <Text style={styles.guildStatLabel}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.guildStat}>
                <Text style={[styles.guildStatValue, { color: guild.color }]}>
                  {events.length}
                </Text>
                <Text style={styles.guildStatLabel}>Events</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <CrescentButton
                title="Join Guild"
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                variant="primary"
                size="medium"
                style={styles.joinButton}
              />
              {isGuildPro ? (
                <View style={styles.proBadgeActive}>
                  <Crown size={14} color={KORI_COLORS.accent.gold} />
                  <Text style={styles.proBadgeActiveText}>PRO</Text>
                </View>
              ) : (
                <Pressable
                  style={styles.proUpgradeButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push(`/guild-pro?guildId=${id}` as any);
                  }}
                >
                  <Crown size={14} color={KORI_COLORS.accent.gold} />
                  <Text style={styles.proUpgradeText}>Upgrade</Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.tagsSection}>
            {guild.tags.map(tag => (
              <GlassChip key={tag} label={tag} color={guild.color} size="small" />
            ))}
          </View>

          <View style={styles.tabBar}>
            {[
              { id: 'posts' as const, label: 'Posts', icon: MessageSquare },
              { id: 'events' as const, label: 'Events', icon: Calendar },
              { id: 'members' as const, label: 'Members', icon: Users },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => handleTabChange(tab.id)}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                >
                  <Icon size={16} color={isActive ? guild.color : KORI_COLORS.text.tertiary} />
                  <Text style={[styles.tabLabel, isActive && { color: guild.color }]}>
                    {tab.label}
                  </Text>
                  {isActive && (
                    <View style={[styles.tabIndicator, { backgroundColor: guild.color }]} />
                  )}
                </Pressable>
              );
            })}
          </View>

          {activeTab === 'posts' && (
            <View style={styles.section}>
              {posts.length === 0 ? (
                <EmptyState icon="💬" title="No posts yet" text="Be the first to start a discussion" />
              ) : (
                posts.map(post => (
                  <PostCard key={post.id} post={post} formatTimeAgo={formatTimeAgo} />
                ))
              )}
            </View>
          )}

          {activeTab === 'events' && (
            <View style={styles.section}>
              {events.length === 0 ? (
                <EmptyState icon="📅" title="No events scheduled" text="Check back later for upcoming events" />
              ) : (
                events.map(event => (
                  <EventCard key={event.id} event={event} formatDate={formatDate} guildColor={guild.color} />
                ))
              )}
            </View>
          )}

          {activeTab === 'members' && (
            <View style={styles.section}>
              {members.length === 0 ? (
                <EmptyState icon="👥" title="No members visible" text="Members have their profiles hidden" />
              ) : (
                members.map(member => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push(`/person/${member.id}`);
                    }}
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

function PostCard({ post, formatTimeAgo }: { post: ReturnType<typeof getGuildPosts>[0]; formatTimeAgo: (date: Date) => string }) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={[styles.postAvatar, { backgroundColor: post.authorAvatar }]}>
          <Text style={styles.postAvatarText}>{post.authorName[0]}</Text>
        </View>
        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthorName}>{post.authorName}</Text>
          <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
        </View>
        <View style={[styles.postTypeBadge, { backgroundColor: getPostTypeColor(post.type) + '15' }]}>
          <Text style={[styles.postTypeText, { color: getPostTypeColor(post.type) }]}>
            {getPostTypeLabel(post.type)}
          </Text>
        </View>
      </View>
      <Text style={styles.postContent}>{post.content}</Text>
      <View style={styles.postFooter}>
        <View style={styles.postAction}>
          <Heart size={15} color={KORI_COLORS.text.secondary} />
          <Text style={styles.postActionText}>{post.likes}</Text>
        </View>
        <View style={styles.postAction}>
          <MessageCircle size={15} color={KORI_COLORS.text.secondary} />
          <Text style={styles.postActionText}>{post.comments}</Text>
        </View>
      </View>
    </View>
  );
}

function EventCard({ event, formatDate, guildColor }: { event: ReturnType<typeof getGuildEvents>[0]; formatDate: (date: Date) => string; guildColor: string }) {
  return (
    <View style={styles.eventCard}>
      <View style={[styles.eventDate, { backgroundColor: guildColor + '15' }]}>
        <Text style={[styles.eventDateText, { color: guildColor }]}>
          {formatDate(event.startDate)}
        </Text>
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventMeta}>
          {event.isVirtual ? 'Virtual' : event.location} • {event.attendeeCount} attending
        </Text>
      </View>
      <ChevronRight size={18} color={KORI_COLORS.text.tertiary} />
    </View>
  );
}

function MemberCard({ member, onPress }: { member: typeof MOCK_USERS[0]; onPress: () => void }) {
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
        style={styles.memberCard}
      >
        <View style={[styles.memberAvatar, { backgroundColor: member.avatarColor }]}>
          <View style={styles.memberRing} />
          <Text style={styles.memberAvatarText}>{member.displayName[0]}</Text>
        </View>
        <View style={styles.memberContent}>
          <Text style={styles.memberName}>{member.displayName}</Text>
          <Text style={styles.memberMeta}>
            {member.archetypes[0]} • {member.location?.city || 'Unknown'}
          </Text>
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
  },
  heroSection: {
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: 'hidden',
    padding: 22,
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
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
  guildIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guildIconText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  guildName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    textAlign: 'center',
  },
  universeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  universeIcon: {
    fontSize: 13,
  },
  universeText: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
  guildDescription: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  guildStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 6,
  },
  guildStat: {
    alignItems: 'center',
    gap: 3,
  },
  guildStatValue: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  guildStatLabel: {
    fontSize: 10,
    color: KORI_COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: KORI_COLORS.border.subtle,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  joinButton: {
    minWidth: 140,
  },
  proBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: KORI_COLORS.accent.gold + '20',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KORI_COLORS.accent.gold + '40',
  },
  proBadgeActiveText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: KORI_COLORS.accent.gold,
    letterSpacing: 1,
  },
  proUpgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KORI_COLORS.accent.gold + '40',
  },
  proUpgradeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: KORI_COLORS.accent.gold,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
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
  section: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 38,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  emptyText: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: KORI_COLORS.bg.primary,
  },
  postAuthorInfo: {
    flex: 1,
    gap: 2,
  },
  postAuthorName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  postTime: {
    fontSize: 10,
    color: KORI_COLORS.text.tertiary,
  },
  postTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  postTypeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  postContent: {
    fontSize: 13,
    color: KORI_COLORS.text.primary,
    lineHeight: 18,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 18,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  postActionText: {
    fontSize: 11,
    color: KORI_COLORS.text.secondary,
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
  memberCard: {
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
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberRing: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: KORI_COLORS.lunar.moonGold + '40',
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: KORI_COLORS.bg.primary,
  },
  memberContent: {
    flex: 1,
    gap: 3,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  memberMeta: {
    fontSize: 11,
    color: KORI_COLORS.text.secondary,
  },
  bottomSpacer: {
    height: 40,
  },
});
