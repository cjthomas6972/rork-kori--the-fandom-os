import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import {
  Settings,
  Edit3,
  Image as ImageIcon,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Users,
  ChevronRight,
  Globe,
  Link,
  Shield,
  ChevronDown,
  Radio,
  Zap,
  Wifi,
  Target,
  Lock,
} from 'lucide-react-native';
import KORI_COLORS from '@/constants/colors';
import { useUniverse } from '@/contexts/UniverseContext';
import { getSocialUserById, getUserUniverseProfile } from '@/mocks/socialUsers';
import { POSTS } from '@/mocks/socialData';
import { Post, PostScope } from '@/types/social';
import { formatTimeAgo } from '@/services/SocialService';
import { MistBackground, SakuraPetals } from '@/components/lunar';
import { useEntitlements } from '@/contexts/EntitlementsContext';

const CURRENT_USER_ID = 'user_001';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MyPlanetScreen() {
  const router = useRouter();
  const { selectedUniverseId } = useUniverse();
  const { hasUniversePass, getTodaysPulse, getPulseStreak } = useEntitlements();
  const [refreshing, setRefreshing] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [selectedScope, setSelectedScope] = useState<PostScope>('universe');
  const [showScopeSelector, setShowScopeSelector] = useState(false);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showPetals, setShowPetals] = useState(true);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const haloOpacity = useRef(new Animated.Value(0)).current;
  const moduleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(haloOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(moduleOpacity, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const petalTimer = setTimeout(() => {
      setShowPetals(false);
    }, 2500);

    return () => clearTimeout(petalTimer);
  }, [haloOpacity, moduleOpacity]);

  const todaysPulse = useMemo(() => {
    return selectedUniverseId ? getTodaysPulse(selectedUniverseId) : null;
  }, [selectedUniverseId, getTodaysPulse]);

  const pulseStreak = useMemo(() => {
    return selectedUniverseId ? getPulseStreak(selectedUniverseId) : 0;
  }, [selectedUniverseId, getPulseStreak]);

  const currentUser = useMemo(() => getSocialUserById(CURRENT_USER_ID), []);
  const universeProfile = useMemo(
    () => selectedUniverseId ? getUserUniverseProfile(CURRENT_USER_ID, selectedUniverseId) : null,
    [selectedUniverseId]
  );

  const userPosts = useMemo(() => {
    const allPosts = [...localPosts, ...POSTS];
    return allPosts
      .filter(p => p.authorId === CURRENT_USER_ID && p.universeId === selectedUniverseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [selectedUniverseId, localPosts]);

  const galleryImages = useMemo(() => {
    return universeProfile?.media.galleryUrls.slice(0, 6) || [];
  }, [universeProfile]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setShowPetals(true);
    setTimeout(() => {
      setRefreshing(false);
      setTimeout(() => setShowPetals(false), 2000);
    }, 1000);
  }, []);

  const handleButtonPressIn = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const handleButtonPressOut = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const handlePost = useCallback(() => {
    if (!composerText.trim() || !selectedUniverseId) return;

    const newPost: Post = {
      id: `post_local_${Date.now()}`,
      authorId: CURRENT_USER_ID,
      universeId: selectedUniverseId,
      scope: selectedScope,
      content: composerText.trim(),
      mediaUrls: [],
      tags: [],
      createdAt: new Date(),
      likeUserIds: [],
      commentIds: [],
    };

    setLocalPosts(prev => [newPost, ...prev]);
    setComposerText('');
    console.log('[MyPlanet] Created new post:', newPost.id);
  }, [composerText, selectedUniverseId, selectedScope]);

  const handleLike = useCallback((postId: string) => {
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

  const handleDelete = useCallback((postId: string) => {
    setLocalPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  const handleShareToDM = useCallback((postId: string) => {
    router.push(`/share-post?postId=${postId}` as any);
  }, [router]);

  const getCommentCount = useCallback((commentIds: string[]) => {
    return commentIds.length;
  }, []);

  const getScopeIcon = (scope: PostScope) => {
    switch (scope) {
      case 'universe': return <Globe size={12} color={KORI_COLORS.accent.gold} />;
      case 'friends': return <Link size={12} color={KORI_COLORS.accent.gold} />;
      case 'guild': return <Shield size={12} color={KORI_COLORS.accent.gold} />;
      default: return <Globe size={12} color={KORI_COLORS.accent.gold} />;
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={KORI_COLORS.accent.gold} />
      </View>
    );
  }

  const renderPlanetHalo = () => (
    <Animated.View style={[styles.planetHaloContainer, { opacity: haloOpacity }]}>
      <Svg width={SCREEN_WIDTH} height={300} style={styles.planetHaloSvg}>
        <Defs>
          <RadialGradient id="haloGradient" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={KORI_COLORS.accent.gold} stopOpacity="0.15" />
            <Stop offset="40%" stopColor={KORI_COLORS.accent.gold} stopOpacity="0.08" />
            <Stop offset="70%" stopColor={KORI_COLORS.accent.primary} stopOpacity="0.04" />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={SCREEN_WIDTH / 2} cy={150} r={140} fill="url(#haloGradient)" />
      </Svg>
    </Animated.View>
  );

  const renderWarpSection = () => (
    <Animated.View style={[styles.warpContainer, { opacity: moduleOpacity }]}>
      <TouchableOpacity
        style={styles.warpButton}
        onPress={() => router.push('/warp')}
        activeOpacity={0.8}
        testID="warp-btn"
      >
        <LinearGradient
          colors={[KORI_COLORS.accent.primary, KORI_COLORS.accent.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.warpGradient}
        >
          <View style={styles.warpContent}>
            <Zap size={24} color={KORI_COLORS.text.primary} />
            <View style={styles.warpTextContainer}>
              <Text style={styles.warpTitle}>WARP</Text>
              <Text style={styles.warpSubtitle}>Find someone like you now</Text>
            </View>
            <ChevronRight size={20} color={KORI_COLORS.text.primary} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSignalsSection = () => (
    <Animated.View style={[styles.moduleContainer, { opacity: moduleOpacity }]}>
      <View style={styles.moduleHeader}>
        <View style={styles.moduleTitleRow}>
          <Wifi size={14} color={KORI_COLORS.accent.gold} />
          <Text style={styles.moduleTitle}>Signals</Text>
        </View>
        {!hasUniversePass && (
          <View style={styles.proBadge}>
            <Lock size={10} color={KORI_COLORS.accent.gold} />
            <Text style={styles.proBadgeText}>PASS</Text>
          </View>
        )}
      </View>
      
      <View style={styles.signalsContent}>
        <TouchableOpacity
          style={[styles.signalButton, !hasUniversePass && styles.signalButtonLocked]}
          onPress={() => {
            if (hasUniversePass) {
              router.push('/signal-preview' as any);
            } else {
              router.push('/universe-pass' as any);
            }
          }}
          activeOpacity={0.7}
        >
          <Wifi size={18} color={hasUniversePass ? KORI_COLORS.accent.gold : KORI_COLORS.text.tertiary} />
          <Text style={[styles.signalButtonText, !hasUniversePass && styles.signalButtonTextLocked]}>
            Signal Your Universe
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.signalButton, !hasUniversePass && styles.signalButtonLocked]}
          onPress={() => {
            if (hasUniversePass) {
              router.push('/beacon-composer' as any);
            } else {
              router.push('/universe-pass' as any);
            }
          }}
          activeOpacity={0.7}
        >
          <Target size={18} color={hasUniversePass ? KORI_COLORS.accent.secondary : KORI_COLORS.text.tertiary} />
          <Text style={[styles.signalButtonText, !hasUniversePass && styles.signalButtonTextLocked]}>
            Drop a Beacon
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderDailyPulse = () => (
    <Animated.View style={[styles.pulseContainer, { opacity: moduleOpacity }]}>
      <View style={styles.pulseHeader}>
        <Text style={styles.pulseTitle}>Daily Pulse</Text>
        {pulseStreak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>{pulseStreak} day streak</Text>
          </View>
        )}
      </View>
      {todaysPulse ? (
        <View style={styles.pulseCompleted}>
          <Text style={styles.pulseCompletedText}>
            {todaysPulse.promptType === 'watching' ? '📺' : 
             todaysPulse.promptType === 'playing' ? '🎮' : 
             todaysPulse.promptType === 'reading' ? '📚' : 
             todaysPulse.promptType === 'building' ? '🛠️' : '🎯'} {todaysPulse.response}
          </Text>
        </View>
      ) : (
        <View style={styles.pulsePrompt}>
          <Text style={styles.pulsePromptText}>What are you into today?</Text>
          <View style={styles.pulseOptions}>
            {['📺', '🎮', '📚', '🛠️', '🎯'].map((emoji, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.pulseOption}
                onPress={() => console.log('[MyPlanet] Pulse option:', idx)}
              >
                <Text style={styles.pulseEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {renderPlanetHalo()}
      <Image
        source={{ uri: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800' }}
        style={styles.coverImage}
        blurRadius={3}
      />
      <LinearGradient
        colors={['transparent', 'rgba(7,6,11,0.8)', KORI_COLORS.bg.primary]}
        locations={[0, 0.6, 1]}
        style={styles.coverGradient}
      />
      
      <View style={styles.headerContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarGlow} />
          <Image
            source={{ uri: currentUser.avatarUrl }}
            style={styles.avatar}
          />
          <View style={styles.onlineIndicator} />
        </View>
        
        <Text style={styles.displayName}>{currentUser.name}</Text>
        <Text style={styles.identityTitle}>
          {universeProfile?.identityTitle || 'Set your identity'}
        </Text>
        
        <View style={styles.chipsRow}>
          {universeProfile?.vibeTags.slice(0, 2).map((tag, idx) => (
            <View key={`vibe-${idx}`} style={styles.chip}>
              <Text style={styles.chipText}>{tag}</Text>
            </View>
          ))}
          {universeProfile?.fandomTags.slice(0, 1).map((tag, idx) => (
            <View key={`fandom-${idx}`} style={[styles.chip, styles.chipFandom]}>
              <Text style={styles.chipText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.headerActions}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/edit-planet')}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              testID="edit-planet-btn"
              activeOpacity={0.9}
            >
              <Edit3 size={15} color={KORI_COLORS.text.primary} />
              <Text style={styles.actionButtonText}>Edit Planet</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => router.push('/planet-settings')}
            testID="planet-settings-btn"
            activeOpacity={0.7}
          >
            <Settings size={16} color={KORI_COLORS.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => router.push('/connections')}
            testID="connections-btn"
            activeOpacity={0.7}
          >
            <Users size={16} color={KORI_COLORS.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderComposer = () => (
    <Animated.View style={[styles.moduleContainer, { opacity: moduleOpacity }]}>
      <View style={styles.moduleHeader}>
        <View style={styles.moduleTitleRow}>
          <Radio size={14} color={KORI_COLORS.accent.gold} />
          <Text style={styles.moduleTitle}>Broadcast</Text>
        </View>
        <View style={styles.moduleSigil} />
      </View>
      
      <View style={styles.composerContent}>
        <View style={styles.composerHeaderRow}>
          <TouchableOpacity
            style={styles.scopeSelector}
            onPress={() => setShowScopeSelector(!showScopeSelector)}
          >
            {getScopeIcon(selectedScope)}
            <Text style={styles.scopeText}>
              {selectedScope === 'universe' ? 'Universe' : selectedScope === 'friends' ? 'Friends' : 'Guild'}
            </Text>
            <ChevronDown size={12} color={KORI_COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>
        
        {showScopeSelector && (
          <View style={styles.scopeDropdown}>
            {(['universe', 'friends', 'guild'] as PostScope[]).map(scope => (
              <TouchableOpacity
                key={scope}
                style={[styles.scopeOption, selectedScope === scope && styles.scopeOptionActive]}
                onPress={() => {
                  setSelectedScope(scope);
                  setShowScopeSelector(false);
                }}
              >
                {getScopeIcon(scope)}
                <Text style={[styles.scopeOptionText, selectedScope === scope && styles.scopeOptionTextActive]}>
                  {scope.charAt(0).toUpperCase() + scope.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <TextInput
          style={styles.composerInput}
          placeholder="Broadcast from your planet..."
          placeholderTextColor={KORI_COLORS.text.tertiary}
          value={composerText}
          onChangeText={setComposerText}
          multiline
          maxLength={500}
        />
        
        <View style={styles.composerActions}>
          <TouchableOpacity style={styles.composerActionBtn}>
            <ImageIcon size={18} color={KORI_COLORS.text.tertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.postButton, !composerText.trim() && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={!composerText.trim()}
            activeOpacity={0.8}
          >
            <Send size={14} color={composerText.trim() ? KORI_COLORS.text.primary : KORI_COLORS.text.tertiary} />
            <Text style={[styles.postButtonText, !composerText.trim() && styles.postButtonTextDisabled]}>
              Transmit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderPostCard = ({ item }: { item: Post }) => {
    const isLiked = likedPosts.has(item.id) || item.likeUserIds.includes(CURRENT_USER_ID);
    const likeCount = item.likeUserIds.length + (likedPosts.has(item.id) ? 1 : 0);
    const commentCount = getCommentCount(item.commentIds);
    const isLocal = item.id.startsWith('post_local_');

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image source={{ uri: currentUser.avatarUrl }} style={styles.postAvatar} />
          <View style={styles.postHeaderInfo}>
            <Text style={styles.postAuthor}>{currentUser.name}</Text>
            <Text style={styles.postTime}>{formatTimeAgo(new Date(item.createdAt))}</Text>
          </View>
          {isLocal && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Trash2 size={16} color={KORI_COLORS.accent.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.postContent}>{item.content}</Text>
        
        {item.mediaUrls.length > 0 && (
          <TouchableOpacity
            style={styles.postMediaContainer}
            onPress={() => router.push(`/fullscreen-viewer?images=${encodeURIComponent(JSON.stringify(item.mediaUrls))}&index=0`)}
          >
            <Image
              source={{ uri: item.mediaUrls[0] }}
              style={styles.postMedia}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.postActionBtn}
            onPress={() => handleLike(item.id)}
          >
            <Heart
              size={18}
              color={isLiked ? KORI_COLORS.accent.primary : KORI_COLORS.text.tertiary}
              fill={isLiked ? KORI_COLORS.accent.primary : 'transparent'}
            />
            <Text style={[styles.postActionText, isLiked && styles.postActionTextActive]}>
              {likeCount > 0 ? likeCount : ''}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.postActionBtn}
            onPress={() => router.push(`/post-detail?postId=${item.id}`)}
          >
            <MessageCircle size={18} color={KORI_COLORS.text.tertiary} />
            <Text style={styles.postActionText}>
              {commentCount > 0 ? commentCount : ''}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.postActionBtn}
            onPress={() => handleShareToDM(item.id)}
          >
            <Share2 size={18} color={KORI_COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGalleryPreview = () => (
    <Animated.View style={[styles.moduleContainer, { opacity: moduleOpacity }]}>
      <View style={styles.moduleHeader}>
        <View style={styles.moduleTitleRow}>
          <ImageIcon size={14} color={KORI_COLORS.accent.gold} />
          <Text style={styles.moduleTitle}>Memory Bank</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => router.push('/planet-gallery')}
        >
          <Text style={styles.seeAllText}>Open</Text>
          <ChevronRight size={14} color={KORI_COLORS.accent.gold} />
        </TouchableOpacity>
      </View>
      
      {galleryImages.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
          {galleryImages.map((uri, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.galleryThumb}
              onPress={() => router.push(`/fullscreen-viewer?images=${encodeURIComponent(JSON.stringify(galleryImages))}&index=${idx}`)}
            >
              <Image source={{ uri }} style={styles.galleryImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyGallery}>
          <ImageIcon size={28} color={KORI_COLORS.text.tertiary} />
          <Text style={styles.emptyText}>Add memories to your planet</Text>
        </View>
      )}
    </Animated.View>
  );

  const renderFeedSection = () => (
    <Animated.View style={[styles.moduleContainer, styles.feedModule, { opacity: moduleOpacity }]}>
      <View style={styles.moduleHeader}>
        <View style={styles.moduleTitleRow}>
          <MessageCircle size={14} color={KORI_COLORS.accent.gold} />
          <Text style={styles.moduleTitle}>Timeline</Text>
        </View>
        <Text style={styles.postCount}>{userPosts.length} transmissions</Text>
      </View>
      
      {userPosts.length > 0 ? (
        userPosts.map(post => (
          <View key={post.id}>
            {renderPostCard({ item: post })}
          </View>
        ))
      ) : (
        <View style={styles.emptyPosts}>
          <Radio size={32} color={KORI_COLORS.text.tertiary} />
          <Text style={styles.emptyTitle}>Your planet is quiet</Text>
          <Text style={styles.emptySubtitle}>Broadcast your first transmission above</Text>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <MistBackground />
      <SakuraPetals count={6} duration={4000} enabled={showPetals} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={KORI_COLORS.accent.gold}
            />
          }
        >
          {renderHeader()}
          {renderWarpSection()}
          {renderDailyPulse()}
          {renderSignalsSection()}
          {renderComposer()}
          {renderGalleryPreview()}
          {renderFeedSection()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: KORI_COLORS.bg.primary,
  },
  planetHaloContainer: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  planetHaloSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerContainer: {
    position: 'relative',
    height: 300,
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    opacity: 0.5,
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: KORI_COLORS.accent.gold,
    zIndex: 2,
  },
  avatarGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 52,
    backgroundColor: KORI_COLORS.glow.moon,
    zIndex: 1,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: KORI_COLORS.status.success,
    borderWidth: 3,
    borderColor: KORI_COLORS.bg.primary,
    zIndex: 3,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  identityTitle: {
    fontSize: 14,
    color: KORI_COLORS.accent.gold,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: KORI_COLORS.glass.bg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  chipFandom: {
    borderColor: KORI_COLORS.accent.secondary,
    backgroundColor: 'rgba(242, 160, 181, 0.1)',
  },
  chipText: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: KORI_COLORS.accent.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22,
    shadowColor: KORI_COLORS.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  actionButtonSecondary: {
    backgroundColor: KORI_COLORS.glass.bg,
    padding: 11,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  moduleContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    overflow: 'hidden',
  },
  feedModule: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: KORI_COLORS.glass.border,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  moduleSigil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: KORI_COLORS.accent.gold,
    opacity: 0.4,
  },
  composerContent: {
    padding: 16,
  },
  composerHeaderRow: {
    marginBottom: 12,
  },
  scopeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: KORI_COLORS.bg.elevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  scopeText: {
    fontSize: 12,
    color: KORI_COLORS.accent.gold,
    fontWeight: '500' as const,
  },
  scopeDropdown: {
    backgroundColor: KORI_COLORS.bg.elevated,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  scopeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: KORI_COLORS.glass.border,
  },
  scopeOptionActive: {
    backgroundColor: KORI_COLORS.glow.moon,
  },
  scopeOptionText: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
  },
  scopeOptionTextActive: {
    color: KORI_COLORS.accent.gold,
    fontWeight: '500' as const,
  },
  composerInput: {
    fontSize: 15,
    color: KORI_COLORS.text.primary,
    minHeight: 70,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: KORI_COLORS.glass.border,
    paddingTop: 14,
    marginTop: 8,
  },
  composerActionBtn: {
    padding: 8,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: KORI_COLORS.accent.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
  },
  postButtonDisabled: {
    backgroundColor: KORI_COLORS.bg.elevated,
  },
  postButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  postButtonTextDisabled: {
    color: KORI_COLORS.text.tertiary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    color: KORI_COLORS.accent.gold,
    fontWeight: '500' as const,
  },
  galleryScroll: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  galleryThumb: {
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  galleryImage: {
    width: 90,
    height: 90,
  },
  emptyGallery: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: KORI_COLORS.text.tertiary,
  },
  postCount: {
    fontSize: 12,
    color: KORI_COLORS.text.tertiary,
  },
  postCard: {
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  postTime: {
    fontSize: 12,
    color: KORI_COLORS.text.tertiary,
  },
  deleteButton: {
    padding: 8,
  },
  postContent: {
    fontSize: 15,
    color: KORI_COLORS.text.primary,
    lineHeight: 22,
    marginBottom: 12,
  },
  postMediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  postMedia: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: KORI_COLORS.bg.elevated,
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: KORI_COLORS.glass.border,
  },
  postActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 13,
    color: KORI_COLORS.text.tertiary,
  },
  postActionTextActive: {
    color: KORI_COLORS.accent.primary,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: KORI_COLORS.text.tertiary,
  },
  bottomPadding: {
    height: 100,
  },
  warpContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  warpButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  warpGradient: {
    padding: 16,
  },
  warpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warpTextContainer: {
    flex: 1,
  },
  warpTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    letterSpacing: 2,
  },
  warpSubtitle: {
    fontSize: 12,
    color: KORI_COLORS.text.primary,
    opacity: 0.8,
    marginTop: 2,
  },
  signalsContent: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  signalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: KORI_COLORS.bg.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  signalButtonLocked: {
    opacity: 0.6,
  },
  signalButtonText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: KORI_COLORS.text.primary,
  },
  signalButtonTextLocked: {
    color: KORI_COLORS.text.tertiary,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: KORI_COLORS.accent.gold + '20',
    borderRadius: 8,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: KORI_COLORS.accent.gold,
    letterSpacing: 0.5,
  },
  pulseContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    padding: 16,
  },
  pulseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pulseTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: KORI_COLORS.accent.gold + '20',
    borderRadius: 8,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: KORI_COLORS.accent.gold,
  },
  pulseCompleted: {
    paddingVertical: 8,
  },
  pulseCompletedText: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
  },
  pulsePrompt: {
    gap: 12,
  },
  pulsePromptText: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
  },
  pulseOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  pulseOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: KORI_COLORS.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  pulseEmoji: {
    fontSize: 20,
  },
});
