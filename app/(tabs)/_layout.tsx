import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';
import { getUnreadCount } from '@/services/SocialService';
import {
  PortalGateIcon,
  ScrollStreamIcon,
  ResonanceCrescentIcon,
  PlanetBannerIcon,
  SignalOrbIcon,
  HomeMoonIcon,
} from '@/components/KoriTabIcons';

export default function TabLayout() {
  const { colors } = useTheme();
  const unreadCount = getUnreadCount('user_001');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.tabBarBg,
            borderTopColor: colors.glassBorder,
          },
        ],
        tabBarActiveTintColor: colors.accentGold,
        tabBarInactiveTintColor: colors.text2,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={40}
              tint={colors.blurTint}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBarBg }]} />
          )
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconWrapper}>
              <PortalGateIcon color={color} size={size} focused={focused} />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.accentPrimary }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconWrapper}>
              <ScrollStreamIcon color={color} size={size} focused={focused} />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.accentPrimary }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="aligned"
        options={{
          title: 'Aligned',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconWrapper}>
              <ResonanceCrescentIcon color={color} size={size} focused={focused} />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.accentPrimary }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="guilds"
        options={{
          title: 'Guilds',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconWrapper}>
              <PlanetBannerIcon color={color} size={size} focused={focused} />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.accentPrimary }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconWrapper}>
              <View>
                <SignalOrbIcon color={color} size={size} focused={focused} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <View style={[styles.badgeDot, { backgroundColor: colors.accentPrimary, shadowColor: colors.accentPrimary }]} />
                  </View>
                )}
              </View>
              {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.accentPrimary }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="planet"
        options={{
          title: 'My Planet',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconWrapper}>
              <HomeMoonIcon color={color} size={size} focused={focused} />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: colors.accentPrimary }]} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    paddingTop: 8,
    position: 'absolute' as const,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600' as const,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 16,
    height: 3,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
