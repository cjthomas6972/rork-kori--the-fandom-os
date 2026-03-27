import React, { useRef, useCallback } from 'react';
import { StyleSheet, Text, Pressable, Animated, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

interface CrescentButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function CrescentButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
}: CrescentButtonProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, glowAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, glowAnim]);

  const handlePress = useCallback(() => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  }, [disabled, onPress]);

  const sizeStyles = {
    small: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 13 },
    medium: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15 },
    large: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17 },
  };

  const currentSize = sizeStyles[size];

  const primaryGradient: [string, string] = disabled
    ? [colors.bg2, colors.bg2]
    : [colors.accentPrimary, colors.accentPrimary + 'DD'];

  const renderContent = () => {
    if (variant === 'primary') {
      return (
        <LinearGradient
          colors={primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            { paddingVertical: currentSize.paddingVertical, paddingHorizontal: currentSize.paddingHorizontal },
          ]}
        >
          {icon}
          <Text
            style={[
              styles.text,
              { fontSize: currentSize.fontSize, color: colors.text0 },
              disabled && { color: colors.text2 },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </LinearGradient>
      );
    }

    return (
      <View style={styles.nonPrimaryContent}>
        {icon}
        <Text
          style={[
            styles.text,
            { fontSize: currentSize.fontSize, color: variant === 'secondary' ? colors.accentSecondary : colors.text1 },
            disabled && { color: colors.text2 },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          variant === 'secondary' && [styles.secondaryButton, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }],
          variant === 'ghost' && styles.ghostButton,
          variant !== 'primary' && {
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
          },
          disabled && styles.disabledButton,
        ]}
      >
        {renderContent()}
        
        {variant === 'primary' && !disabled && (
          <Animated.View
            style={[
              styles.glowOverlay,
              { backgroundColor: colors.accentGold },
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              },
            ]}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.5,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  nonPrimaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
});
