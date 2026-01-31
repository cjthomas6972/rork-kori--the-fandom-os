import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  Shield,
  Eye,
  EyeOff,
  MapPin,
  MessageCircle,
  Ban,
  ChevronRight,
  Check,
  Sun,
  Moon,
  Smartphone,
  Palette,
} from 'lucide-react-native';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { getSocialUserById, SOCIAL_USERS } from '@/mocks/socialUsers';
import { MistBackground } from '@/components/lunar';
import PlanetHeader from '@/components/PlanetHeader';

const CURRENT_USER_ID = 'user_001';

export default function PlanetSettingsScreen() {
  const { colors, themeMode, setThemeMode } = useTheme();
  const currentUser = useMemo(() => getSocialUserById(CURRENT_USER_ID), []);

  const [showDistance, setShowDistance] = useState(currentUser?.safety.showDistance ?? true);
  const [showLocation, setShowLocation] = useState<'off' | 'cityOnly' | 'approxArea'>(
    currentUser?.safety.showLocation || 'cityOnly'
  );
  const [allowDMsFrom, setAllowDMsFrom] = useState<'everyone' | 'alignedOnly' | 'friendsOnly'>(
    currentUser?.safety.allowDMsFrom || 'everyone'
  );

  const handleSave = useCallback(() => {
    const userIndex = SOCIAL_USERS.findIndex(u => u.id === CURRENT_USER_ID);
    if (userIndex !== -1) {
      SOCIAL_USERS[userIndex] = {
        ...SOCIAL_USERS[userIndex],
        safety: {
          ...SOCIAL_USERS[userIndex].safety,
          showDistance,
          showLocation,
          allowDMsFrom,
        },
      };
    }
    
    Alert.alert('Saved', 'Settings updated successfully!');
    console.log('[PlanetSettings] Settings saved');
  }, [showDistance, showLocation, allowDMsFrom]);

  const renderOption = (
    label: string,
    value: string,
    isSelected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[
        styles.option,
        { backgroundColor: colors.bg2 },
        isSelected && { backgroundColor: colors.glowMoon, borderWidth: 1, borderColor: colors.accentGold },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, { color: colors.text1 }, isSelected && { color: colors.accentGold, fontWeight: '500' as const }]}>{label}</Text>
      {isSelected && <Check size={18} color={colors.accentGold} />}
    </TouchableOpacity>
  );

  const renderThemeOption = (
    mode: ThemeMode,
    label: string,
    icon: React.ReactNode
  ) => {
    const isSelected = themeMode === mode;
    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          { backgroundColor: colors.bg2, borderColor: colors.border0 },
          isSelected && { backgroundColor: colors.glowMoon, borderColor: colors.accentGold },
        ]}
        onPress={() => setThemeMode(mode)}
      >
        {icon}
        <Text style={[styles.themeLabel, { color: colors.text1 }, isSelected && { color: colors.accentGold }]}>{label}</Text>
        {isSelected && (
          <View style={[styles.themeCheck, { backgroundColor: colors.accentGold }]}>
            <Check size={12} color={colors.bg0} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const SaveButton = (
    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
      <Text style={[styles.saveButtonText, { color: colors.accentGold }]}>Save</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg0 }]}>
      <MistBackground />
      <PlanetHeader title="Settings" rightAction={SaveButton} />
      <View style={styles.contentArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.section, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
            <View style={styles.sectionHeader}>
              <Palette size={20} color={colors.accentGold} />
              <Text style={[styles.sectionTitle, { color: colors.text0 }]}>Appearance</Text>
            </View>

            <View style={styles.themeContainer}>
              {renderThemeOption('system', 'System', <Smartphone size={20} color={themeMode === 'system' ? colors.accentGold : colors.text2} />)}
              {renderThemeOption('light', 'Light', <Sun size={20} color={themeMode === 'light' ? colors.accentGold : colors.text2} />)}
              {renderThemeOption('dark', 'Dark', <Moon size={20} color={themeMode === 'dark' ? colors.accentGold : colors.text2} />)}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
            <View style={[styles.sectionHeader, { borderBottomColor: colors.glassBorder }]}>
              <Shield size={20} color={colors.accentGold} />
              <Text style={[styles.sectionTitle, { color: colors.text0 }]}>Privacy & Safety</Text>
            </View>

            <View style={[styles.settingGroup, { borderBottomColor: colors.glassBorder }]}>
              <View style={styles.settingHeader}>
                <MessageCircle size={18} color={colors.text1} />
                <Text style={[styles.settingLabel, { color: colors.text0 }]}>Who can DM you?</Text>
              </View>
              <View style={styles.optionsContainer}>
                {renderOption('Everyone', 'everyone', allowDMsFrom === 'everyone', () => setAllowDMsFrom('everyone'))}
                {renderOption('Aligned Only', 'alignedOnly', allowDMsFrom === 'alignedOnly', () => setAllowDMsFrom('alignedOnly'))}
                {renderOption('Friends Only', 'friendsOnly', allowDMsFrom === 'friendsOnly', () => setAllowDMsFrom('friendsOnly'))}
              </View>
            </View>

            <View style={[styles.settingGroup, { borderBottomColor: colors.glassBorder }]}>
              <View style={styles.settingHeader}>
                <MapPin size={18} color={colors.text1} />
                <Text style={[styles.settingLabel, { color: colors.text0 }]}>Show Location</Text>
              </View>
              <View style={styles.optionsContainer}>
                {renderOption('Hidden', 'off', showLocation === 'off', () => setShowLocation('off'))}
                {renderOption('City Only', 'cityOnly', showLocation === 'cityOnly', () => setShowLocation('cityOnly'))}
                {renderOption('Approximate Area', 'approxArea', showLocation === 'approxArea', () => setShowLocation('approxArea'))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.toggleSetting}
              onPress={() => setShowDistance(!showDistance)}
            >
              <View style={styles.toggleInfo}>
                {showDistance ? (
                  <Eye size={18} color={colors.text1} />
                ) : (
                  <EyeOff size={18} color={colors.text1} />
                )}
                <Text style={[styles.toggleLabel, { color: colors.text0 }]}>Show Distance to Others</Text>
              </View>
              <View style={[
                styles.toggle,
                { backgroundColor: colors.bg2, borderColor: colors.glassBorder },
                showDistance && { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary },
              ]}>
                {showDistance && <Check size={14} color={colors.text0} />}
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
            <View style={[styles.sectionHeader, { borderBottomColor: colors.glassBorder }]}>
              <Ban size={20} color={colors.accentPrimary} />
              <Text style={[styles.sectionTitle, { color: colors.text0 }]}>Block List</Text>
            </View>

            <TouchableOpacity style={styles.navItem}>
              <View style={styles.navItemLeft}>
                <Text style={[styles.navItemText, { color: colors.text0 }]}>Manage Blocked Users</Text>
                <Text style={[styles.navItemSubtext, { color: colors.text2 }]}>
                  {currentUser?.safety.blockedUserIds.length || 0} blocked
                </Text>
              </View>
              <ChevronRight size={20} color={colors.text2} />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  settingGroup: {
    padding: 16,
    borderBottomWidth: 1,
  },
  themeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  themeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 14,
  },
  toggleSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    fontSize: 14,
  },
  toggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  navItemLeft: {
    flex: 1,
  },
  navItemText: {
    fontSize: 14,
  },
  navItemSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
});
