import React from 'react';
import { StyleSheet, Text, View, Pressable, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  icon?: React.ReactNode;
  size?: 'small' | 'medium';
  style?: ViewStyle;
  glowOnSelect?: boolean;
}

export function GlassChip({
  label,
  selected = false,
  onPress,
  color,
  icon,
  size = 'medium',
  style,
  glowOnSelect = true,
}: GlassChipProps) {
  const { colors } = useTheme();
  const chipColor = color || colors.accentSecondary;
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const sizeStyles = {
    small: { paddingVertical: 6, paddingHorizontal: 10, fontSize: 11 },
    medium: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 },
  };

  const currentSize = sizeStyles[size];

  const chipContent = (
    <View
      style={[
        styles.chip,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderColor: selected ? chipColor : colors.glassBorder,
          backgroundColor: selected ? chipColor + '15' : colors.chipBg,
        },
        selected && glowOnSelect && {
          shadowColor: chipColor,
          shadowOpacity: 0.4,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.label,
          { fontSize: currentSize.fontSize, color: colors.chipText },
          selected && { color: chipColor },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={handlePress}>
        {chipContent}
      </Pressable>
    );
  }

  return chipContent;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 2,
  },
  label: {
    fontWeight: '500' as const,
  },
});
