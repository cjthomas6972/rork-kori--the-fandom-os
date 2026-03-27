import { useRouter } from 'expo-router';
import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  TextInput,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { 
  ArrowLeft, 
  Check, 
  User, 
  Globe, 
  MapPin,
  Shield,
  Eye,
  X,
  Plus,
  ChevronDown,
  Camera,
  Image as ImageIcon,
} from 'lucide-react-native';
import { useIdentity } from '@/contexts/IdentityContext';
import { useUniverse } from '@/contexts/UniverseContext';
import { MistBackground, SigilLoader } from '@/components/lunar';
import { VIBE_TAGS, LOOKING_FOR, INTERESTS, VALUES } from '@/types/social';
import KORI_COLORS from '@/constants/colors';

type TabType = 'core' | 'universe';
type DMPreference = 'everyone' | 'alignedOnly' | 'friendsOnly';
type LocationVisibility = 'off' | 'cityOnly' | 'approxArea';

interface CoreProfileData {
  displayName: string;
  username: string;
  bio: string;
  city: string;
  country: string;
  allowDMsFrom: DMPreference;
  showDistance: boolean;
  showLocation: LocationVisibility;
}

interface UniverseProfileData {
  identityTitle: string;
  fandomTags: string[];
  interests: string[];
  values: string[];
  vibeTags: string[];
  lookingFor: string[];
  dealbreakers: string[];
  publicInUniverse: boolean;
  showInAligned: boolean;
  showInDiscover: boolean;
}

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { identity, updateIdentity } = useIdentity();
  const { selectedUniverse, selectedUniverseId, userUniverses, selectUniverse, triggerRefresh } = useUniverse();
  
  const [activeTab, setActiveTab] = useState<TabType>('core');
  const [isSaving, setIsSaving] = useState(false);
  const [showUniversePicker, setShowUniversePicker] = useState(false);
  
  const [coreProfile, setCoreProfile] = useState<CoreProfileData>({
    displayName: identity?.displayName || '',
    username: identity?.username || '',
    bio: identity?.bio || '',
    city: identity?.location?.city || '',
    country: identity?.location?.country || '',
    allowDMsFrom: 'everyone',
    showDistance: true,
    showLocation: 'cityOnly',
  });
  
  const [universeProfile, setUniverseProfile] = useState<UniverseProfileData>({
    identityTitle: '',
    fandomTags: [],
    interests: [],
    values: [],
    vibeTags: [],
    lookingFor: [],
    dealbreakers: [],
    publicInUniverse: true,
    showInAligned: true,
    showInDiscover: true,
  });

  useEffect(() => {
    if (identity) {
      setCoreProfile({
        displayName: identity.displayName || '',
        username: identity.username || '',
        bio: identity.bio || '',
        city: identity.location?.city || '',
        country: identity.location?.country || '',
        allowDMsFrom: 'everyone',
        showDistance: true,
        showLocation: 'cityOnly',
      });
    }
  }, [identity]);

  const handleSave = async () => {
    if (!identity) return;
    
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      if (activeTab === 'core') {
        await updateIdentity({
          displayName: coreProfile.displayName,
          username: coreProfile.username,
          bio: coreProfile.bio,
          location: {
            city: coreProfile.city,
            country: coreProfile.country,
          },
        });
      }
      
      triggerRefresh();
      
      setTimeout(() => {
        setIsSaving(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      }, 500);
    } catch (error) {
      console.error('[EditProfile] Save error:', error);
      setIsSaving(false);
    }
  };

  const handleAddTag = (field: keyof UniverseProfileData, tag: string) => {
    const currentArray = universeProfile[field] as string[];
    if (!currentArray.includes(tag)) {
      setUniverseProfile(prev => ({
        ...prev,
        [field]: [...currentArray, tag],
      }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveTag = (field: keyof UniverseProfileData, tag: string) => {
    const currentArray = universeProfile[field] as string[];
    setUniverseProfile(prev => ({
      ...prev,
      [field]: currentArray.filter(t => t !== tag),
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!identity) {
    return (
      <View style={styles.container}>
        <MistBackground showMoonGlow intensity="low" />
        <SafeAreaView style={styles.loadingContainer}>
          <SigilLoader size={56} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="low" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <HeaderButton icon={ArrowLeft} onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <HeaderButton 
            icon={Check} 
            onPress={handleSave} 
            accent 
            loading={isSaving}
          />
        </View>

        <View style={styles.tabContainer}>
          <TabButton
            label="Core"
            icon={User}
            active={activeTab === 'core'}
            onPress={() => setActiveTab('core')}
          />
          <TabButton
            label="Universe"
            icon={Globe}
            active={activeTab === 'universe'}
            onPress={() => setActiveTab('universe')}
          />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'core' ? (
            <CoreProfileEditor
              profile={coreProfile}
              onChange={setCoreProfile}
              displayName={identity.displayName}
            />
          ) : (
            <UniverseProfileEditor
              profile={universeProfile}
              onChange={setUniverseProfile}
              selectedUniverse={selectedUniverse}
              userUniverses={userUniverses}
              onUniversePress={() => setShowUniversePicker(true)}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
            />
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      {showUniversePicker && (
        <UniversePickerModal
          universes={userUniverses}
          selectedId={selectedUniverseId}
          onSelect={(id) => {
            selectUniverse(id);
            setShowUniversePicker(false);
          }}
          onClose={() => setShowUniversePicker(false)}
        />
      )}
    </View>
  );
}

function HeaderButton({ 
  icon: Icon, 
  onPress, 
  accent = false,
  loading = false,
}: { 
  icon: typeof ArrowLeft; 
  onPress: () => void; 
  accent?: boolean;
  loading?: boolean;
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
        disabled={loading}
      >
        {loading ? (
          <SigilLoader size={20} />
        ) : (
          <Icon 
            size={20} 
            color={accent ? KORI_COLORS.bg.primary : KORI_COLORS.text.primary} 
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

function TabButton({ 
  label, 
  icon: Icon, 
  active, 
  onPress 
}: { 
  label: string; 
  icon: typeof User; 
  active: boolean; 
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, { flex: 1 }]}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.tabButton, active && styles.tabButtonActive]}
      >
        <Icon 
          size={18} 
          color={active ? KORI_COLORS.accent.gold : KORI_COLORS.text.secondary} 
        />
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
        {active && <View style={styles.tabIndicator} />}
      </Pressable>
    </Animated.View>
  );
}

function CoreProfileEditor({ 
  profile, 
  onChange,
  displayName,
}: { 
  profile: CoreProfileData; 
  onChange: (p: CoreProfileData) => void;
  displayName: string;
}) {
  const coverImage = COVER_IMAGES[0];

  return (
    <View style={styles.editorContainer}>
      <View style={styles.mediaSection}>
        <View style={styles.coverPreview}>
          <Image source={{ uri: coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', KORI_COLORS.bg.primary + 'CC']}
            style={styles.coverGradient}
          />
          <Pressable style={styles.coverEditButton}>
            <ImageIcon size={18} color={KORI_COLORS.text.primary} />
            <Text style={styles.coverEditText}>Change Cover</Text>
          </Pressable>
        </View>
        
        <View style={styles.avatarEditSection}>
          <View style={styles.avatarPreview}>
            <View style={styles.avatarGlow} />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName[0]}</Text>
            </View>
            <Pressable style={styles.avatarEditButton}>
              <Camera size={16} color={KORI_COLORS.text.primary} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Display Name</Text>
          <TextInput
            style={styles.textInput}
            value={profile.displayName}
            onChangeText={(text) => onChange({ ...profile, displayName: text })}
            placeholder="Your name"
            placeholderTextColor={KORI_COLORS.text.tertiary}
            maxLength={30}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Username</Text>
          <View style={styles.usernameInputContainer}>
            <Text style={styles.usernamePrefix}>@</Text>
            <TextInput
              style={styles.usernameInput}
              value={profile.username}
              onChangeText={(text) => onChange({ ...profile, username: text.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              placeholder="username"
              placeholderTextColor={KORI_COLORS.text.tertiary}
              autoCapitalize="none"
              maxLength={20}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={profile.bio}
            onChangeText={(text) => onChange({ ...profile, bio: text })}
            placeholder="Tell us about yourself..."
            placeholderTextColor={KORI_COLORS.text.tertiary}
            multiline
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{profile.bio.length}/200</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MapPin size={18} color={KORI_COLORS.accent.gold} />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>City</Text>
            <TextInput
              style={styles.textInput}
              value={profile.city}
              onChangeText={(text) => onChange({ ...profile, city: text })}
              placeholder="City"
              placeholderTextColor={KORI_COLORS.text.tertiary}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Country</Text>
            <TextInput
              style={styles.textInput}
              value={profile.country}
              onChangeText={(text) => onChange({ ...profile, country: text })}
              placeholder="Country"
              placeholderTextColor={KORI_COLORS.text.tertiary}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={18} color={KORI_COLORS.accent.primary} />
          <Text style={styles.sectionTitle}>Safety & Privacy</Text>
        </View>

        <View style={styles.optionCard}>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Allow DMs from</Text>
            <View style={styles.optionSelector}>
              {(['everyone', 'alignedOnly', 'friendsOnly'] as DMPreference[]).map(opt => (
                <Pressable
                  key={opt}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onChange({ ...profile, allowDMsFrom: opt });
                  }}
                  style={[
                    styles.optionChip,
                    profile.allowDMsFrom === opt && styles.optionChipActive,
                  ]}
                >
                  <Text style={[
                    styles.optionChipText,
                    profile.allowDMsFrom === opt && styles.optionChipTextActive,
                  ]}>
                    {opt === 'everyone' ? 'Everyone' : opt === 'alignedOnly' ? 'Aligned' : 'Friends'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.optionDivider} />

          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Eye size={16} color={KORI_COLORS.text.secondary} />
              <Text style={styles.optionLabel}>Show Distance</Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange({ ...profile, showDistance: !profile.showDistance });
              }}
              style={[styles.toggle, profile.showDistance && styles.toggleActive]}
            >
              <View style={[styles.toggleThumb, profile.showDistance && styles.toggleThumbActive]} />
            </Pressable>
          </View>

          <View style={styles.optionDivider} />

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Location Visibility</Text>
            <View style={styles.optionSelector}>
              {(['off', 'cityOnly', 'approxArea'] as LocationVisibility[]).map(opt => (
                <Pressable
                  key={opt}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onChange({ ...profile, showLocation: opt });
                  }}
                  style={[
                    styles.optionChip,
                    profile.showLocation === opt && styles.optionChipActive,
                  ]}
                >
                  <Text style={[
                    styles.optionChipText,
                    profile.showLocation === opt && styles.optionChipTextActive,
                  ]}>
                    {opt === 'off' ? 'Off' : opt === 'cityOnly' ? 'City' : 'Area'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

interface UniverseProfileEditorProps {
  profile: UniverseProfileData;
  onChange: (p: UniverseProfileData) => void;
  selectedUniverse: { id: string; name: string; icon: string; color: string } | null;
  userUniverses: { id: string; name: string; icon: string; color: string }[];
  onUniversePress: () => void;
  onAddTag: (field: keyof UniverseProfileData, tag: string) => void;
  onRemoveTag: (field: keyof UniverseProfileData, tag: string) => void;
}

function UniverseProfileEditor({ 
  profile, 
  onChange,
  selectedUniverse,
  onUniversePress,
  onAddTag,
  onRemoveTag,
}: UniverseProfileEditorProps) {
  const [newFandomTag, setNewFandomTag] = useState('');

  if (!selectedUniverse) {
    return (
      <View style={styles.noUniverseContainer}>
        <Globe size={48} color={KORI_COLORS.text.tertiary} />
        <Text style={styles.noUniverseTitle}>No Universe Selected</Text>
        <Text style={styles.noUniverseText}>
          Select a universe to edit your identity
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.editorContainer}>
      <Pressable style={styles.universeSelector} onPress={onUniversePress}>
        <View style={[styles.universeSelectorIcon, { backgroundColor: selectedUniverse.color + '20' }]}>
          <Text style={styles.universeSelectorEmoji}>{selectedUniverse.icon}</Text>
        </View>
        <View style={styles.universeSelectorContent}>
          <Text style={styles.universeSelectorLabel}>Editing Profile for</Text>
          <Text style={styles.universeSelectorName}>{selectedUniverse.name}</Text>
        </View>
        <ChevronDown size={20} color={KORI_COLORS.text.secondary} />
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identity</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Identity Title</Text>
          <TextInput
            style={styles.textInput}
            value={profile.identityTitle}
            onChangeText={(text) => onChange({ ...profile, identityTitle: text })}
            placeholder="e.g. Lore Keeper, Hype Commander"
            placeholderTextColor={KORI_COLORS.text.tertiary}
            maxLength={30}
          />
          <Text style={styles.inputHint}>This appears below your name on your profile</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fandom Tags</Text>
        <View style={styles.tagInputRow}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            value={newFandomTag}
            onChangeText={setNewFandomTag}
            placeholder="Add fandom tag..."
            placeholderTextColor={KORI_COLORS.text.tertiary}
            maxLength={25}
            onSubmitEditing={() => {
              if (newFandomTag.trim()) {
                onAddTag('fandomTags', newFandomTag.trim());
                setNewFandomTag('');
              }
            }}
          />
          <Pressable
            style={[styles.addTagButton, !newFandomTag.trim() && styles.addTagButtonDisabled]}
            onPress={() => {
              if (newFandomTag.trim()) {
                onAddTag('fandomTags', newFandomTag.trim());
                setNewFandomTag('');
              }
            }}
          >
            <Plus size={20} color={newFandomTag.trim() ? KORI_COLORS.accent.gold : KORI_COLORS.text.tertiary} />
          </Pressable>
        </View>
        {profile.fandomTags.length > 0 && (
          <View style={styles.tagList}>
            {profile.fandomTags.map(tag => (
              <Pressable 
                key={tag} 
                style={styles.tagChip}
                onPress={() => onRemoveTag('fandomTags', tag)}
              >
                <Text style={styles.tagChipText}>{tag}</Text>
                <X size={14} color={KORI_COLORS.text.secondary} />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <TagSection
        title="Vibe Tags"
        selected={profile.vibeTags}
        options={[...VIBE_TAGS]}
        onAdd={(tag) => onAddTag('vibeTags', tag)}
        onRemove={(tag) => onRemoveTag('vibeTags', tag)}
        color={KORI_COLORS.accent.secondary}
      />

      <TagSection
        title="Looking For"
        selected={profile.lookingFor}
        options={[...LOOKING_FOR]}
        onAdd={(tag) => onAddTag('lookingFor', tag)}
        onRemove={(tag) => onRemoveTag('lookingFor', tag)}
        color={KORI_COLORS.accent.gold}
      />

      <TagSection
        title="Interests"
        selected={profile.interests}
        options={[...INTERESTS]}
        onAdd={(tag) => onAddTag('interests', tag)}
        onRemove={(tag) => onRemoveTag('interests', tag)}
        color={KORI_COLORS.accent.primary}
      />

      <TagSection
        title="Values"
        selected={profile.values}
        options={[...VALUES]}
        onAdd={(tag) => onAddTag('values', tag)}
        onRemove={(tag) => onRemoveTag('values', tag)}
        color="#00F0FF"
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Eye size={18} color={KORI_COLORS.accent.gold} />
          <Text style={styles.sectionTitle}>Visibility</Text>
        </View>

        <View style={styles.optionCard}>
          <ToggleOption
            label="Public in Universe"
            description="Others in this universe can see your profile"
            value={profile.publicInUniverse}
            onToggle={() => onChange({ ...profile, publicInUniverse: !profile.publicInUniverse })}
          />
          <View style={styles.optionDivider} />
          <ToggleOption
            label="Show in Aligned"
            description="Appear in alignment suggestions"
            value={profile.showInAligned}
            onToggle={() => onChange({ ...profile, showInAligned: !profile.showInAligned })}
          />
          <View style={styles.optionDivider} />
          <ToggleOption
            label="Show in Discover"
            description="Appear in public discovery"
            value={profile.showInDiscover}
            onToggle={() => onChange({ ...profile, showInDiscover: !profile.showInDiscover })}
          />
        </View>
      </View>
    </View>
  );
}

function TagSection({ 
  title, 
  selected, 
  options, 
  onAdd, 
  onRemove,
  color,
}: { 
  title: string; 
  selected: string[]; 
  options: string[]; 
  onAdd: (tag: string) => void; 
  onRemove: (tag: string) => void;
  color: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayOptions = expanded ? options : options.slice(0, 8);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      
      {selected.length > 0 && (
        <View style={styles.selectedTagList}>
          {selected.map(tag => (
            <Pressable 
              key={tag} 
              style={[styles.selectedTag, { backgroundColor: color + '20', borderColor: color + '40' }]}
              onPress={() => onRemove(tag)}
            >
              <Text style={[styles.selectedTagText, { color }]}>{tag}</Text>
              <X size={12} color={color} />
            </Pressable>
          ))}
        </View>
      )}
      
      <View style={styles.tagOptionsContainer}>
        {displayOptions.filter(opt => !selected.includes(opt)).map(option => (
          <Pressable
            key={option}
            style={styles.tagOption}
            onPress={() => onAdd(option)}
          >
            <Plus size={12} color={KORI_COLORS.text.tertiary} />
            <Text style={styles.tagOptionText}>{option}</Text>
          </Pressable>
        ))}
      </View>
      
      {options.length > 8 && (
        <Pressable 
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandButtonText}>
            {expanded ? 'Show Less' : `Show All (${options.length})`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function ToggleOption({ 
  label, 
  description,
  value, 
  onToggle 
}: { 
  label: string; 
  description?: string;
  value: boolean; 
  onToggle: () => void;
}) {
  return (
    <View style={styles.toggleOptionRow}>
      <View style={styles.toggleOptionContent}>
        <Text style={styles.optionLabel}>{label}</Text>
        {description && <Text style={styles.optionDescription}>{description}</Text>}
      </View>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }}
        style={[styles.toggle, value && styles.toggleActive]}
      >
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </Pressable>
    </View>
  );
}

function UniversePickerModal({ 
  universes, 
  selectedId, 
  onSelect, 
  onClose 
}: { 
  universes: { id: string; name: string; icon: string; color: string }[]; 
  selectedId: string | null; 
  onSelect: (id: string) => void; 
  onClose: () => void;
}) {
  return (
    <View style={styles.modalOverlay}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalContent}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>Select Universe</Text>
        <ScrollView style={styles.modalList}>
          {universes.map(universe => (
            <Pressable
              key={universe.id}
              style={[
                styles.modalItem,
                selectedId === universe.id && styles.modalItemActive,
              ]}
              onPress={() => onSelect(universe.id)}
            >
              <View style={[styles.modalItemIcon, { backgroundColor: universe.color + '20' }]}>
                <Text style={styles.modalItemEmoji}>{universe.icon}</Text>
              </View>
              <Text style={styles.modalItemName}>{universe.name}</Text>
              {selectedId === universe.id && (
                <Check size={18} color={KORI_COLORS.accent.gold} />
              )}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
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
    backgroundColor: KORI_COLORS.accent.gold,
    borderColor: KORI_COLORS.accent.gold,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    position: 'relative',
  },
  tabButtonActive: {
    borderColor: KORI_COLORS.accent.gold + '50',
    backgroundColor: KORI_COLORS.accent.gold + '10',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.secondary,
  },
  tabLabelActive: {
    color: KORI_COLORS.accent.gold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: KORI_COLORS.accent.gold,
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  editorContainer: {
    paddingHorizontal: 20,
  },
  mediaSection: {
    marginBottom: 20,
  },
  coverPreview: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
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
    height: 60,
  },
  coverEditButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  coverEditText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  avatarEditSection: {
    alignItems: 'center',
    marginTop: -40,
  },
  avatarPreview: {
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: KORI_COLORS.lunar.moonGold,
    opacity: 0.15,
    top: -5,
    left: -5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: KORI_COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: KORI_COLORS.bg.primary,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: KORI_COLORS.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: KORI_COLORS.bg.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputHint: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: KORI_COLORS.text.primary,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    paddingLeft: 14,
  },
  usernamePrefix: {
    fontSize: 15,
    color: KORI_COLORS.text.tertiary,
    marginRight: 2,
  },
  usernameInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 14,
    fontSize: 15,
    color: KORI_COLORS.text.primary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleOptionContent: {
    flex: 1,
    marginRight: 12,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: KORI_COLORS.text.primary,
  },
  optionDescription: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
    marginTop: 2,
  },
  optionSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  optionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: KORI_COLORS.bg.elevated,
  },
  optionChipActive: {
    backgroundColor: KORI_COLORS.accent.gold + '20',
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.secondary,
  },
  optionChipTextActive: {
    color: KORI_COLORS.accent.gold,
  },
  optionDivider: {
    height: 1,
    backgroundColor: KORI_COLORS.glass.border,
    marginVertical: 8,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: KORI_COLORS.bg.elevated,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: KORI_COLORS.accent.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: KORI_COLORS.text.tertiary,
  },
  toggleThumbActive: {
    backgroundColor: KORI_COLORS.text.primary,
    alignSelf: 'flex-end',
  },
  universeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    marginBottom: 20,
  },
  universeSelectorIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  universeSelectorEmoji: {
    fontSize: 22,
  },
  universeSelectorContent: {
    flex: 1,
  },
  universeSelectorLabel: {
    fontSize: 11,
    color: KORI_COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  universeSelectorName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    marginTop: 2,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: KORI_COLORS.bg.card,
    borderWidth: 1,
    borderColor: KORI_COLORS.accent.gold + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagButtonDisabled: {
    borderColor: KORI_COLORS.glass.border,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  tagChipText: {
    fontSize: 13,
    color: KORI_COLORS.text.primary,
  },
  selectedTagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  tagOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  tagOptionText: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
  expandButton: {
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  expandButtonText: {
    fontSize: 13,
    color: KORI_COLORS.accent.gold,
    fontWeight: '600' as const,
  },
  noUniverseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  noUniverseTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  noUniverseText: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
    textAlign: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: KORI_COLORS.overlay,
  },
  modalContent: {
    backgroundColor: KORI_COLORS.bg.elevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: KORI_COLORS.text.tertiary,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalList: {
    paddingHorizontal: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: KORI_COLORS.bg.card,
  },
  modalItemActive: {
    borderWidth: 1,
    borderColor: KORI_COLORS.accent.gold + '40',
  },
  modalItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItemEmoji: {
    fontSize: 20,
  },
  modalItemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  bottomSpacer: {
    height: 40,
  },
});
