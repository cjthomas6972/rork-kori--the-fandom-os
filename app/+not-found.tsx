import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import KORI_COLORS from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Lost in the Multiverse" }} />
      <View style={styles.container}>
        <Text style={styles.icon}>🌌</Text>
        <Text style={styles.title}>Lost in the Multiverse</Text>
        <Text style={styles.subtitle}>This dimension doesn&apos;t exist</Text>

        <Link href="../" style={styles.link}>
          <Text style={styles.linkText}>Return to Reality</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: KORI_COLORS.bg.primary,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: KORI_COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: KORI_COLORS.text.secondary,
  },
  link: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: KORI_COLORS.bg.elevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: KORI_COLORS.accent.primary,
  },
  linkText: {
    fontSize: 16,
    color: KORI_COLORS.accent.primary,
    fontWeight: "600" as const,
  },
});
