import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  X,
  Target,
  Sparkles,
  Check,
  Image as ImageIcon,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useUniverse } from '@/contexts/UniverseContext';
import { useEntitlements } from '@/contexts/EntitlementsContext';
import { MistBackground, GlassChip } from '@/components/lunar';
import { LOOKING_FOR } from '@/types/social';

const CURRENT_USER_ID = 'user_001';

export default function BeaconComposerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { selectedUniverseId, selectedUniverse } = useUniverse();
  const { hasUniversePass, dropBeacon } = useEntitlements();
  
  const [content, setContent] = useState('');
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const toggleLookingFor = useCallback((item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLookingFor(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  }, []);

  const handlePublish = useCallback(() => {
    if (!selectedUniverseId || !hasUniversePass || !content.trim()) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dropBeacon({
      userId: CURRENT_USER_ID,
      universeId: selectedUniverseId,
      content: content.trim(),
      lookingFor: selectedLookingFor,
    });
    
    setTimeout(() => {
      router.back();
    }, 300);
  }, [selectedUniverseId, hasUniversePass, content, selectedLookingFor, dropBeacon, router]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleGetPass = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/universe-pass');
  }, [router]);

  const canPublish = hasUniversePass && content.trim().length > 0 && selectedLookingFor.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg0 }]}>
      <MistBackground />
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={colors.text1} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Target size={18} color={colors.accentSecondary} />
              <Text style={[styles.headerTitle, { color: colors.text0 }]}>Drop a Beacon</Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              style={[
                styles.formSection,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                }
              ]}
            >
              <View style={[styles.universeTag, { backgroundColor: colors.bg1, borderColor: colors.glassBorder }]}>
                <Text style={[styles.universeTagText, { color: colors.text1 }]}>
                  Broadcasting in {selectedUniverse?.name || 'Unknown'}
                </Text>
              </View>

              <View style={[styles.inputCard, { backgroundColor: colors.bg1, borderColor: colors.glassBorder }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.text0 }]}
                  placeholder="What are you seeking in this universe?"
                  placeholderTextColor={colors.text2}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  maxLength={200}
                />
                <View style={styles.inputFooter}>
                  <TouchableOpacity style={[styles.imageButton, { backgroundColor: colors.bg2 }]}>
                    <ImageIcon size={18} color={colors.text2} />
                  </TouchableOpacity>
                  <Text style={[styles.charCount, { color: colors.text2 }]}>
                    {content.length}/200
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text0 }]}>Looking For</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.text2 }]}>
                  Select what you are seeking (at least 1)
                </Text>
                <View style={styles.chipsContainer}>
                  {LOOKING_FOR.map(item => {
                    const isSelected = selectedLookingFor.includes(item);
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.chip,
                          { 
                            backgroundColor: isSelected ? colors.accentSecondary + '20' : colors.bg1,
                            borderColor: isSelected ? colors.accentSecondary : colors.glassBorder,
                          }
                        ]}
                        onPress={() => toggleLookingFor(item)}
                      >
                        <Text 
                          style={[
                            styles.chipText, 
                            { color: isSelected ? colors.accentSecondary : colors.text1 }
                          ]}
                        >
                          {item.replace(/-/g, ' ')}
                        </Text>
                        {isSelected && <Check size={14} color={colors.accentSecondary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={[styles.previewCard, { backgroundColor: colors.bg1, borderColor: colors.glassBorder }]}>
                <View style={styles.previewHeader}>
                  <Target size={16} color={colors.accentSecondary} />
                  <Text style={[styles.previewTitle, { color: colors.text0 }]}>Beacon Preview</Text>
                </View>
                <View style={[styles.previewDivider, { backgroundColor: colors.glassBorder }]} />
                <Text style={[styles.previewContent, { color: content ? colors.text0 : colors.text2 }]}>
                  {content || 'Your message will appear here...'}
                </Text>
                {selectedLookingFor.length > 0 && (
                  <View style={styles.previewChips}>
                    {selectedLookingFor.slice(0, 3).map(item => (
                      <GlassChip key={item} label={item.replace(/-/g, ' ')} size="small" />
                    ))}
                  </View>
                )}
              </View>

              {!hasUniversePass && (
                <View style={[styles.passRequired, { backgroundColor: colors.bg1, borderColor: colors.accentGold }]}>
                  <Sparkles size={20} color={colors.accentGold} />
                  <Text style={[styles.passRequiredText, { color: colors.text0 }]}>
                    Universe Pass required
                  </Text>
                </View>
              )}
            </Animated.View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.glassBorder }]}>
            {hasUniversePass ? (
              <TouchableOpacity
                style={[
                  styles.publishButton, 
                  { backgroundColor: canPublish ? colors.accentSecondary : colors.bg2 }
                ]}
                onPress={handlePublish}
                disabled={!canPublish}
                activeOpacity={0.8}
              >
                <Target size={20} color={canPublish ? colors.text0 : colors.text2} />
                <Text 
                  style={[
                    styles.publishButtonText, 
                    { color: canPublish ? colors.text0 : colors.text2 }
                  ]}
                >
                  Publish Beacon
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.publishButton, { backgroundColor: colors.accentGold }]}
                onPress={handleGetPass}
                activeOpacity={0.8}
              >
                <Sparkles size={20} color={colors.bg0} />
                <Text style={[styles.publishButtonText, { color: colors.bg0 }]}>
                  Get Universe Pass
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formSection: {
    gap: 20,
  },
  universeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  universeTagText: {
    fontSize: 13,
  },
  inputCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  textInput: {
    fontSize: 15,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  imageButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charCount: {
    fontSize: 12,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    textTransform: 'capitalize',
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  previewDivider: {
    height: 1,
    marginBottom: 12,
  },
  previewContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  previewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  passRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  passRequiredText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
