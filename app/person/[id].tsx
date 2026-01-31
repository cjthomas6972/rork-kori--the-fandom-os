import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, MapPin, MessageCircle, UserPlus } from 'lucide-react-native';
import { getUserById } from '@/mocks/users';
import { useIdentity } from '@/contexts/IdentityContext';
import { calculateResonance, getResonanceLabel } from '@/services/CompatibilityService';
import { UNIVERSES } from '@/constants/universes';
import { ARCHETYPES, INTENTS } from '@/constants/archetypes';
import { MistBackground, SigilLoader, CrescentButton, GlassChip, ResonanceMeter, SakuraPetals } from '@/components/lunar';
import { getResonanceColor } from '@/components/lunar/ResonanceMeter';
import KORI_COLORS from '@/constants/colors';

export default function PersonProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { identity } = useIdentity();

  const person = useMemo(() => id ? getUserById(id) : undefined, [id]);

  const resonance = useMemo(() => {
    if (!identity || !person) return null;
    return calculateResonance(identity, person);
  }, [identity, person]);

  const personUniverses = useMemo(() => {
    if (!person) return [];
    return UNIVERSES.filter(u => person.universes.includes(u.id));
  }, [person]);

  const personArchetypes = useMemo(() => {
    if (!person) return [];
    return ARCHETYPES.filter(a => person.archetypes.includes(a.id));
  }, [person]);

  const personIntents = useMemo(() => {
    if (!person) return [];
    return INTENTS.filter(i => person.intents.includes(i.id));
  }, [person]);

  if (!person) {
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
      <MistBackground showMoonGlow intensity="medium" />
      <SakuraPetals count={4} enabled duration={10000} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow} />
              <View style={styles.avatarRing} />
              <View style={[styles.avatar, { backgroundColor: person.avatarColor }]}>
                <Text style={styles.avatarText}>{person.displayName[0]}</Text>
              </View>
            </View>
            
            <Text style={styles.displayName}>{person.displayName}</Text>
            <Text style={styles.username}>@{person.username}</Text>

            {person.location && (
              <View style={styles.locationBadge}>
                <MapPin size={13} color={KORI_COLORS.text.secondary} />
                <Text style={styles.locationText}>
                  {person.location.city}, {person.location.country}
                </Text>
              </View>
            )}

            {resonance && (
              <View style={styles.resonanceSection}>
                <LinearGradient
                  colors={[getResonanceColor(resonance.score) + '12', 'transparent']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                />
                
                <ResonanceMeter score={resonance.score} size={110} />
                <Text style={styles.resonanceLabel}>{getResonanceLabel(resonance.score)}</Text>
                
                <View style={styles.resonanceBreakdown}>
                  {[
                    { label: 'Universes', value: resonance.breakdown.universes },
                    { label: 'Canon', value: resonance.breakdown.canonAnchors },
                    { label: 'Archetypes', value: resonance.breakdown.archetypes },
                    { label: 'Intent', value: resonance.breakdown.intents },
                  ].map(item => (
                    <View key={item.label} style={styles.breakdownItem}>
                      <View style={styles.breakdownBar}>
                        <View 
                          style={[
                            styles.breakdownFill, 
                            { 
                              width: `${item.value}%`,
                              backgroundColor: getResonanceColor(item.value),
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.breakdownLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.actionButtons}>
              <CrescentButton
                title="Message"
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                variant="primary"
                size="medium"
                style={styles.messageButton}
                icon={<MessageCircle size={18} color={KORI_COLORS.text.primary} />}
              />
              <ActionIconButton
                icon={<UserPlus size={18} color={KORI_COLORS.accent.gold} />}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              />
            </View>
          </View>

          {person.bio && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.moonHalo} />
                <Text style={styles.sectionTitle}>About</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.bioText}>{person.bio}</Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.moonHalo} />
              <Text style={styles.sectionTitle}>Canon</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Universes</Text>
              <View style={styles.universeList}>
                {personUniverses.map(universe => (
                  <Pressable
                    key={universe.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/universe/${universe.id}`);
                    }}
                    style={styles.universeItem}
                  >
                    <View style={[styles.universeDot, { backgroundColor: universe.color, shadowColor: universe.color }]} />
                    <Text style={styles.universeItemText}>{universe.name}</Text>
                    {resonance?.sharedUniverses.includes(universe.id) && (
                      <GlassChip label="Shared" size="small" color={KORI_COLORS.status.success} />
                    )}
                  </Pressable>
                ))}
              </View>

              {Object.entries(person.canonAnchors).length > 0 && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.cardLabel}>Canon Anchors</Text>
                  <View style={styles.canonList}>
                    {Object.entries(person.canonAnchors).map(([universeId, canons]) => {
                      const universe = UNIVERSES.find(u => u.id === universeId);
                      return canons.map(canon => (
                        <GlassChip
                          key={`${universeId}-${canon}`}
                          label={canon}
                          color={universe?.color}
                          size="small"
                          selected={resonance?.sharedCanon.includes(canon)}
                        />
                      ));
                    })}
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.moonHalo} />
              <Text style={styles.sectionTitle}>Alignment</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Archetypes</Text>
              <View style={styles.archetypeList}>
                {personArchetypes.map(archetype => (
                  <View key={archetype.id} style={styles.archetypeItem}>
                    <LinearGradient
                      colors={[archetype.color + '15', archetype.color + '05']}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <View style={[styles.archetypeEmber, { backgroundColor: archetype.color }]} />
                    <Text style={styles.archetypeIcon}>{archetype.icon}</Text>
                    <View style={styles.archetypeContent}>
                      <View style={styles.archetypeNameRow}>
                        <Text style={[styles.archetypeName, { color: archetype.color }]}>
                          {archetype.name}
                        </Text>
                        {resonance?.sharedArchetypes.includes(archetype.id) && (
                          <GlassChip label="Match" size="small" color={archetype.color} />
                        )}
                      </View>
                      <Text style={styles.archetypeDesc}>{archetype.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.divider} />

              <Text style={styles.cardLabel}>Intent</Text>
              <View style={styles.intentList}>
                {personIntents.map(intent => (
                  <View key={intent.id} style={styles.intentItem}>
                    <Text style={styles.intentIcon}>{intent.icon}</Text>
                    <Text style={styles.intentLabel}>{intent.label}</Text>
                    {resonance?.sharedIntents.includes(intent.id) && (
                      <GlassChip label="Match" size="small" color={intent.color} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
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
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.backButton}
      >
        <ArrowLeft size={22} color={KORI_COLORS.text.primary} />
      </Pressable>
    </Animated.View>
  );
}

function ActionIconButton({ icon, onPress }: { icon: React.ReactNode; onPress: () => void }) {
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
        style={styles.actionIconButton}
      >
        {icon}
      </Pressable>
    </Animated.View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: KORI_COLORS.glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 20,
    gap: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: KORI_COLORS.lunar.moonGold,
    opacity: 0.12,
  },
  avatarRing: {
    position: 'absolute',
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 2,
    borderColor: KORI_COLORS.lunar.moonGold + '50',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: KORI_COLORS.bg.primary,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  username: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  locationText: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
  },
  resonanceSection: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  resonanceLabel: {
    fontSize: 13,
    color: KORI_COLORS.text.secondary,
  },
  resonanceBreakdown: {
    width: '100%',
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownBar: {
    flex: 1,
    height: 5,
    backgroundColor: KORI_COLORS.bg.elevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownLabel: {
    width: 68,
    fontSize: 10,
    color: KORI_COLORS.text.tertiary,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  messageButton: {
    flex: 1,
  },
  actionIconButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: KORI_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: KORI_COLORS.lunar.moonGold + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  moonHalo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: KORI_COLORS.lunar.moonGold + '15',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  card: {
    backgroundColor: KORI_COLORS.bg.card,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  bioText: {
    fontSize: 14,
    color: KORI_COLORS.text.primary,
    lineHeight: 20,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  universeList: {
    gap: 10,
  },
  universeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  universeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  universeItemText: {
    flex: 1,
    fontSize: 14,
    color: KORI_COLORS.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: KORI_COLORS.border.subtle,
  },
  canonList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  archetypeList: {
    gap: 10,
  },
  archetypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: KORI_COLORS.bg.elevated,
    borderRadius: 12,
    overflow: 'hidden',
  },
  archetypeEmber: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  archetypeIcon: {
    fontSize: 24,
  },
  archetypeContent: {
    flex: 1,
    gap: 3,
  },
  archetypeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  archetypeName: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  archetypeDesc: {
    fontSize: 11,
    color: KORI_COLORS.text.secondary,
    lineHeight: 15,
  },
  intentList: {
    gap: 10,
  },
  intentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  intentIcon: {
    fontSize: 16,
  },
  intentLabel: {
    flex: 1,
    fontSize: 14,
    color: KORI_COLORS.text.primary,
  },
  bottomSpacer: {
    height: 40,
  },
});
