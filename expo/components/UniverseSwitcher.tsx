import { useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  Modal, 
  StyleSheet, 
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { ChevronDown, Check, Plus, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useUniverse } from '@/contexts/UniverseContext';
import KORI_COLORS from '@/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UniverseSwitcherProps {
  compact?: boolean;
}

export default function UniverseSwitcher({ compact = false }: UniverseSwitcherProps) {
  const { 
    selectedUniverse, 
    userUniverses, 
    allUniverses,
    selectUniverse, 
    toggleUniverse,
    isUniverseActive,
  } = useUniverse();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handleOpenModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  const handleSelectUniverse = (universeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    selectUniverse(universeId);
    setModalVisible(false);
    setShowManage(false);
  };

  const handleToggleUniverse = (universeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleUniverse(universeId);
  };

  if (!selectedUniverse) {
    return (
      <Pressable onPress={handleOpenModal} style={styles.emptyTrigger}>
        <Text style={styles.emptyText}>Select Universe</Text>
        <ChevronDown size={16} color={KORI_COLORS.text.secondary} />
      </Pressable>
    );
  }

  return (
    <>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={handleOpenModal}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.trigger, compact && styles.triggerCompact]}
        >
          <View style={[styles.universeIcon, { backgroundColor: selectedUniverse.color + '30' }]}>
            <Text style={styles.iconText}>{selectedUniverse.icon}</Text>
          </View>
          {!compact && (
            <View style={styles.triggerContent}>
              <Text style={styles.triggerLabel}>Current Universe</Text>
              <Text style={styles.triggerName}>{selectedUniverse.name}</Text>
            </View>
          )}
          <ChevronDown size={18} color={KORI_COLORS.text.secondary} />
        </Pressable>
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showManage ? 'Manage Universes' : 'Switch Universe'}
              </Text>
              <Pressable 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={20} color={KORI_COLORS.text.secondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.universeList} showsVerticalScrollIndicator={false}>
              {!showManage ? (
                <>
                  {userUniverses.map(universe => (
                    <Pressable
                      key={universe.id}
                      onPress={() => handleSelectUniverse(universe.id)}
                      style={[
                        styles.universeItem,
                        selectedUniverse.id === universe.id && styles.universeItemActive,
                      ]}
                    >
                      <View style={[styles.universeItemIcon, { backgroundColor: universe.color + '20' }]}>
                        <Text style={styles.universeItemIconText}>{universe.icon}</Text>
                      </View>
                      <View style={styles.universeItemContent}>
                        <Text style={styles.universeItemName}>{universe.name}</Text>
                        <Text style={styles.universeItemCategory}>{universe.category}</Text>
                      </View>
                      {selectedUniverse.id === universe.id && (
                        <View style={[styles.checkMark, { backgroundColor: universe.color }]}>
                          <Check size={12} color={KORI_COLORS.bg.primary} strokeWidth={3} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                  
                  <Pressable
                    onPress={() => setShowManage(true)}
                    style={styles.manageButton}
                  >
                    <Plus size={18} color={KORI_COLORS.accent.gold} />
                    <Text style={styles.manageButtonText}>Add / Remove Universes</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.sectionLabel}>Your Universes</Text>
                  {allUniverses.map(universe => {
                    const isActive = isUniverseActive(universe.id);
                    return (
                      <Pressable
                        key={universe.id}
                        onPress={() => handleToggleUniverse(universe.id)}
                        style={[
                          styles.universeItem,
                          isActive && styles.universeItemActive,
                        ]}
                      >
                        <View style={[styles.universeItemIcon, { backgroundColor: universe.color + '20' }]}>
                          <Text style={styles.universeItemIconText}>{universe.icon}</Text>
                        </View>
                        <View style={styles.universeItemContent}>
                          <Text style={styles.universeItemName}>{universe.name}</Text>
                          <Text style={styles.universeItemCategory}>{universe.category}</Text>
                        </View>
                        <View style={[
                          styles.toggleButton,
                          isActive && { backgroundColor: KORI_COLORS.accent.primary },
                        ]}>
                          {isActive && <Check size={14} color={KORI_COLORS.bg.primary} strokeWidth={3} />}
                        </View>
                      </Pressable>
                    );
                  })}
                  
                  <Pressable
                    onPress={() => setShowManage(false)}
                    style={styles.backButton}
                  >
                    <Text style={styles.backButtonText}>Done</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  triggerCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  universeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  triggerContent: {
    flex: 1,
  },
  triggerLabel: {
    fontSize: 10,
    color: KORI_COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  triggerName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  emptyTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: KORI_COLORS.glass.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  emptyText: {
    fontSize: 14,
    color: KORI_COLORS.text.secondary,
  },
  modalOverlay: {
    flex: 1,
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
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: 40,
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: KORI_COLORS.glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  universeList: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  universeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: KORI_COLORS.bg.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  universeItemActive: {
    borderColor: KORI_COLORS.glass.border,
  },
  universeItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  universeItemIconText: {
    fontSize: 20,
  },
  universeItemContent: {
    flex: 1,
    gap: 2,
  },
  universeItemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  universeItemCategory: {
    fontSize: 12,
    color: KORI_COLORS.text.secondary,
    textTransform: 'capitalize',
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KORI_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: KORI_COLORS.glass.border,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KORI_COLORS.accent.gold + '40',
    borderStyle: 'dashed',
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.accent.gold,
  },
  backButton: {
    alignItems: 'center',
    padding: 14,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: KORI_COLORS.accent.primary,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: KORI_COLORS.text.primary,
  },
});
