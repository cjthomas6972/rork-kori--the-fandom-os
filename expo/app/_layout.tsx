import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { IdentityProvider } from "@/contexts/IdentityContext";
import { UniverseProvider } from "@/contexts/UniverseContext";
import { ThemeProvider, useTheme, DARK_TOKENS } from "@/contexts/ThemeContext";
import { EntitlementsProvider } from "@/contexts/EntitlementsContext";


SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { colors } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg0 },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="home" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="universe/[id]" />
      <Stack.Screen name="guild/[id]" />
      <Stack.Screen name="person/[id]" />
      <Stack.Screen 
        name="create-guild" 
        options={{ presentation: "modal" }} 
      />
      <Stack.Screen 
        name="create-meetup" 
        options={{ presentation: "modal" }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ presentation: "modal" }} 
      />
      <Stack.Screen name="warp" />
      <Stack.Screen 
        name="universe-pass" 
        options={{ presentation: "modal" }} 
      />
      <Stack.Screen 
        name="signal-preview" 
        options={{ presentation: "modal" }} 
      />
      <Stack.Screen 
        name="beacon-composer" 
        options={{ presentation: "modal" }} 
      />
      <Stack.Screen 
        name="guild-pro" 
        options={{ presentation: "modal" }} 
      />
    </Stack>
  );
}

function AppContent() {
  const { colors } = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg0);
  }, [colors.bg0]);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.bg0 }]}>
      <IdentityProvider>
        <UniverseProvider>
          <EntitlementsProvider>
            <RootLayoutNav />
          </EntitlementsProvider>
        </UniverseProvider>
      </IdentityProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(DARK_TOKENS.bg0);
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
