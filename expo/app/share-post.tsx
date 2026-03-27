import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Send, MessageCircle } from 'lucide-react-native';
import KORI_COLORS from '@/constants/colors';
import { getSocialUserById } from '@/mocks/socialUsers';
import { getUserDMThreads } from '@/services/SocialService';
import { MistBackground } from '@/components/lunar';

const CURRENT_USER_ID = 'user_001';

export default function SharePostScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const currentUser = useMemo(() => getSocialUserById(CURRENT_USER_ID), []);
  const dmThreads = useMemo(() => getUserDMThreads(CURRENT_USER_ID), []);

  const recentChats = useMemo(() => {
    const userIds = new Set<string>();
    dmThreads.forEach(thread => {
      thread.memberIds.forEach(id => {
        if (id !== CURRENT_USER_ID) userIds.add(id);
      });
    });
    return Array.from(userIds)
      .map(id => getSocialUserById(id))
      .filter(Boolean);
  }, [dmThreads]);

  const friends = useMemo(() => {
    return (currentUser?.friends || [])
      .map(id => getSocialUserById(id))
      .filter(Boolean);
  }, [currentUser]);

  const allUsers = useMemo(() => {
    const userMap = new Map();
    recentChats.forEach(u => u && userMap.set(u.id, u));
    friends.forEach(u => u && userMap.set(u.id, u));
    return Array.from(userMap.values());
  }, [recentChats, friends]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;
    const query = searchQuery.toLowerCase();
    return allUsers.filter(
      u => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query)
    );
  }, [allUsers, searchQuery]);

  const toggleUser = useCallback((userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleShare = useCallback(() => {
    if (selectedUsers.length === 0) {
      Alert.alert('Select Recipients', 'Please select at least one person to share with.');
      return;
    }

    const selectedNames = selectedUsers
      .map(id => getSocialUserById(id)?.name)
      .filter(Boolean)
      .join(', ');

    Alert.alert(
      'Post Shared!',
      `Shared with: ${selectedNames}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );

    console.log('[SharePost] Shared post', postId, 'with users:', selectedUsers);
  }, [selectedUsers, postId, router]);

  return (
    <View style={styles.container}>
      <MistBackground />
      <Stack.Screen
        options={{
          title: 'Share Post',
          headerStyle: { backgroundColor: KORI_COLORS.bg.primary },
          headerTintColor: KORI_COLORS.text.primary,
          headerRight: () => (
            <TouchableOpacity
              style={[styles.sendButton, selectedUsers.length === 0 && styles.sendButtonDisabled]}
              onPress={handleShare}
              disabled={selectedUsers.length === 0}
            >
              <Send size={18} color={selectedUsers.length > 0 ? KORI_COLORS.accent.gold : KORI_COLORS.text.tertiary} />
              <Text style={[styles.sendButtonText, selectedUsers.length === 0 && styles.sendButtonTextDisabled]}>
                Send
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.searchContainer}>
          <Search size={18} color={KORI_COLORS.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor={KORI_COLORS.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {selectedUsers.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedLabel}>
              Sharing with {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}
            </Text>
          </View>
        )}

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {recentChats.length > 0 && !searchQuery && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Chats</Text>
              {recentChats.map(user => user && (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.userCard, selectedUsers.includes(user.id) && styles.userCardSelected]}
                  onPress={() => toggleUser(user.id)}
                >
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userHandle}>@{user.username}</Text>
                  </View>
                  <View style={[styles.checkbox, selectedUsers.includes(user.id) && styles.checkboxSelected]}>
                    {selectedUsers.includes(user.id) && (
                      <MessageCircle size={14} color={KORI_COLORS.text.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'Friends'}
            </Text>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.userCard, selectedUsers.includes(user.id) && styles.userCardSelected]}
                  onPress={() => toggleUser(user.id)}
                >
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userHandle}>@{user.username}</Text>
                  </View>
                  <View style={[styles.checkbox, selectedUsers.includes(user.id) && styles.checkboxSelected]}>
                    {selectedUsers.includes(user.id) && (
                      <MessageCircle size={14} color={KORI_COLORS.text.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No users found' : 'No friends to share with'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KORI_COLORS.bg.primary,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.accent.gold,
  },
  sendButtonTextDisabled: {
    color: KORI_COLORS.text.tertiary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: KORI_COLORS.text.primary,
  },
  selectedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  selectedLabel: {
    fontSize: 13,
    color: KORI_COLORS.accent.gold,
    fontWeight: '500' as const,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    padding: 12,
    marginBottom: 8,
  },
  userCardSelected: {
    borderColor: KORI_COLORS.accent.gold,
    backgroundColor: KORI_COLORS.glow.moon,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  userHandle: {
    fontSize: 13,
    color: KORI_COLORS.text.tertiary,
    marginTop: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: KORI_COLORS.bg.elevated,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: KORI_COLORS.accent.primary,
    borderColor: KORI_COLORS.accent.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: KORI_COLORS.text.tertiary,
  },
  bottomPadding: {
    height: 40,
  },
});
