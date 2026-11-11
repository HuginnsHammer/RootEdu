import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const palette = {
  background: "#050607", surface: "#101518", border: "#202a2e",
  text: "#f2f5f3", muted: "#8b989d", accent: "#b7f36b",
};

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { padding: 22, paddingBottom: 36, gap: 18 },
  eyebrow: { color: palette.accent, fontSize: 11, fontWeight: "700", letterSpacing: 2 },
  heading: { color: palette.text, fontSize: 30, fontWeight: "700", letterSpacing: -0.8 },
  body: { color: palette.muted, fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 18, padding: 17, gap: 8 },
});
