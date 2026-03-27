import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
} from 'lucide-react-native';
import KORI_COLORS from '@/constants/colors';
import { getSocialUserById } from '@/mocks/socialUsers';
import { POSTS, COMMENTS } from '@/mocks/socialData';
import { Comment } from '@/types/social';
import { formatTimeAgo } from '@/services/SocialService';
import { MistBackground } from '@/components/lunar';
import PlanetHeader from '@/components/PlanetHeader';

const CURRENT_USER_ID = 'user_001';

export default function PostDetailScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  const post = useMemo(() => POSTS.find(p => p.id === postId), [postId]);
  const author = useMemo(() => post ? getSocialUserById(post.authorId) : null, [post]);
  const currentUser = useMemo(() => getSocialUserById(CURRENT_USER_ID), []);

  const allComments = useMemo(() => {
    const existingComments = COMMENTS.filter(c => c.postId === postId);
    return [...existingComments, ...localComments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [postId, localComments]);

  const handleAddComment = useCallback(() => {
    if (!commentText.trim() || !postId) return;

    const newComment: Comment = {
      id: `comment_local_${Date.now()}`,
      postId,
      authorId: CURRENT_USER_ID,
      content: commentText.trim(),
      createdAt: new Date(),
    };

    setLocalComments(prev => [...prev, newComment]);
    setCommentText('');
    console.log('[PostDetail] Added comment:', newComment.id);
  }, [commentText, postId]);

  const handleShare = useCallback(() => {
    router.push(`/share-post?postId=${postId}` as any);
  }, [router, postId]);

  if (!post || !author) {
    return (
      <View style={styles.container}>
        <PlanetHeader title="Post" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </View>
    );
  }

  const likeCount = post.likeUserIds.length + (isLiked ? 1 : 0);

  return (
    <View style={styles.container}>
      <MistBackground />
      <PlanetHeader title="Post" />
      <View style={styles.contentArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={100}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.postContainer}>
              <TouchableOpacity
                style={styles.postHeader}
                onPress={() => router.push(`/person/${author.id}` as any)}
              >
                <Image source={{ uri: author.avatarUrl }} style={styles.avatar} />
                <View style={styles.headerInfo}>
                  <Text style={styles.authorName}>{author.name}</Text>
                  <Text style={styles.postTime}>{formatTimeAgo(new Date(post.createdAt))}</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.postContent}>{post.content}</Text>

              {post.mediaUrls.length > 0 && (
                <TouchableOpacity
                  style={styles.mediaContainer}
                  onPress={() => router.push(`/fullscreen-viewer?images=${encodeURIComponent(JSON.stringify(post.mediaUrls))}&index=0` as any)}
                >
                  <Image
                    source={{ uri: post.mediaUrls[0] }}
                    style={styles.postMedia}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}

              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setIsLiked(!isLiked)}
                >
                  <Heart
                    size={20}
                    color={isLiked ? KORI_COLORS.accent.primary : KORI_COLORS.text.tertiary}
                    fill={isLiked ? KORI_COLORS.accent.primary : 'transparent'}
                  />
                  <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                    {likeCount > 0 ? likeCount : 'Like'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.actionBtn}>
                  <MessageCircle size={20} color={KORI_COLORS.accent.gold} />
                  <Text style={[styles.actionText, styles.actionTextActive]}>
                    {allComments.length > 0 ? allComments.length : 'Comment'}
                  </Text>
                </View>

                <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                  <Share2 size={20} color={KORI_COLORS.text.tertiary} />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>
                Comments ({allComments.length})
              </Text>

              {allComments.length > 0 ? (
                allComments.map(comment => {
                  const commentAuthor = getSocialUserById(comment.authorId);
                  return (
                    <View key={comment.id} style={styles.commentCard}>
                      <Image
                        source={{ uri: commentAuthor?.avatarUrl }}
                        style={styles.commentAvatar}
                      />
                      <View style={styles.commentContent}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentAuthor}>{commentAuthor?.name}</Text>
                          <Text style={styles.commentTime}>
                            {formatTimeAgo(new Date(comment.createdAt))}
                          </Text>
                        </View>
                        <Text style={styles.commentText}>{comment.content}</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyComments}>
                  <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
                </View>
              )}
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>

          <View style={styles.commentInputContainer}>
            <Image source={{ uri: currentUser?.avatarUrl }} style={styles.inputAvatar} />
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={KORI_COLORS.text.tertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
              onPress={handleAddComment}
              disabled={!commentText.trim()}
            >
              <Send
                size={18}
                color={commentText.trim() ? KORI_COLORS.accent.gold : KORI_COLORS.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: KORI_COLORS.text.tertiary,
  },
  postContainer: {
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    margin: 16,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  postTime: {
    fontSize: 13,
    color: KORI_COLORS.text.tertiary,
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: KORI_COLORS.text.primary,
    lineHeight: 24,
    marginBottom: 16,
  },
  mediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  postMedia: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: KORI_COLORS.bg.elevated,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: KORI_COLORS.glass.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: KORI_COLORS.text.tertiary,
  },
  actionTextActive: {
    color: KORI_COLORS.accent.gold,
  },
  commentsSection: {
    paddingHorizontal: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    marginBottom: 16,
  },
  commentCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  commentTime: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
  },
  commentText: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
    lineHeight: 20,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: KORI_COLORS.text.tertiary,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: KORI_COLORS.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: KORI_COLORS.glass.border,
    gap: 12,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentInput: {
    flex: 1,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: KORI_COLORS.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  bottomPadding: {
    height: 20,
  },
});
