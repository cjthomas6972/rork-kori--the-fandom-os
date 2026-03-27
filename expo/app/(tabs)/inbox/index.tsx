
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
  UserPlus,
  Shield,
  Calendar,
  Check,
  X,
  MessageCircle,
} from 'lucide-react-native';
import { MistBackground } from '@/components/lunar';
import { 
  getUserDMThreads,
  getPendingFriendRequests,
  getPendingGuildInvites,
  getPendingMeetupInvites,
  formatTimeAgo,
  SOCIAL_USERS,
  GUILDS_FULL,
  EVENTS,
} from '@/services/SocialService';
import KORI_COLORS from '@/constants/colors';

const CURRENT_USER_ID = 'user_001';

type TabType = 'messages' | 'requests';

export default function InboxScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('messages');

  const dmThreads = useMemo(() => getUserDMThreads(CURRENT_USER_ID), []);
  const friendRequests = useMemo(() => getPendingFriendRequests(CURRENT_USER_ID), []);
  const guildInvites = useMemo(() => getPendingGuildInvites(CURRENT_USER_ID), []);
  const meetupInvites = useMemo(() => getPendingMeetupInvites(CURRENT_USER_ID), []);

  const totalRequests = friendRequests.length + guildInvites.length + meetupInvites.length;
  const totalUnread = dmThreads.reduce((sum, t) => sum + t.unreadCount, 0);

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="low" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inbox</Text>
        </View>

        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
            onPress={() => handleTabChange('messages')}
          >
            <MessageCircle size={16} color={activeTab === 'messages' ? KORI_COLORS.accent.gold : KORI_COLORS.text.tertiary} />
            <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
              Messages
            </Text>
            {totalUnread > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{totalUnread}</Text>
              </View>
            )}
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
            onPress={() => handleTabChange('requests')}
          >
            <UserPlus size={16} color={activeTab === 'requests' ? KORI_COLORS.accent.gold : KORI_COLORS.text.tertiary} />
            <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
              Requests
            </Text>
            {totalRequests > 0 && (
              <View style={[styles.tabBadge, styles.tabBadgeAlert]}>
                <Text style={styles.tabBadgeText}>{totalRequests}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'messages' ? (
            <>
              {dmThreads.length > 0 ? (
                dmThreads.map(thread => {
                  const otherUserId = thread.memberIds.find(id => id !== CURRENT_USER_ID);
                  const otherUser = SOCIAL_USERS.find(u => u.id === otherUserId);
                  return (
                    <DMThreadCard 
                      key={thread.id}
                      thread={thread}
                      otherUser={otherUser}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    />
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <MessageCircle size={48} color={KORI_COLORS.text.tertiary} />
                  <Text style={styles.emptyTitle}>No messages yet</Text>
                  <Text style={styles.emptyText}>
                    Start a conversation with aligned people
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              {friendRequests.length > 0 && (
                <View style={styles.requestSection}>
                  <Text style={styles.sectionTitle}>Friend Requests</Text>
                  {friendRequests.map(request => {
                    const fromUser = SOCIAL_USERS.find(u => u.id === request.fromUserId);
                    return (
                      <RequestCard 
                        key={request.id}
                        type="friend"
                        title={fromUser?.name || 'Unknown'}
                        subtitle={`wants to be friends`}
                        timestamp={request.createdAt}
                        icon={UserPlus}
                      />
                    );
                  })}
                </View>
              )}

              {guildInvites.length > 0 && (
                <View style={styles.requestSection}>
                  <Text style={styles.sectionTitle}>Guild Invites</Text>
                  {guildInvites.map(invite => {
                    const fromUser = SOCIAL_USERS.find(u => u.id === invite.fromUserId);
                    const guild = GUILDS_FULL.find(g => g.id === invite.guildId);
                    return (
                      <RequestCard 
                        key={invite.id}
                        type="guild"
                        title={guild?.name || 'Unknown Guild'}
                        subtitle={`Invited by ${fromUser?.name || 'Unknown'}`}
                        timestamp={invite.createdAt}
                        icon={Shield}
                      />
                    );
                  })}
                </View>
              )}

              {meetupInvites.length > 0 && (
                <View style={styles.requestSection}>
                  <Text style={styles.sectionTitle}>Meetup Invites</Text>
                  {meetupInvites.map(invite => {
                    const fromUser = SOCIAL_USERS.find(u => u.id === invite.fromUserId);
                    const event = EVENTS.find(e => e.id === invite.eventId);
                    return (
                      <RequestCard 
                        key={invite.id}
                        type="meetup"
                        title={event?.title || 'Unknown Event'}
                        subtitle={`Invited by ${fromUser?.name || 'Unknown'}`}
                        timestamp={invite.createdAt}
                        icon={Calendar}
                      />
                    );
                  })}
                </View>
              )}

              {totalRequests === 0 && (
                <View style={styles.emptyState}>
                  <UserPlus size={48} color={KORI_COLORS.text.tertiary} />
                  <Text style={styles.emptyTitle}>No pending requests</Text>
                  <Text style={styles.emptyText}>
                    All caught up!
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function DMThreadCard({ thread, otherUser, onPress }: {
  thread: any;
  otherUser?: any;
  onPress: () => void;
}) {
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
        style={styles.threadCard}
      >
        <View style={styles.threadAvatar}>
          <Text style={styles.threadAvatarText}>
            {otherUser?.name[0] || '?'}
          </Text>
          {thread.unreadCount > 0 && (
            <View style={styles.unreadDot} />
          )}
        </View>
        <View style={styles.threadContent}>
          <View style={styles.threadHeader}>
            <Text style={[
              styles.threadName,
              thread.unreadCount > 0 && styles.threadNameUnread
            ]}>
              {otherUser?.name || 'Unknown'}
            </Text>
            <Text style={styles.threadTime}>
              {formatTimeAgo(thread.lastMessageAt)}
            </Text>
          </View>
          <Text style={styles.threadPreview} numberOfLines={1}>
            Tap to view conversation...
          </Text>
        </View>
        {thread.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{thread.unreadCount}</Text>
          </View>
        )}
        <ChevronRight size={18} color={KORI_COLORS.text.tertiary} />
      </Pressable>
    </Animated.View>
  );
}

function RequestCard({ type, title, subtitle, timestamp, icon: Icon }: {
  type: 'friend' | 'guild' | 'meetup';
  title: string;
  subtitle: string;
  timestamp: Date;
  icon: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const getIconColor = () => {
    switch (type) {
      case 'friend': return KORI_COLORS.accent.secondary;
      case 'guild': return KORI_COLORS.accent.primary;
      case 'meetup': return KORI_COLORS.accent.gold;
      default: return KORI_COLORS.text.secondary;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.requestCard}
      >
        <View style={[styles.requestIcon, { backgroundColor: getIconColor() + '20' }]}>
          <Icon size={18} color={getIconColor()} />
        </View>
        <View style={styles.requestContent}>
          <Text style={styles.requestTitle}>{title}</Text>
          <Text style={styles.requestSubtitle}>{subtitle}</Text>
          <Text style={styles.requestTime}>{formatTimeAgo(timestamp)}</Text>
        </View>
        <View style={styles.requestActions}>
          <Pressable 
            style={styles.acceptButton}
            onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
          >
            <Check size={18} color={KORI_COLORS.text.primary} />
          </Pressable>
          <Pressable 
            style={styles.declineButton}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <X size={18} color={KORI_COLORS.text.secondary} />
          </Pressable>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
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
    backgroundColor: KORI_COLORS.accent.gold + '30',
  },
  tabBadgeAlert: {
    backgroundColor: KORI_COLORS.accent.primary + '30',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  threadCard: {
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
  threadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: KORI_COLORS.accent.secondary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  threadAvatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: KORI_COLORS.accent.secondary,
  },
  unreadDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: KORI_COLORS.accent.primary,
    borderWidth: 2,
    borderColor: KORI_COLORS.bg.card,
  },
  threadContent: {
    flex: 1,
    gap: 4,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  threadName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: KORI_COLORS.text.primary,
  },
  threadNameUnread: {
    fontWeight: '700' as const,
  },
  threadTime: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
  },
  threadPreview: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: KORI_COLORS.accent.primary,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  requestSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.secondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requestCard: {
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
  requestIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestContent: {
    flex: 1,
    gap: 2,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  requestSubtitle: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
  requestTime: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: KORI_COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: KORI_COLORS.glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
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
  bottomSpacer: {
    height: 24,
  },
});
