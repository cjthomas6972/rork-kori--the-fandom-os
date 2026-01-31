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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Send,
  ImageIcon,
  Sparkles,
} from 'lucide-react-native';
import { useUniverse } from '@/contexts/UniverseContext';
import UniverseSwitcher from '@/components/UniverseSwitcher';
import { MistBackground, GlassChip } from '@/components/lunar';
import { 
  getUniverseFeed, 
  formatTimeAgo,
  SOCIAL_USERS,
} from '@/services/SocialService';
import KORI_COLORS from '@/constants/colors';

export default function FeedScreen() {
  const router = useRouter();
  const { selectedUniverseId, selectedUniverse } = useUniverse();
  const [postContent, setPostContent] = useState('');

  const posts = useMemo(() => {
    if (!selectedUniverseId) return [];
    return getUniverseFeed(selectedUniverseId);
  }, [selectedUniverseId]);

  const handlePost = () => {
    if (!postContent.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPostContent('');
  };

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="low" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Universe Feed</Text>
          <UniverseSwitcher compact />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedUniverse ? (
            <>
              <View style={styles.composer}>
                <View style={styles.composerHeader}>
                  <View style={styles.composerAvatar}>
                    <Text style={styles.composerAvatarText}>A</Text>
                  </View>
                  <TextInput
                    style={styles.composerInput}
                    placeholder={`Share in ${selectedUniverse.name}...`}
                    placeholderTextColor={KORI_COLORS.text.tertiary}
                    value={postContent}
                    onChangeText={setPostContent}
                    multiline
                    maxLength={500}
                  />
                </View>
                <View style={styles.composerFooter}>
                  <Pressable style={styles.composerAction}>
                    <ImageIcon size={20} color={KORI_COLORS.text.secondary} />
                  </Pressable>
                  <Pressable 
                    style={[
                      styles.postButton,
                      !postContent.trim() && styles.postButtonDisabled,
                    ]}
                    onPress={handlePost}
                    disabled={!postContent.trim()}
                  >
                    <Send size={16} color={KORI_COLORS.text.primary} />
                    <Text style={styles.postButtonText}>Post</Text>
                  </Pressable>
                </View>
              </View>

              {posts.length > 0 ? (
                posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onUserPress={() => router.push(`/person/${post.authorId}` as any)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Sparkles size={48} color={KORI_COLORS.text.tertiary} />
                  <Text style={styles.emptyTitle}>No posts yet</Text>
                  <Text style={styles.emptyText}>Be the first to post in {selectedUniverse.name}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noUniverseState}>
              <Sparkles size={48} color={KORI_COLORS.accent.gold} />
              <Text style={styles.noUniverseTitle}>Select a Universe</Text>
              <Text style={styles.noUniverseText}>
                Choose a universe to see the feed
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function PostCard({ post, onUserPress }: { post: any; onUserPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [liked, setLiked] = useState(false);
  
  const author = SOCIAL_USERS.find(u => u.id === post.authorId);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(!liked);
  };

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.99, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[styles.postCard, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.postContent}
      >
        <View style={styles.postHeader}>
          <Pressable onPress={onUserPress} style={styles.postAuthor}>
            <View style={styles.postAvatar}>
              <Text style={styles.postAvatarText}>{author?.name[0] || 'U'}</Text>
            </View>
            <View style={styles.postAuthorInfo}>
              <Text style={styles.postAuthorName}>{author?.name || 'Unknown'}</Text>
              <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
            </View>
          </Pressable>
          <Pressable style={styles.postMore}>
            <MoreHorizontal size={18} color={KORI_COLORS.text.tertiary} />
          </Pressable>
        </View>

        <Text style={styles.postText}>{post.content}</Text>

        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <Image 
            source={{ uri: post.mediaUrls[0] }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        {post.tags && post.tags.length > 0 && (
          <View style={styles.postTags}>
            {post.tags.slice(0, 3).map((tag: string) => (
              <GlassChip key={tag} label={tag} size="small" />
            ))}
          </View>
        )}

        <View style={styles.postActions}>
          <Pressable 
            style={styles.postAction}
            onPress={handleLike}
          >
            <Heart 
              size={18} 
              color={liked ? KORI_COLORS.accent.primary : KORI_COLORS.text.secondary}
              fill={liked ? KORI_COLORS.accent.primary : 'transparent'}
            />
            <Text style={[
              styles.postActionText,
              liked && { color: KORI_COLORS.accent.primary }
            ]}>
              {post.likeUserIds.length + (liked ? 1 : 0)}
            </Text>
          </Pressable>
          <Pressable style={styles.postAction}>
            <MessageCircle size={18} color={KORI_COLORS.text.secondary} />
            <Text style={styles.postActionText}>{post.commentIds.length}</Text>
          </Pressable>
          <Pressable style={styles.postAction}>
            <Share2 size={18} color={KORI_COLORS.text.secondary} />
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
  content: {
    flex: 1,
  },
  composer: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  composerHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  composerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: KORI_COLORS.accent.gold + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerAvatarText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: KORI_COLORS.accent.gold,
  },
  composerInput: {
    flex: 1,
    fontSize: 14,
    color: KORI_COLORS.text.primary,
    minHeight: 40,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  composerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: KORI_COLORS.glass.border,
  },
  composerAction: {
    padding: 8,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: KORI_COLORS.accent.primary,
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  postCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    overflow: 'hidden',
  },
  postContent: {
    padding: 14,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: KORI_COLORS.accent.secondary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: KORI_COLORS.accent.secondary,
  },
  postAuthorInfo: {
    gap: 2,
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  postTime: {
    fontSize: 12,
    color: KORI_COLORS.text.tertiary,
  },
  postMore: {
    padding: 4,
  },
  postText: {
    fontSize: 14,
    color: KORI_COLORS.text.primary,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: KORI_COLORS.bg.elevated,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: KORI_COLORS.glass.border,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
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
});
