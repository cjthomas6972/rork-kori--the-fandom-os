import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Camera,
  X,
  Plus,
  Check,
  ChevronDown,
} from 'lucide-react-native';
import KORI_COLORS from '@/constants/colors';
import { useUniverse } from '@/contexts/UniverseContext';
import { getSocialUserById, getUserUniverseProfile, SOCIAL_USERS } from '@/mocks/socialUsers';
import { MistBackground } from '@/components/lunar';
import { VIBE_TAGS, LOOKING_FOR, INTERESTS, VALUES } from '@/types/social';
import PlanetHeader from '@/components/PlanetHeader';

const CURRENT_USER_ID = 'user_001';

type TabType = 'core' | 'universe';

export default function EditPlanetScreen() {
  const router = useRouter();
  const { selectedUniverseId, selectedUniverse, triggerRefresh } = useUniverse();
  const [activeTab, setActiveTab] = useState<TabType>('core');
  const [isSaving, setIsSaving] = useState(false);

  const currentUser = useMemo(() => getSocialUserById(CURRENT_USER_ID), []);
  const universeProfile = useMemo(
    () => selectedUniverseId ? getUserUniverseProfile(CURRENT_USER_ID, selectedUniverseId) : null,
    [selectedUniverseId]
  );

  const [coreName, setCoreName] = useState(currentUser?.name || '');
  const [coreUsername, setCoreUsername] = useState(currentUser?.username || '');
  const [coreBio, setCoreBio] = useState(currentUser?.bio || '');
  const [coreLocation, setCoreLocation] = useState(currentUser?.location.city || '');
  const [dmSafety, setDmSafety] = useState<'everyone' | 'alignedOnly' | 'friendsOnly'>(
    currentUser?.safety.allowDMsFrom || 'everyone'
  );

  const [identityTitle, setIdentityTitle] = useState(universeProfile?.identityTitle || '');
  const [fandomTags, setFandomTags] = useState<string[]>(universeProfile?.fandomTags || []);
  const [interests, setInterests] = useState<string[]>(universeProfile?.interests || []);
  const [values, setValues] = useState<string[]>(universeProfile?.values || []);
  const [vibeTags, setVibeTags] = useState<string[]>(universeProfile?.vibeTags || []);
  const [lookingFor, setLookingFor] = useState<string[]>(universeProfile?.lookingFor || []);
  const [dealbreakers, setDealbreakers] = useState<string[]>(universeProfile?.dealbreakers || []);
  const [publicInUniverse, setPublicInUniverse] = useState(universeProfile?.visibility.publicInUniverse ?? true);
  const [showInAligned, setShowInAligned] = useState(universeProfile?.visibility.showInAligned ?? true);

  const [newTag, setNewTag] = useState('');
  const [showDmDropdown, setShowDmDropdown] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = SOCIAL_USERS.findIndex(u => u.id === CURRENT_USER_ID);
    if (userIndex !== -1) {
      SOCIAL_USERS[userIndex] = {
        ...SOCIAL_USERS[userIndex],
        name: coreName,
        username: coreUsername,
        bio: coreBio,
        location: {
          ...SOCIAL_USERS[userIndex].location,
          city: coreLocation,
        },
        safety: {
          ...SOCIAL_USERS[userIndex].safety,
          allowDMsFrom: dmSafety,
        },
      };

      if (selectedUniverseId) {
        const profileIndex = SOCIAL_USERS[userIndex].universeProfiles.findIndex(
          p => p.universeId === selectedUniverseId
        );
        if (profileIndex !== -1) {
          SOCIAL_USERS[userIndex].universeProfiles[profileIndex] = {
            ...SOCIAL_USERS[userIndex].universeProfiles[profileIndex],
            identityTitle,
            fandomTags,
            interests,
            values,
            vibeTags,
            lookingFor,
            dealbreakers,
            visibility: {
              publicInUniverse,
              showInAligned,
              showInDiscover: publicInUniverse,
            },
          };
        }
      }
    }

    triggerRefresh();
    setIsSaving(false);
    
    Alert.alert('Saved', 'Your planet has been updated!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
    
    console.log('[EditPlanet] Saved profile changes');
  }, [
    coreName, coreUsername, coreBio, coreLocation, dmSafety,
    identityTitle, fandomTags, interests, values, vibeTags, lookingFor, dealbreakers,
    publicInUniverse, showInAligned, selectedUniverseId, triggerRefresh, router
  ]);

  const addTag = useCallback((list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, tag: string) => {
    if (tag.trim() && !list.includes(tag.trim())) {
      setList([...list, tag.trim()]);
    }
  }, []);

  const removeTag = useCallback((list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, tag: string) => {
    setList(list.filter(t => t !== tag));
  }, []);

  const toggleTag = useCallback((list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, tag: string) => {
    if (list.includes(tag)) {
      setList(list.filter(t => t !== tag));
    } else {
      setList([...list, tag]);
    }
  }, []);

  const renderChipEditor = (
    label: string,
    tags: string[],
    setTags: React.Dispatch<React.SetStateAction<string[]>>,
    suggestions?: readonly string[],
    placeholder?: string
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipsContainer}>
        {tags.map((tag, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.chip}
            onPress={() => removeTag(tags, setTags, tag)}
          >
            <Text style={styles.chipText}>{tag}</Text>
            <X size={12} color={KORI_COLORS.text.secondary} />
          </TouchableOpacity>
        ))}
      </View>
      {suggestions && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
          {suggestions.filter(s => !tags.includes(s)).slice(0, 10).map((suggestion, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionChip}
              onPress={() => toggleTag(tags, setTags, suggestion)}
            >
              <Plus size={12} color={KORI_COLORS.accent.gold} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <View style={styles.addTagRow}>
        <TextInput
          style={styles.addTagInput}
          placeholder={placeholder || 'Add custom...'}
          placeholderTextColor={KORI_COLORS.text.tertiary}
          value={newTag}
          onChangeText={setNewTag}
          onSubmitEditing={() => {
            addTag(tags, setTags, newTag);
            setNewTag('');
          }}
        />
        <TouchableOpacity
          style={styles.addTagButton}
          onPress={() => {
            addTag(tags, setTags, newTag);
            setNewTag('');
          }}
        >
          <Plus size={16} color={KORI_COLORS.accent.gold} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCoreTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.imageEditSection}>
        <TouchableOpacity style={styles.avatarEditContainer}>
          <Image
            source={{ uri: currentUser?.avatarUrl }}
            style={styles.avatarEdit}
          />
          <View style={styles.cameraOverlay}>
            <Camera size={20} color={KORI_COLORS.text.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.imageEditLabel}>Change Avatar</Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Display Name</Text>
        <TextInput
          style={styles.textInput}
          value={coreName}
          onChangeText={setCoreName}
          placeholder="Your name"
          placeholderTextColor={KORI_COLORS.text.tertiary}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Username</Text>
        <TextInput
          style={styles.textInput}
          value={coreUsername}
          onChangeText={setCoreUsername}
          placeholder="username"
          placeholderTextColor={KORI_COLORS.text.tertiary}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Bio</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={coreBio}
          onChangeText={setCoreBio}
          placeholder="Tell us about yourself..."
          placeholderTextColor={KORI_COLORS.text.tertiary}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Location</Text>
        <TextInput
          style={styles.textInput}
          value={coreLocation}
          onChangeText={setCoreLocation}
          placeholder="City, State"
          placeholderTextColor={KORI_COLORS.text.tertiary}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Who can DM you?</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDmDropdown(!showDmDropdown)}
        >
          <Text style={styles.dropdownText}>
            {dmSafety === 'everyone' ? 'Everyone' : dmSafety === 'alignedOnly' ? 'Aligned Only' : 'Friends Only'}
          </Text>
          <ChevronDown size={18} color={KORI_COLORS.text.secondary} />
        </TouchableOpacity>
        {showDmDropdown && (
          <View style={styles.dropdownMenu}>
            {(['everyone', 'alignedOnly', 'friendsOnly'] as const).map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.dropdownOption, dmSafety === option && styles.dropdownOptionActive]}
                onPress={() => {
                  setDmSafety(option);
                  setShowDmDropdown(false);
                }}
              >
                <Text style={[styles.dropdownOptionText, dmSafety === option && styles.dropdownOptionTextActive]}>
                  {option === 'everyone' ? 'Everyone' : option === 'alignedOnly' ? 'Aligned Only' : 'Friends Only'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderUniverseTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.universeHeader}>
        <Text style={styles.universeLabel}>Editing for:</Text>
        <View style={styles.universeBadge}>
          <Text style={styles.universeBadgeText}>{selectedUniverse?.name || 'Select Universe'}</Text>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Identity Title</Text>
        <TextInput
          style={styles.textInput}
          value={identityTitle}
          onChangeText={setIdentityTitle}
          placeholder="e.g., Lore Keeper, Hype Commander"
          placeholderTextColor={KORI_COLORS.text.tertiary}
        />
      </View>

      {renderChipEditor('Fandom Tags', fandomTags, setFandomTags, undefined, 'Add fandom...')}
      {renderChipEditor('Interests', interests, setInterests, INTERESTS, 'Add interest...')}
      {renderChipEditor('Values', values, setValues, VALUES, 'Add value...')}
      {renderChipEditor('Vibe Tags', vibeTags, setVibeTags, VIBE_TAGS, 'Add vibe...')}
      {renderChipEditor('Looking For', lookingFor, setLookingFor, LOOKING_FOR, 'Add...')}
      {renderChipEditor('Dealbreakers', dealbreakers, setDealbreakers, undefined, 'Add dealbreaker...')}

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Visibility</Text>
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setPublicInUniverse(!publicInUniverse)}
        >
          <Text style={styles.toggleLabel}>Public in Universe</Text>
          <View style={[styles.toggle, publicInUniverse && styles.toggleActive]}>
            {publicInUniverse && <Check size={14} color={KORI_COLORS.text.primary} />}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setShowInAligned(!showInAligned)}
        >
          <Text style={styles.toggleLabel}>Show in Aligned</Text>
          <View style={[styles.toggle, showInAligned && styles.toggleActive]}>
            {showInAligned && <Check size={14} color={KORI_COLORS.text.primary} />}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const SaveButton = (
    <TouchableOpacity
      style={styles.saveButton}
      onPress={handleSave}
      disabled={isSaving}
    >
      <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MistBackground />
      <PlanetHeader title="Edit Planet" rightAction={SaveButton} />
      <View style={styles.contentArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'core' && styles.tabActive]}
              onPress={() => setActiveTab('core')}
            >
              <Text style={[styles.tabText, activeTab === 'core' && styles.tabTextActive]}>Core</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'universe' && styles.tabActive]}
              onPress={() => setActiveTab('universe')}
            >
              <Text style={[styles.tabText, activeTab === 'universe' && styles.tabTextActive]}>Universe</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {activeTab === 'core' ? renderCoreTab() : renderUniverseTab()}
            <View style={styles.bottomPadding} />
          </ScrollView>
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: KORI_COLORS.glass.bg,
  },
  tabActive: {
    backgroundColor: KORI_COLORS.accent.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.secondary,
  },
  tabTextActive: {
    color: KORI_COLORS.text.primary,
  },
  tabContent: {
    padding: 16,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: KORI_COLORS.accent.gold,
  },
  imageEditSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarEditContainer: {
    position: 'relative',
  },
  avatarEdit: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: KORI_COLORS.accent.gold,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: KORI_COLORS.accent.primary,
    borderRadius: 16,
    padding: 8,
  },
  imageEditLabel: {
    marginTop: 8,
    fontSize: 13,
    color: KORI_COLORS.accent.gold,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: KORI_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: KORI_COLORS.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: KORI_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 15,
    color: KORI_COLORS.text.primary,
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: KORI_COLORS.bg.elevated,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: KORI_COLORS.glass.border,
  },
  dropdownOptionActive: {
    backgroundColor: KORI_COLORS.glow.moon,
  },
  dropdownOptionText: {
    fontSize: 15,
    color: KORI_COLORS.text.secondary,
  },
  dropdownOptionTextActive: {
    color: KORI_COLORS.accent.gold,
  },
  universeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    padding: 12,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 12,
  },
  universeLabel: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
  },
  universeBadge: {
    backgroundColor: KORI_COLORS.accent.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  universeBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: KORI_COLORS.glass.bg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  chipText: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
  },
  suggestionsScroll: {
    marginBottom: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: KORI_COLORS.bg.elevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: KORI_COLORS.accent.gold,
  },
  addTagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addTagInput: {
    flex: 1,
    backgroundColor: KORI_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: KORI_COLORS.text.primary,
  },
  addTagButton: {
    backgroundColor: KORI_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: KORI_COLORS.accent.gold,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: KORI_COLORS.glass.border,
  },
  toggleLabel: {
    fontSize: 15,
    color: KORI_COLORS.text.primary,
  },
  toggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: KORI_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: KORI_COLORS.accent.primary,
    borderColor: KORI_COLORS.accent.primary,
  },
  bottomPadding: {
    height: 40,
  },
});
