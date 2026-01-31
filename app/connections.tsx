import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  UserCheck,
  UserPlus,
  UserX,
  Clock,
  Check,
  X,
} from 'lucide-react-native';
import KORI_COLORS from '@/constants/colors';
import { getSocialUserById, SOCIAL_USERS } from '@/mocks/socialUsers';
import { FRIEND_REQUESTS } from '@/mocks/socialData';
import { MistBackground } from '@/components/lunar';
import PlanetHeader from '@/components/PlanetHeader';

const CURRENT_USER_ID = 'user_001';

type TabType = 'friends' | 'received' | 'sent';

export default function ConnectionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  
  const currentUser = useMemo(() => getSocialUserById(CURRENT_USER_ID), []);
  
  const friends = useMemo(() => {
    return (currentUser?.friends || [])
      .map(id => getSocialUserById(id))
      .filter(Boolean);
  }, [currentUser]);

  const receivedRequests = useMemo(() => {
    return FRIEND_REQUESTS.filter(r => r.toUserId === CURRENT_USER_ID && r.status === 'pending');
  }, []);

  const sentRequests = useMemo(() => {
    return FRIEND_REQUESTS.filter(r => r.fromUserId === CURRENT_USER_ID && r.status === 'pending');
  }, []);

  const handleAccept = useCallback((requestId: string, fromUserId: string) => {
    const requestIndex = FRIEND_REQUESTS.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
      FRIEND_REQUESTS[requestIndex].status = 'accepted';
    }
    
    const userIndex = SOCIAL_USERS.findIndex(u => u.id === CURRENT_USER_ID);
    if (userIndex !== -1 && !SOCIAL_USERS[userIndex].friends.includes(fromUserId)) {
      SOCIAL_USERS[userIndex].friends.push(fromUserId);
    }
    
    Alert.alert('Accepted', 'Friend request accepted!');
    console.log('[Connections] Accepted friend request:', requestId);
  }, []);

  const handleDecline = useCallback((requestId: string) => {
    const requestIndex = FRIEND_REQUESTS.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
      FRIEND_REQUESTS[requestIndex].status = 'declined';
    }
    
    Alert.alert('Declined', 'Friend request declined.');
    console.log('[Connections] Declined friend request:', requestId);
  }, []);

  const handleCancelSent = useCallback((requestId: string) => {
    const requestIndex = FRIEND_REQUESTS.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
      FRIEND_REQUESTS.splice(requestIndex, 1);
    }
    
    Alert.alert('Cancelled', 'Friend request cancelled.');
    console.log('[Connections] Cancelled sent request:', requestId);
  }, []);

  const renderFriendsTab = () => (
    <View style={styles.tabContent}>
      {friends.length > 0 ? (
        friends.map(friend => friend && (
          <TouchableOpacity
            key={friend.id}
            style={styles.userCard}
            onPress={() => router.push(`/person/${friend.id}` as any)}
          >
            <Image source={{ uri: friend.avatarUrl }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{friend.name}</Text>
              <Text style={styles.userMeta}>@{friend.username}</Text>
            </View>
            <UserCheck size={20} color={KORI_COLORS.status.success} />
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <UserPlus size={40} color={KORI_COLORS.text.tertiary} />
          <Text style={styles.emptyTitle}>No friends yet</Text>
          <Text style={styles.emptySubtitle}>Connect with aligned people to grow your circle</Text>
        </View>
      )}
    </View>
  );

  const renderReceivedTab = () => (
    <View style={styles.tabContent}>
      {receivedRequests.length > 0 ? (
        receivedRequests.map(request => {
          const fromUser = getSocialUserById(request.fromUserId);
          if (!fromUser) return null;
          
          return (
            <View key={request.id} style={styles.requestCard}>
              <TouchableOpacity
                style={styles.requestUserRow}
                onPress={() => router.push(`/person/${fromUser.id}` as any)}
              >
                <Image source={{ uri: fromUser.avatarUrl }} style={styles.avatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{fromUser.name}</Text>
                  <Text style={styles.userMeta}>@{fromUser.username}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAccept(request.id, request.fromUserId)}
                >
                  <Check size={18} color={KORI_COLORS.text.primary} />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleDecline(request.id)}
                >
                  <X size={18} color={KORI_COLORS.accent.primary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyState}>
          <Clock size={40} color={KORI_COLORS.text.tertiary} />
          <Text style={styles.emptyTitle}>No pending requests</Text>
          <Text style={styles.emptySubtitle}>When someone sends you a request, it will appear here</Text>
        </View>
      )}
    </View>
  );

  const renderSentTab = () => (
    <View style={styles.tabContent}>
      {sentRequests.length > 0 ? (
        sentRequests.map(request => {
          const toUser = getSocialUserById(request.toUserId);
          if (!toUser) return null;
          
          return (
            <View key={request.id} style={styles.requestCard}>
              <TouchableOpacity
                style={styles.requestUserRow}
                onPress={() => router.push(`/person/${toUser.id}` as any)}
              >
                <Image source={{ uri: toUser.avatarUrl }} style={styles.avatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{toUser.name}</Text>
                  <Text style={styles.userMeta}>@{toUser.username}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelSent(request.id)}
              >
                <UserX size={18} color={KORI_COLORS.accent.primary} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyState}>
          <UserPlus size={40} color={KORI_COLORS.text.tertiary} />
          <Text style={styles.emptyTitle}>No sent requests</Text>
          <Text style={styles.emptySubtitle}>Send friend requests from aligned profiles</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <MistBackground />
      <PlanetHeader title="Connections" />
      <View style={styles.contentArea}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
              Friends ({friends.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'received' && styles.tabActive]}
            onPress={() => setActiveTab('received')}
          >
            <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>
              Received ({receivedRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
            onPress={() => setActiveTab('sent')}
          >
            <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>
              Sent ({sentRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'friends' && renderFriendsTab()}
          {activeTab === 'received' && renderReceivedTab()}
          {activeTab === 'sent' && renderSentTab()}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KORI_COLORS.bg.primary,
  },
  contentArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: KORI_COLORS.glass.bg,
  },
  tabActive: {
    backgroundColor: KORI_COLORS.accent.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.secondary,
  },
  tabTextActive: {
    color: KORI_COLORS.text.primary,
  },
  tabContent: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  userMeta: {
    fontSize: 13,
    color: KORI_COLORS.text.tertiary,
    marginTop: 2,
  },
  requestCard: {
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    padding: 14,
    marginBottom: 10,
  },
  requestUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: KORI_COLORS.accent.primary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  declineButton: {
    backgroundColor: KORI_COLORS.bg.elevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: KORI_COLORS.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: KORI_COLORS.bg.elevated,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: KORI_COLORS.accent.primary,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: KORI_COLORS.accent.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: KORI_COLORS.text.tertiary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomPadding: {
    height: 40,
  },
});
