import { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useIdentity } from '@/contexts/IdentityContext';
import { OnboardingState } from '@/types/identity';
import { UNIVERSES, CANON_ANCHORS } from '@/constants/universes';
import { ARCHETYPES, INTENTS, IntentType } from '@/constants/archetypes';
import { MistBackground, CrescentButton, GlassChip, SakuraPetals } from '@/components/lunar';
import KORI_COLORS from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useIdentity();
  
  const [step, setStep] = useState(0);
  const [state, setState] = useState<OnboardingState>({
    step: 0,
    universes: [],
    canonAnchors: {},
    archetypes: [],
    intents: [],
    visibility: 'public',
  });

  const progressAnim = useRef(new Animated.Value(0)).current;

  const updateState = (updates: Partial<OnboardingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < 4) {
      const nextStep = step + 1;
      setStep(nextStep);
      Animated.timing(progressAnim, {
        toValue: nextStep / 4,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      completeOnboarding(state);
      router.replace('/home');
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      Animated.timing(progressAnim, {
        toValue: prevStep / 4,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return state.universes.length > 0;
      case 1: return Object.keys(state.canonAnchors).length > 0;
      case 2: return state.archetypes.length > 0;
      case 3: return state.intents.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const toggleUniverse = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newUniverses = state.universes.includes(id)
      ? state.universes.filter(u => u !== id)
      : [...state.universes, id];
    updateState({ universes: newUniverses });
  };

  const toggleCanon = (universeId: string, canon: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = state.canonAnchors[universeId] || [];
    const newCanons = current.includes(canon)
      ? current.filter(c => c !== canon)
      : [...current, canon];
    
    updateState({
      canonAnchors: {
        ...state.canonAnchors,
        [universeId]: newCanons,
      },
    });
  };

  const toggleArchetype = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newArchetypes = state.archetypes.includes(id)
      ? state.archetypes.filter(a => a !== id)
      : [...state.archetypes, id];
    updateState({ archetypes: newArchetypes });
  };

  const toggleIntent = (id: IntentType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newIntents = state.intents.includes(id)
      ? state.intents.filter(i => i !== id)
      : [...state.intents, id];
    updateState({ intents: newIntents });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.moonHalo} />
              <Text style={styles.stepTitle}>Choose Your Universes</Text>
            </View>
            <Text style={styles.stepSubtitle}>Select the worlds that define you</Text>
            
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.grid}>
                {UNIVERSES.map(universe => {
                  const isSelected = state.universes.includes(universe.id);
                  return (
                    <UniverseSelectCard
                      key={universe.id}
                      universe={universe}
                      isSelected={isSelected}
                      onPress={() => toggleUniverse(universe.id)}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
        );

      case 1:
        const selectedUniverses = UNIVERSES.filter(u => state.universes.includes(u.id));
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.moonHalo} />
              <Text style={styles.stepTitle}>Select Canon Anchors</Text>
            </View>
            <Text style={styles.stepSubtitle}>The titles that shaped you</Text>
            
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {selectedUniverses.map(universe => (
                <View key={universe.id} style={styles.canonSection}>
                  <View style={styles.canonHeader}>
                    <Text style={styles.canonIcon}>{universe.icon}</Text>
                    <Text style={styles.canonTitle}>{universe.name}</Text>
                  </View>
                  <View style={styles.canonGrid}>
                    {CANON_ANCHORS[universe.id]?.map(canon => {
                      const isSelected = state.canonAnchors[universe.id]?.includes(canon);
                      return (
                        <GlassChip
                          key={canon}
                          label={canon}
                          selected={isSelected}
                          onPress={() => toggleCanon(universe.id, canon)}
                          color={universe.color}
                        />
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.moonHalo} />
              <Text style={styles.stepTitle}>Choose Your Archetype</Text>
            </View>
            <Text style={styles.stepSubtitle}>How do you show up in the world?</Text>
            
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.archetypeList}>
                {ARCHETYPES.map(archetype => {
                  const isSelected = state.archetypes.includes(archetype.id);
                  return (
                    <ArchetypeCard
                      key={archetype.id}
                      archetype={archetype}
                      isSelected={isSelected}
                      onPress={() => toggleArchetype(archetype.id)}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.moonHalo} />
              <Text style={styles.stepTitle}>What Are You Seeking?</Text>
            </View>
            <Text style={styles.stepSubtitle}>Define your intent on Kori</Text>
            
            <View style={styles.intentList}>
              {INTENTS.map(intent => {
                const isSelected = state.intents.includes(intent.id);
                return (
                  <IntentCard
                    key={intent.id}
                    intent={intent}
                    isSelected={isSelected}
                    onPress={() => toggleIntent(intent.id)}
                  />
                );
              })}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.moonHalo} />
              <Text style={styles.stepTitle}>Choose Your Visibility</Text>
            </View>
            <Text style={styles.stepSubtitle}>Control who can discover you</Text>
            
            <View style={styles.visibilityList}>
              {[
                { id: 'public' as const, label: 'Public', desc: 'Anyone can find you', icon: '🌍' },
                { id: 'selective' as const, label: 'Selective', desc: 'Only aligned people see you', icon: '🎯' },
                { id: 'private' as const, label: 'Private', desc: 'You control all discovery', icon: '🔒' },
              ].map(vis => {
                const isSelected = state.visibility === vis.id;
                return (
                  <VisibilityCard
                    key={vis.id}
                    visibility={vis}
                    isSelected={isSelected}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateState({ visibility: vis.id });
                    }}
                  />
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <MistBackground showMoonGlow intensity="low" />
      <SakuraPetals count={5} enabled={step === 4} />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.sigilMark} />
            <Text style={styles.logo}>KORI</Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
            <View style={styles.progressTrack}>
              {[0, 1, 2, 3, 4].map(i => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    i <= step && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {renderStep()}

        <View style={styles.footer}>
          {step > 0 && (
            <CrescentButton
              title="Back"
              onPress={handleBack}
              variant="ghost"
              size="medium"
              style={styles.backButton}
            />
          )}
          
          <CrescentButton
            title={step === 4 ? 'Enter the Multiverse' : 'Continue'}
            onPress={handleNext}
            disabled={!canProceed()}
            variant="primary"
            size="large"
            style={styles.nextButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function UniverseSelectCard({ universe, isSelected, onPress }: { 
  universe: typeof UNIVERSES[0]; 
  isSelected: boolean; 
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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.universeCard, isSelected && styles.universeCardSelected]}
      >
        {isSelected && (
          <LinearGradient
            colors={[universe.color + '25', universe.color + '08']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <Text style={styles.universeIcon}>{universe.icon}</Text>
        <Text style={styles.universeName}>{universe.name}</Text>
        {isSelected && (
          <>
            <View style={[styles.universeBorder, { borderColor: universe.color }]} />
            <View style={[styles.universeEmberTop, { backgroundColor: universe.color }]} />
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

function ArchetypeCard({ archetype, isSelected, onPress }: {
  archetype: typeof ARCHETYPES[0];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.archetypeCard, isSelected && styles.archetypeCardSelected]}
      >
        {isSelected && (
          <LinearGradient
            colors={[archetype.color + '20', archetype.color + '05']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <View style={styles.archetypeHeader}>
          <Text style={styles.archetypeIcon}>{archetype.icon}</Text>
          <Text style={[styles.archetypeName, isSelected && { color: archetype.color }]}>
            {archetype.name}
          </Text>
        </View>
        <Text style={styles.archetypeDesc}>{archetype.description}</Text>
        {isSelected && (
          <>
            <View style={[styles.archetypeBorder, { borderColor: archetype.color }]} />
            <View style={[styles.archetypeEmberTop, { backgroundColor: archetype.color }]} />
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

function IntentCard({ intent, isSelected, onPress }: {
  intent: typeof INTENTS[number];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.intentCard, isSelected && styles.intentCardSelected]}
      >
        {isSelected && (
          <LinearGradient
            colors={[intent.color + '20', intent.color + '08']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <Text style={styles.intentIcon}>{intent.icon}</Text>
        <Text style={[styles.intentLabel, isSelected && { color: intent.color }]}>
          {intent.label}
        </Text>
        {isSelected && (
          <View style={[styles.intentBorder, { borderColor: intent.color }]} />
        )}
      </Pressable>
    </Animated.View>
  );
}

function VisibilityCard({ visibility, isSelected, onPress }: {
  visibility: { id: string; label: string; desc: string; icon: string };
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.visibilityCard, isSelected && styles.visibilityCardSelected]}
      >
        <Text style={styles.visibilityIcon}>{visibility.icon}</Text>
        <View style={styles.visibilityContent}>
          <Text style={[styles.visibilityLabel, isSelected && { color: KORI_COLORS.accent.gold }]}>
            {visibility.label}
          </Text>
          <Text style={styles.visibilityDesc}>{visibility.desc}</Text>
        </View>
        {isSelected && <View style={styles.visibilityBorder} />}
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
    padding: 20,
    gap: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sigilMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: KORI_COLORS.lunar.moonGold,
    shadowColor: KORI_COLORS.lunar.moonGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
    letterSpacing: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: KORI_COLORS.bg.elevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: KORI_COLORS.accent.primary,
    borderRadius: 2,
  },
  progressTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    height: 4,
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: KORI_COLORS.bg.card,
    borderWidth: 2,
    borderColor: KORI_COLORS.bg.elevated,
  },
  progressDotActive: {
    backgroundColor: KORI_COLORS.accent.primary,
    borderColor: KORI_COLORS.accent.primary,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  moonHalo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: KORI_COLORS.lunar.moonGold + '15',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  stepSubtitle: {
    fontSize: 15,
    color: KORI_COLORS.text.secondary,
    marginBottom: 20,
    marginLeft: 44,
  },
  scrollContent: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 20,
  },
  universeCard: {
    width: (width - 52) / 2,
    aspectRatio: 1.2,
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  universeCardSelected: {
    borderColor: 'transparent',
  },
  universeIcon: {
    fontSize: 36,
  },
  universeName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    textAlign: 'center',
  },
  universeBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 14,
  },
  universeEmberTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  canonSection: {
    marginBottom: 24,
  },
  canonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  canonIcon: {
    fontSize: 22,
  },
  canonTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  canonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  archetypeList: {
    gap: 12,
    paddingBottom: 20,
  },
  archetypeCard: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 18,
    gap: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  archetypeCardSelected: {
    borderColor: 'transparent',
  },
  archetypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  archetypeIcon: {
    fontSize: 28,
  },
  archetypeName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  archetypeDesc: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
    lineHeight: 20,
  },
  archetypeBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 14,
  },
  archetypeEmberTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  intentList: {
    gap: 12,
  },
  intentCard: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  intentCardSelected: {
    borderColor: 'transparent',
  },
  intentIcon: {
    fontSize: 28,
  },
  intentLabel: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  intentBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 14,
  },
  visibilityList: {
    gap: 12,
  },
  visibilityCard: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  visibilityCardSelected: {
    backgroundColor: KORI_COLORS.bg.elevated,
    borderColor: KORI_COLORS.lunar.moonGold + '40',
  },
  visibilityIcon: {
    fontSize: 28,
  },
  visibilityContent: {
    flex: 1,
    gap: 4,
  },
  visibilityLabel: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  visibilityDesc: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
  },
  visibilityBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: KORI_COLORS.accent.gold,
    borderRadius: 14,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  backButton: {
    minWidth: 80,
  },
  nextButton: {
    flex: 1,
  },
});
