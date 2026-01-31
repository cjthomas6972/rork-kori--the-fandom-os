import { useRouter } from 'expo-router';
import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { X, ChevronDown, Check, MapPin, Globe } from 'lucide-react-native';
import { useUniverse } from '@/contexts/UniverseContext';
import { MistBackground, CrescentButton, GlassChip } from '@/components/lunar';
import { UNIVERSES } from '@/constants/universes';
import KORI_COLORS from '@/constants/colors';

const EVENT_TAGS = [
  'Watch Party', 'Meetup', 'Tournament', 'Convention', 'Discussion',
  'Gaming Session', 'Cosplay', 'Art Session', 'Book Club', 'Movie Night',
];

const VISIBILITY_OPTIONS = [
  { id: 'public', label: 'Public', desc: 'Anyone can see and join' },
  { id: 'guildOnly', label: 'Guild Only', desc: 'Only guild members can see' },
  { id: 'friendsOnly', label: 'Friends Only', desc: 'Only your friends can see' },
];

export default function CreateMeetupScreen() {
  const router = useRouter();
  const { selectedUniverseId, userUniverses } = useUniverse();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [universeId, setUniverseId] = useState(selectedUniverseId || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [locationText, setLocationText] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [showUniversePicker, setShowUniversePicker] = useState(false);

  const selectedUniverse = UNIVERSES.find(u => u.id === universeId);

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreate = () => {
    if (!title.trim() || !universeId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const isValid = title.trim().length >= 3 && universeId;

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="low" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable 
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <X size={22} color={KORI_COLORS.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Create Meetup</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.section}>
              <Text style={styles.label}>Universe *</Text>
              <Pressable
                style={styles.picker}
                onPress={() => setShowUniversePicker(!showUniversePicker)}
              >
                {selectedUniverse ? (
                  <View style={styles.pickerContent}>
                    <Text style={styles.pickerIcon}>{selectedUniverse.icon}</Text>
                    <Text style={styles.pickerText}>{selectedUniverse.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.pickerPlaceholder}>Select a universe</Text>
                )}
                <ChevronDown size={18} color={KORI_COLORS.text.secondary} />
              </Pressable>
              
              {showUniversePicker && (
                <View style={styles.pickerDropdown}>
                  {userUniverses.map(universe => (
                    <Pressable
                      key={universe.id}
                      style={[
                        styles.pickerOption,
                        universeId === universe.id && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setUniverseId(universe.id);
                        setShowUniversePicker(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text style={styles.pickerIcon}>{universe.icon}</Text>
                      <Text style={styles.pickerOptionText}>{universe.name}</Text>
                      {universeId === universe.id && (
                        <Check size={16} color={KORI_COLORS.accent.primary} />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Give your meetup a name"
                placeholderTextColor={KORI_COLORS.text.tertiary}
                maxLength={100}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="What's this meetup about?"
                placeholderTextColor={KORI_COLORS.text.tertiary}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Event Type</Text>
              <View style={styles.typeContainer}>
                <Pressable
                  style={[styles.typeOption, isOnline && styles.typeOptionActive]}
                  onPress={() => {
                    setIsOnline(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Globe size={20} color={isOnline ? KORI_COLORS.accent.gold : KORI_COLORS.text.secondary} />
                  <Text style={[styles.typeText, isOnline && styles.typeTextActive]}>Online</Text>
                </Pressable>
                <Pressable
                  style={[styles.typeOption, !isOnline && styles.typeOptionActive]}
                  onPress={() => {
                    setIsOnline(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <MapPin size={20} color={!isOnline ? KORI_COLORS.accent.gold : KORI_COLORS.text.secondary} />
                  <Text style={[styles.typeText, !isOnline && styles.typeTextActive]}>In Person</Text>
                </Pressable>
              </View>
            </View>

            {!isOnline && (
              <View style={styles.section}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={locationText}
                  onChangeText={setLocationText}
                  placeholder="Where will the meetup be?"
                  placeholderTextColor={KORI_COLORS.text.tertiary}
                />
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>Tags (up to 3)</Text>
              <View style={styles.tagsContainer}>
                {EVENT_TAGS.map(tag => (
                  <Pressable
                    key={tag}
                    onPress={() => toggleTag(tag)}
                  >
                    <GlassChip
                      label={tag}
                      size="medium"
                      selected={selectedTags.includes(tag)}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Visibility</Text>
              <View style={styles.visibilityContainer}>
                {VISIBILITY_OPTIONS.map(option => (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.visibilityOption,
                      visibility === option.id && styles.visibilityOptionActive,
                    ]}
                    onPress={() => {
                      setVisibility(option.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <View style={styles.visibilityContent}>
                      <Text style={[
                        styles.visibilityLabel,
                        visibility === option.id && styles.visibilityLabelActive,
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={styles.visibilityDesc}>{option.desc}</Text>
                    </View>
                    {visibility === option.id && (
                      <Check size={18} color={KORI_COLORS.accent.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Max Attendees (optional)</Text>
              <TextInput
                style={styles.input}
                value={maxAttendees}
                onChangeText={setMaxAttendees}
                placeholder="Leave empty for unlimited"
                placeholderTextColor={KORI_COLORS.text.tertiary}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.buttonContainer}>
              <CrescentButton
                title="Create Meetup"
                onPress={handleCreate}
                disabled={!isValid}
                size="large"
              />
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: KORI_COLORS.glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: KORI_COLORS.text.primary,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerIcon: {
    fontSize: 18,
  },
  pickerText: {
    fontSize: 15,
    color: KORI_COLORS.text.primary,
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: KORI_COLORS.text.tertiary,
  },
  pickerDropdown: {
    marginTop: 8,
    backgroundColor: KORI_COLORS.bg.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: KORI_COLORS.glass.border,
  },
  pickerOptionSelected: {
    backgroundColor: KORI_COLORS.accent.primary + '10',
  },
  pickerOptionText: {
    flex: 1,
    fontSize: 14,
    color: KORI_COLORS.text.primary,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: KORI_COLORS.bg.card,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  typeOptionActive: {
    borderColor: KORI_COLORS.accent.gold,
    backgroundColor: KORI_COLORS.accent.gold + '10',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.secondary,
  },
  typeTextActive: {
    color: KORI_COLORS.accent.gold,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  visibilityContainer: {
    gap: 8,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    backgroundColor: KORI_COLORS.bg.card,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  visibilityOptionActive: {
    borderColor: KORI_COLORS.accent.primary,
    backgroundColor: KORI_COLORS.accent.primary + '10',
  },
  visibilityContent: {
    flex: 1,
  },
  visibilityLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  visibilityLabelActive: {
    color: KORI_COLORS.accent.primary,
  },
  visibilityDesc: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});
