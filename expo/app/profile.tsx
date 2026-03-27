import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRef, useCallback, useState, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  Animated, 
  Image,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { 
  ArrowLeft, 
  MapPin, 
  Edit3, 
  Sparkles,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Info,
  FileText,
  X,
  UserPlus,
  Check,
  Clock,
  MoreHorizontal,
  Send,
  Share2,
  Flag,
  UserX,
  ChevronDown,
} from 'lucide-react-native';
import { useIdentity } from '@/contexts/IdentityContext';
import { useUniverse } from '@/contexts/UniverseContext';
import { UNIVERSES } from '@/constants/universes';
import { ARCHETYPES, INTENTS } from '@/constants/archetypes';
import { MistBackground, GlassChip, SakuraPetals, ResonanceMeter } from '@/components/lunar';
import { getResonanceColor } from '@/components/lunar/ResonanceMeter';
import { getSocialUserById, getUserUniverseProfile } from '@/mocks/socialUsers';
import { POSTS, COMMENTS } from '@/mocks/socialData';
import { calculateAlignment, formatTimeAgo, getAlignmentLabel } from '@/services/SocialService';
import { Post } from '@/types/social';
import KORI_COLORS from '@/constants/colors';

const { width } = Dimensions.get('window');
type ProfileTab = 'posts' | 'gallery' | 'about';
type FriendStatus = 'none' | 'pending' | 'friends' | 'received';

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
  'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800',
];

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const { identity } = useIdentity();
  const { selectedUniverseId, selectUniverse } = useUniverse();
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [isPostingStatus, setIsPostingStatus] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  const viewingUserId = params.userId;
  const isSelf = !viewingUserId || viewingUserId === identity?.id;

  const socialUser = useMemo(() => {
    if (isSelf) return null;
    return viewingUserId ? getSocialUserById(viewingUserId) : null;
  }, [viewingUserId, isSelf]);

  const universeProfile = useMemo(() => {
    if (!selectedUniverseId) return null;
    if (isSelf) return null;
    return viewingUserId ? getUserUniverseProfile(viewingUserId, selectedUniverseId) : null;
  }, [viewingUserId, selectedUniverseId, isSelf]);

  const alignment = useMemo(() => {
    if (isSelf || !socialUser || !selectedUniverseId) return null;
    
    const currentUserProfile = identity?.universes.includes(selectedUniverseId) ? {
      id: 'current',
      userId: identity.id,
      universeId: selectedUniverseId,
      identityTitle: '',
      fandomTags: Object.values(identity.canonAnchors).flat(),
      interests: [],
      values: [],
      vibeTags: identity.archetypes,
      lookingFor: identity.intents,
      dealbreakers: [],
      visibility: { publicInUniverse: true, showInAligned: true, showInDiscover: true },
      media: { galleryUrls: [] },
      lastActiveAt: new Date(),
    } : null;

    if (!currentUserProfile || !universeProfile) return null;
    
    return calculateAlignment(
      currentUserProfile,
      universeProfile,
      identity?.location ? { lat: 0, lng: 0 } : undefined,
      socialUser.location
    );
  }, [isSelf, socialUser, universeProfile, identity, selectedUniverseId]);

  const userUniversesList = useMemo(() => {
    if (isSelf && identity) {
      return UNIVERSES.filter(u => identity.universes.includes(u.id));
    }
    if (socialUser) {
      return UNIVERSES.filter(u => socialUser.activeUniverseIds.includes(u.id));
    }
    return [];
  }, [isSelf, identity, socialUser]);

  const userPosts = useMemo(() => {
    if (!selectedUniverseId) return [];
    const userId = isSelf ? identity?.id : viewingUserId;
    if (!userId) return [];
    return POSTS.filter(p => 
      p.authorId === userId && 
      p.universeId === selectedUniverseId &&
      p.scope === 'universe'
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [isSelf, identity?.id, viewingUserId, selectedUniverseId]);

  const galleryImages = useMemo(() => {
    if (isSelf) {
      return [
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
        'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400',
        'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400',
        'https://images.unsplash.com/photo-1569466896818-335b1bedfcce?w=400',
      ];
    }
    return universeProfile?.media.galleryUrls || [];
  }, [isSelf, universeProfile?.media.galleryUrls]);

  const displayName = isSelf ? identity?.displayName : socialUser?.name;
  const username = isSelf ? identity?.username : socialUser?.username;
  const bio = isSelf ? identity?.bio : socialUser?.bio;
  const location = isSelf ? identity?.location : socialUser?.location;
  const identityTitle = universeProfile?.identityTitle || '';
  const coverImage = COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];
  const avatarUrl = socialUser?.avatarUrl;

  const handleUniverseSwitch = useCallback((universeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    selectUniverse(universeId);
  }, [selectUniverse]);

  const handleFriendAction = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (friendStatus === 'none') {
      setFriendStatus('pending');
      console.log('[Profile] Friend request sent');
    } else if (friendStatus === 'received') {
      setFriendStatus('friends');
      console.log('[Profile] Friend request accepted');
    }
  }, [friendStatus]);

  const handleDM = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('[Profile] Opening DM');
    router.push('/(tabs)/inbox');
  }, [router]);

  const handlePostStatus = useCallback(async () => {
    if (!statusText.trim()) return;
    
    setIsPostingStatus(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('[Profile] Posted status:', statusText);
    setStatusText('');
    setIsPostingStatus(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [statusText]);

  const handleLikePost = useCallback((postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const handleToggleComments = useCallback((postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const handleAddComment = useCallback((postId: string) => {
    const text = newComment[postId]?.trim();
    if (!text) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('[Profile] Added comment to post:', postId, text);
    setNewComment(prev => ({ ...prev, [postId]: '' }));
  }, [newComment]);

  if (!identity && isSelf) {
    return (
      <View style={styles.container}>
        <MistBackground showMoonGlow intensity="low" />
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={KORI_COLORS.accent.gold} />
        </SafeAreaView>
      </View>
    );
  }

  if (!isSelf && !socialUser) {
    return (
      <View style={styles.container}>
        <MistBackground showMoonGlow intensity="low" />
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <Pressable style={styles.errorButton} onPress={() => router.back()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="medium" />
      {isSelf && <SakuraPetals count={3} enabled duration={12000} />}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.coverContainer}>
          <Image source={{ uri: coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', KORI_COLORS.bg.primary]}
            style={styles.coverGradient}
          />
          
          <SafeAreaView style={styles.headerOverlay} edges={['top']}>
            <HeaderButton icon={ArrowLeft} onPress={() => router.back()} />
            {isSelf ? (
              <HeaderButton 
                icon={Edit3} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/edit-profile');
                }} 
                accent 
              />
            ) : (
              <HeaderButton 
                icon={MoreHorizontal} 
                onPress={() => setShowMoreMenu(true)} 
              />
            )}
          </SafeAreaView>
        </View>

        <View style={styles.profileContent}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow} />
              <View style={styles.avatarRing} />
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{displayName?.[0] || '?'}</Text>
                </View>
              )}
            </View>
          </View>
          
          <Text style={styles.displayName}>{displayName}</Text>
          {identityTitle && !isSelf && (
            <Text style={styles.identityTitle}>{identityTitle}</Text>
          )}
          <Text style={styles.username}>@{username}</Text>
          
          {bio && <Text style={styles.bio}>{bio}</Text>}

          {location && (
            <View style={styles.locationBadge}>
              <MapPin size={12} color={KORI_COLORS.text.secondary} />
              <Text style={styles.locationText}>
                {location.city}, {location.country}
              </Text>
            </View>
          )}

          <View style={styles.identityCapsules}>
            <IdentityCapsule
              title="Vibe"
              items={isSelf 
                ? ARCHETYPES.filter(a => identity?.archetypes.includes(a.id)).slice(0, 3).map(a => a.name)
                : (universeProfile?.vibeTags || []).slice(0, 3)
              }
              color={KORI_COLORS.accent.secondary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
            <IdentityCapsule
              title="Fandom"
              items={isSelf 
                ? Object.values(identity?.canonAnchors || {}).flat().slice(0, 3)
                : (universeProfile?.fandomTags || []).slice(0, 3)
              }
              color={KORI_COLORS.accent.gold}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
            <IdentityCapsule
              title="Looking For"
              items={isSelf 
                ? INTENTS.filter(i => identity?.intents.includes(i.id)).slice(0, 3).map(i => i.label)
                : (universeProfile?.lookingFor || []).slice(0, 3)
              }
              color={KORI_COLORS.accent.primary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
          </View>

          {!isSelf && alignment && (
            <View style={styles.resonanceCard}>
              <LinearGradient
                colors={[getResonanceColor(alignment.score) + '12', 'transparent']}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.resonanceHeader}>
                <ResonanceMeter score={alignment.score} size={80} />
                <View style={styles.resonanceInfo}>
                  <Text style={styles.resonanceScore}>{alignment.score}%</Text>
                  <Text style={styles.resonanceLabel}>{getAlignmentLabel(alignment.score)}</Text>
                  <View style={styles.resonanceReasons}>
                    {alignment.reasons.slice(0, 2).map((reason, idx) => (
                      <Text key={idx} style={styles.resonanceReason}>• {reason}</Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}

          {!isSelf && (
            <View style={styles.actionButtons}>
              <Pressable 
                style={[
                  styles.friendButton,
                  friendStatus === 'friends' && styles.friendButtonActive,
                  friendStatus === 'pending' && styles.friendButtonPending,
                ]}
                onPress={handleFriendAction}
              >
                {friendStatus === 'none' && (
                  <>
                    <UserPlus size={18} color={KORI_COLORS.text.primary} />
                    <Text style={styles.friendButtonText}>Add Friend</Text>
                  </>
                )}
                {friendStatus === 'pending' && (
                  <>
                    <Clock size={18} color={KORI_COLORS.accent.gold} />
                    <Text style={[styles.friendButtonText, { color: KORI_COLORS.accent.gold }]}>Pending</Text>
                  </>
                )}
                {friendStatus === 'received' && (
                  <>
                    <Check size={18} color={KORI_COLORS.status.success} />
                    <Text style={[styles.friendButtonText, { color: KORI_COLORS.status.success }]}>Accept</Text>
                  </>
                )}
                {friendStatus === 'friends' && (
                  <>
                    <Check size={18} color={KORI_COLORS.text.primary} />
                    <Text style={styles.friendButtonText}>Friends</Text>
                  </>
                )}
              </Pressable>
              
              <Pressable style={styles.dmButton} onPress={handleDM}>
                <MessageCircle size={18} color={KORI_COLORS.accent.gold} />
                <Text style={styles.dmButtonText}>Message</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={16} color={KORI_COLORS.accent.gold} />
              <Text style={styles.sectionTitle}>Universe Passport</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.passportList}
            >
              {userUniversesList.map(universe => (
                <Pressable
                  key={universe.id}
                  onPress={() => handleUniverseSwitch(universe.id)}
                  style={[
                    styles.passportChip,
                    selectedUniverseId === universe.id && styles.passportChipActive,
                    { borderColor: universe.color + '40' }
                  ]}
                >
                  <Text style={styles.passportEmoji}>{universe.icon}</Text>
                  <Text style={[
                    styles.passportName,
                    selectedUniverseId === universe.id && { color: universe.color }
                  ]}>
                    {universe.name}
                  </Text>
                  {selectedUniverseId === universe.id && (
                    <View style={[styles.passportIndicator, { backgroundColor: universe.color }]} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.tabContainer}>
            <ProfileTabButton
              label="Posts"
              icon={FileText}
              active={activeTab === 'posts'}
              onPress={() => setActiveTab('posts')}
            />
            <ProfileTabButton
              label="Gallery"
              icon={ImageIcon}
              active={activeTab === 'gallery'}
              onPress={() => setActiveTab('gallery')}
            />
            <ProfileTabButton
              label="About"
              icon={Info}
              active={activeTab === 'about'}
              onPress={() => setActiveTab('about')}
            />
          </View>

          {activeTab === 'posts' && (
            <View style={styles.tabContent}>
              {isSelf && (
                <View style={styles.statusInputContainer}>
                  <TextInput
                    style={styles.statusInput}
                    placeholder="What's on your mind?"
                    placeholderTextColor={KORI_COLORS.text.tertiary}
                    value={statusText}
                    onChangeText={setStatusText}
                    multiline
                    maxLength={280}
                  />
                  <Pressable 
                    style={[
                      styles.statusButton,
                      !statusText.trim() && styles.statusButtonDisabled
                    ]}
                    onPress={handlePostStatus}
                    disabled={!statusText.trim() || isPostingStatus}
                  >
                    {isPostingStatus ? (
                      <ActivityIndicator size="small" color={KORI_COLORS.bg.primary} />
                    ) : (
                      <Send size={18} color={KORI_COLORS.bg.primary} />
                    )}
                  </Pressable>
                </View>
              )}
              
              {userPosts.length === 0 ? (
                <View style={styles.emptyState}>
                  <FileText size={32} color={KORI_COLORS.text.tertiary} />
                  <Text style={styles.emptyText}>No posts yet</Text>
                </View>
              ) : (
                userPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    isLiked={likedPosts.has(post.id)}
                    onLike={() => handleLikePost(post.id)}
                    showComments={expandedComments.has(post.id)}
                    onToggleComments={() => handleToggleComments(post.id)}
                    commentText={newComment[post.id] || ''}
                    onCommentChange={(text) => setNewComment(prev => ({ ...prev, [post.id]: text }))}
                    onSubmitComment={() => handleAddComment(post.id)}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'gallery' && (
            <View style={styles.galleryGrid}>
              {galleryImages.length === 0 ? (
                <View style={styles.emptyGallery}>
                  <ImageIcon size={32} color={KORI_COLORS.text.tertiary} />
                  <Text style={styles.emptyText}>No photos yet</Text>
                </View>
              ) : (
                galleryImages.map((url, index) => (
                  <Pressable
                    key={index}
                    style={styles.galleryItem}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedImage(url);
                    }}
                  >
                    <Image source={{ uri: url }} style={styles.galleryImage} />
                  </Pressable>
                ))
              )}
            </View>
          )}

          {activeTab === 'about' && (
            <View style={styles.tabContent}>
              <View style={styles.aboutCard}>
                <Text style={styles.aboutLabel}>Bio</Text>
                <Text style={styles.aboutText}>{bio || 'No bio yet'}</Text>
              </View>

              <View style={styles.aboutCard}>
                <Text style={styles.aboutLabel}>Interests</Text>
                <View style={styles.chipList}>
                  {(isSelf 
                    ? Object.values(identity?.canonAnchors || {}).flat()
                    : universeProfile?.interests || []
                  ).map((item, idx) => (
                    <GlassChip key={idx} label={item} size="small" />
                  ))}
                </View>
              </View>

              <View style={styles.aboutCard}>
                <Text style={styles.aboutLabel}>Values</Text>
                <View style={styles.chipList}>
                  {(universeProfile?.values || ['creativity', 'community', 'passion']).map((item, idx) => (
                    <GlassChip key={idx} label={item} size="small" color={KORI_COLORS.accent.gold} />
                  ))}
                </View>
              </View>

              {isSelf && (
                <View style={styles.aboutCard}>
                  <Text style={styles.aboutLabel}>Safety Settings</Text>
                  <View style={styles.safetyBadge}>
                    <Text style={styles.safetyText}>DMs: Aligned Only</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.imageViewerOverlay}>
          <Pressable 
            style={styles.imageViewerClose}
            onPress={() => setSelectedImage(null)}
          >
            <X size={24} color={KORI_COLORS.text.primary} />
          </Pressable>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.imageViewerImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <Modal
        visible={showMoreMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setShowMoreMenu(false)}>
          <View style={styles.menuContent}>
            <Pressable style={styles.menuItem} onPress={() => {
              setShowMoreMenu(false);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}>
              <Share2 size={20} color={KORI_COLORS.text.primary} />
              <Text style={styles.menuItemText}>Share Profile</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => {
              setShowMoreMenu(false);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}>
              <Flag size={20} color={KORI_COLORS.accent.primary} />
              <Text style={[styles.menuItemText, { color: KORI_COLORS.accent.primary }]}>Report</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => {
              setShowMoreMenu(false);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}>
              <UserX size={20} color={KORI_COLORS.accent.primary} />
              <Text style={[styles.menuItemText, { color: KORI_COLORS.accent.primary }]}>Block</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function HeaderButton({ 
  icon: Icon, 
  onPress, 
  accent = false 
}: { 
  icon: any; 
  onPress: () => void; 
  accent?: boolean;
}) {
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
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.headerButton, accent && styles.headerButtonAccent]}
      >
        <Icon 
          size={accent ? 18 : 22} 
          color={accent ? KORI_COLORS.accent.gold : KORI_COLORS.text.primary} 
        />
      </Pressable>
    </Animated.View>
  );
}

function IdentityCapsule({ 
  title, 
  items, 
  color,
  onPress,
}: { 
  title: string; 
  items: string[]; 
  color: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={[styles.capsule, { borderColor: color + '30' }]} onPress={onPress}>
      <Text style={[styles.capsuleTitle, { color }]}>{title}</Text>
      <View style={styles.capsuleItems}>
        {items.length > 0 ? items.map((item, index) => (
          <Text key={index} style={styles.capsuleItem}>
            {item}{index < items.length - 1 ? ' • ' : ''}
          </Text>
        )) : (
          <Text style={styles.capsuleItemEmpty}>Not set</Text>
        )}
      </View>
      <ChevronDown size={12} color={KORI_COLORS.text.tertiary} style={styles.capsuleChevron} />
    </Pressable>
  );
}

function ProfileTabButton({ 
  label, 
  icon: Icon, 
  active, 
  onPress 
}: { 
  label: string; 
  icon: any; 
  active: boolean; 
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Icon 
        size={18} 
        color={active ? KORI_COLORS.accent.gold : KORI_COLORS.text.tertiary} 
      />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {active && <View style={styles.tabIndicator} />}
    </Pressable>
  );
}

function PostCard({ 
  post,
  isLiked,
  onLike,
  showComments,
  onToggleComments,
  commentText,
  onCommentChange,
  onSubmitComment,
}: { 
  post: Post;
  isLiked: boolean;
  onLike: () => void;
  showComments: boolean;
  onToggleComments: () => void;
  commentText: string;
  onCommentChange: (text: string) => void;
  onSubmitComment: () => void;
}) {
  const comments = COMMENTS.filter(c => c.postId === post.id);
  const likeCount = post.likeUserIds.length + (isLiked ? 1 : 0);

  return (
    <View style={styles.postCard}>
      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.mediaUrls.length > 0 && (
        <View style={styles.postMediaContainer}>
          <Image 
            source={{ uri: post.mediaUrls[0] }} 
            style={styles.postMedia}
            resizeMode="cover"
          />
        </View>
      )}
      
      <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
      
      <View style={styles.postActions}>
        <Pressable style={styles.postAction} onPress={onLike}>
          <Heart 
            size={18} 
            color={isLiked ? KORI_COLORS.accent.primary : KORI_COLORS.text.secondary}
            fill={isLiked ? KORI_COLORS.accent.primary : 'transparent'}
          />
          <Text style={[
            styles.postActionText,
            isLiked && { color: KORI_COLORS.accent.primary }
          ]}>
            {likeCount}
          </Text>
        </Pressable>
        
        <Pressable style={styles.postAction} onPress={onToggleComments}>
          <MessageCircle size={18} color={KORI_COLORS.text.secondary} />
          <Text style={styles.postActionText}>{comments.length}</Text>
        </Pressable>
        
        <Pressable style={styles.postAction}>
          <Share2 size={18} color={KORI_COLORS.text.secondary} />
        </Pressable>
      </View>

      {showComments && (
        <View style={styles.commentsSection}>
          {comments.map(comment => {
            const author = getSocialUserById(comment.authorId);
            return (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>{author?.name[0] || '?'}</Text>
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>{author?.name || 'Unknown'}</Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            );
          })}
          
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={KORI_COLORS.text.tertiary}
              value={commentText}
              onChangeText={onCommentChange}
            />
            <Pressable 
              style={styles.commentSendButton}
              onPress={onSubmitComment}
              disabled={!commentText.trim()}
            >
              <Send size={16} color={commentText.trim() ? KORI_COLORS.accent.gold : KORI_COLORS.text.tertiary} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KORI_COLORS.bg.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: KORI_COLORS.text.secondary,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: KORI_COLORS.accent.primary,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: KORI_COLORS.glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  headerButtonAccent: {
    borderColor: KORI_COLORS.lunar.moonGold + '30',
  },
  profileContent: {
    paddingHorizontal: 20,
    marginTop: -50,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: KORI_COLORS.lunar.moonGold,
    opacity: 0.15,
  },
  avatarRing: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: KORI_COLORS.lunar.moonGold + '60',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: KORI_COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarText: {
    fontSize: 38,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  displayName: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    textAlign: 'center',
  },
  identityTitle: {
    fontSize: 14,
    color: KORI_COLORS.accent.gold,
    textAlign: 'center',
    marginTop: 2,
  },
  username: {
    fontSize: 15,
    color: KORI_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 12,
    marginTop: 10,
  },
  locationText: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
  identityCapsules: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  capsule: {
    flex: 1,
    padding: 12,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 12,
    borderWidth: 1,
  },
  capsuleTitle: {
    fontSize: 10,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  capsuleItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  capsuleItem: {
    fontSize: 11,
    color: KORI_COLORS.text.secondary,
    lineHeight: 16,
  },
  capsuleItemEmpty: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
    fontStyle: 'italic',
  },
  capsuleChevron: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  resonanceCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  resonanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resonanceInfo: {
    flex: 1,
  },
  resonanceScore: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  resonanceLabel: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
    marginTop: 2,
  },
  resonanceReasons: {
    marginTop: 8,
    gap: 4,
  },
  resonanceReason: {
    fontSize: 12,
    color: KORI_COLORS.text.tertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  friendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: KORI_COLORS.accent.primary,
    borderRadius: 14,
  },
  friendButtonActive: {
    backgroundColor: KORI_COLORS.bg.elevated,
    borderWidth: 1,
    borderColor: KORI_COLORS.status.success + '50',
  },
  friendButtonPending: {
    backgroundColor: KORI_COLORS.bg.elevated,
    borderWidth: 1,
    borderColor: KORI_COLORS.accent.gold + '50',
  },
  friendButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  dmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: KORI_COLORS.accent.gold + '40',
  },
  dmButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: KORI_COLORS.accent.gold,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  passportList: {
    gap: 10,
  },
  passportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  passportChipActive: {
    backgroundColor: KORI_COLORS.bg.elevated,
  },
  passportEmoji: {
    fontSize: 18,
  },
  passportName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  passportIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: KORI_COLORS.bg.elevated,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.tertiary,
  },
  tabLabelActive: {
    color: KORI_COLORS.accent.gold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 2,
    left: '30%',
    right: '30%',
    height: 2,
    backgroundColor: KORI_COLORS.accent.gold,
    borderRadius: 1,
  },
  tabContent: {
    gap: 12,
  },
  statusInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 14,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  statusInput: {
    flex: 1,
    fontSize: 14,
    color: KORI_COLORS.text.primary,
    maxHeight: 80,
    paddingVertical: 0,
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: KORI_COLORS.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonDisabled: {
    backgroundColor: KORI_COLORS.bg.elevated,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: KORI_COLORS.text.tertiary,
  },
  postCard: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  postContent: {
    fontSize: 14,
    color: KORI_COLORS.text.primary,
    lineHeight: 20,
  },
  postMediaContainer: {
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  postMedia: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: KORI_COLORS.bg.elevated,
  },
  postTime: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
    marginTop: 10,
  },
  postActions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    marginTop: 12,
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
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: KORI_COLORS.glass.border,
    gap: 10,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: KORI_COLORS.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.secondary,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  commentText: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  commentInput: {
    flex: 1,
    height: 36,
    backgroundColor: KORI_COLORS.bg.elevated,
    borderRadius: 18,
    paddingHorizontal: 14,
    fontSize: 13,
    color: KORI_COLORS.text.primary,
  },
  commentSendButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryItem: {
    width: (width - 48) / 2,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: KORI_COLORS.bg.card,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  emptyGallery: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  aboutCard: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  aboutLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aboutText: {
    fontSize: 14,
    color: KORI_COLORS.text.primary,
    lineHeight: 20,
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  safetyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: KORI_COLORS.bg.elevated,
    borderRadius: 8,
  },
  safetyText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: KORI_COLORS.accent.gold,
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: KORI_COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: KORI_COLORS.glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  imageViewerImage: {
    width: width - 40,
    height: width - 40,
    borderRadius: 12,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: KORI_COLORS.overlay,
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: KORI_COLORS.bg.elevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 16,
    color: KORI_COLORS.text.primary,
  },
  bottomSpacer: {
    height: 40,
  },
});
