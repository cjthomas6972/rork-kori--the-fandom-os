import { Stack } from 'expo-router';
import KORI_COLORS from '@/constants/colors';

export default function PlanetLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: KORI_COLORS.bg.primary,
        },
        headerTintColor: KORI_COLORS.text.primary,
        headerTitleStyle: {
          fontWeight: '600' as const,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: KORI_COLORS.bg.primary,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
