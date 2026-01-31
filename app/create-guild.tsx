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
import { X, ChevronDown, Check } from 'lucide-react-native';
import { useUniverse } from '@/contexts/UniverseContext';
import { MistBackground, CrescentButton, GlassChip } from '@/components/lunar';
import { UNIVERSES } from '@/constants/universes';
import KORI_COLORS from '@/constants/colors';

const GUILD_TAGS = [
  'Theories', 'Lore', 'Art', 'Cosplay', 'Gaming', 'Competitive',
  'Casual', 'Discussion', 'News', 'Events', 'Meetups', 'Creative',
];

export default function CreateGuildScreen() {
  const router = useRouter();
  const { selectedUniverseId, userUniverses } = useUniverse();
  
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [universeId, setUniverseId] = useState(selectedUniverseId || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [membersHidden, setMembersHidden] = useState(false);
  const [showUniversePicker, setShowUniversePicker] = useState(false);

  const selectedUniverse = UNIVERSES.find(u => u.id === universeId);

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreate = () => {
    if (!name.trim() || !universeId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const isValid = name.trim().length >= 3 && universeId;

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
          <Text style={styles.headerTitle}>Create Guild</Text>
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
              <Text style={styles.label}>Guild Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter guild name"
                placeholderTextColor={KORI_COLORS.text.tertiary}
                maxLength={50}
              />
              <Text style={styles.hint}>{name.length}/50 characters</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Tagline</Text>
              <TextInput
                style={styles.input}
                value={tagline}
                onChangeText={setTagline}
                placeholder="A short motto for your guild"
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
                placeholder="What is your guild about?"
                placeholderTextColor={KORI_COLORS.text.tertiary}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Tags (up to 5)</Text>
              <View style={styles.tagsContainer}>
                {GUILD_TAGS.map(tag => (
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
              <Pressable
                style={styles.toggle}
                onPress={() => {
                  setMembersHidden(!membersHidden);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleLabel}>Hide Member List</Text>
                  <Text style={styles.toggleHint}>
                    Members will only be visible to other members
                  </Text>
                </View>
                <View style={[
                  styles.toggleSwitch,
                  membersHidden && styles.toggleSwitchActive,
                ]}>
                  <View style={[
                    styles.toggleKnob,
                    membersHidden && styles.toggleKnobActive,
                  ]} />
                </View>
              </Pressable>
            </View>

            <View style={styles.buttonContainer}>
              <CrescentButton
                title="Create Guild"
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
  hint: {
    fontSize: 12,
    color: KORI_COLORS.text.tertiary,
    marginTop: 6,
    textAlign: 'right',
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  toggleContent: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  toggleHint: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: KORI_COLORS.glass.bg,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: KORI_COLORS.accent.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: KORI_COLORS.text.primary,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    marginTop: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});
