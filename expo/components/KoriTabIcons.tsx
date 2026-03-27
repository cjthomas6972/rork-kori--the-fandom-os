import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Ellipse, Line, G } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

interface TabIconProps {
  color: string;
  size: number;
  focused?: boolean;
}

const STROKE_WIDTH = 1.8;

export const PortalGateIcon = ({ color, size, focused }: TabIconProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="12"
          cy="13"
          r="8"
          stroke={focused ? colors.accentPrimary : color}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Path
          d="M8 4C9.5 2.5 10.5 2 12 2C13.5 2 14.5 2.5 16 4"
          stroke={focused ? colors.accentPrimary : color}
          strokeWidth={STROKE_WIDTH + 0.5}
          strokeLinecap="round"
          fill="none"
        />
        {focused && (
          <Circle cx="12" cy="13" r="3" fill={colors.accentPrimary} opacity={0.4} />
        )}
      </Svg>
    </View>
  );
};

export const ScrollStreamIcon = ({ color, size, focused }: TabIconProps) => {
  const { colors } = useTheme();
  const activeColor = focused ? colors.accentPrimary : color;
  
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Line
          x1="4"
          y1="7"
          x2="16"
          y2="7"
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />
        <Line
          x1="4"
          y1="12"
          x2="14"
          y2="12"
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />
        <Line
          x1="4"
          y1="17"
          x2="12"
          y2="17"
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />
        <Circle
          cx="19"
          cy="6"
          r="3"
          fill={focused ? colors.accentPrimary : color}
        />
        {focused && (
          <Circle cx="19" cy="6" r="5" stroke={colors.accentPrimary} strokeWidth={1} opacity={0.4} fill="none" />
        )}
      </Svg>
    </View>
  );
};

export const ResonanceCrescentIcon = ({ color, size, focused }: TabIconProps) => {
  const { colors } = useTheme();
  const activeColor = focused ? colors.accentPrimary : color;
  
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8 5C8 5 14 8 14 12C14 16 8 19 8 19"
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M16 5C16 5 10 8 10 12C10 16 16 19 16 19"
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
        <Circle
          cx="12"
          cy="5"
          r="2"
          fill={focused ? colors.accentGold : color}
        />
        <Circle
          cx="12"
          cy="12"
          r="2.5"
          fill={activeColor}
        />
        <Circle
          cx="12"
          cy="19"
          r="2"
          fill={focused ? colors.accentGold : color}
        />
      </Svg>
    </View>
  );
};

export const PlanetBannerIcon = ({ color, size, focused }: TabIconProps) => {
  const { colors } = useTheme();
  const activeColor = focused ? colors.accentPrimary : color;
  
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="9"
          cy="14"
          r="6"
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Ellipse
          cx="9"
          cy="14"
          rx="6"
          ry="2"
          stroke={color}
          strokeWidth={1.2}
          fill="none"
          opacity={0.5}
        />
        <Line
          x1="17"
          y1="12"
          x2="17"
          y2="4"
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />
        <Path
          d="M17 4L21 6L17 8"
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={focused ? colors.accentPrimary : 'none'}
        />
      </Svg>
    </View>
  );
};

export const SignalOrbIcon = ({ color, size, focused }: TabIconProps) => {
  const { colors } = useTheme();
  const activeColor = focused ? colors.accentPrimary : color;
  
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="12"
          cy="10"
          r="7"
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Path
          d="M10 17L12 21L14 17"
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <G>
          <Path
            d="M8 9C9 7.5 10.3 7 12 7C13.7 7 15 7.5 16 9"
            stroke={activeColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M9.5 11.5C10 10.5 10.8 10 12 10C13.2 10 14 10.5 14.5 11.5"
            stroke={activeColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="12" cy="13" r="1.5" fill={activeColor} />
        </G>
      </Svg>
    </View>
  );
};

export const HomeMoonIcon = ({ color, size, focused }: TabIconProps) => {
  const { colors } = useTheme();
  const activeColor = focused ? colors.accentPrimary : color;
  
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="12"
          cy="12"
          r="6"
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="3"
          stroke={color}
          strokeWidth={1.2}
          fill="none"
          opacity={0.5}
          transform="rotate(-20 12 12)"
        />
        <Path
          d="M14 8C14 8 17 10 17 12C17 14 14 16 14 16"
          stroke={focused ? colors.accentPrimary : color}
          strokeWidth={STROKE_WIDTH + 0.5}
          strokeLinecap="round"
          fill="none"
        />
        {focused && (
          <Circle cx="18" cy="5" r="2" fill={colors.accentPrimary} />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
