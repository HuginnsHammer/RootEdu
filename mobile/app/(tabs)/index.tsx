import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchMobileBootstrap, MobileBootstrap } from "../../src/api/bootstrap";
import { Screen, palette, styles } from "../../src/components/Screen";

function Capability({ icon, title, description }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string }) {
  return (
    <View style={[styles.card, { flexDirection: "row", alignItems: "center", gap: 14 }]}>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#1b2820", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} color={palette.accent} size={21} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700" }}>{title}</Text>
        <Text style={styles.body}>{description}</Text>
      </View>
      <Ionicons name="arrow-forward" color={palette.muted} size={17} />
    </View>
  );
}

export default function HomeScreen() {
  const [bootstrap, setBootstrap] = useState<MobileBootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBootstrap(await fetchMobileBootstrap());
    } catch {
      setBootstrap(null);
      setError("RootEdu could not reach its API. Check that the backend is running and your phone is using the laptop's LAN address.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void connect();
  }, [connect]);

  return (
    <Screen>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ gap: 3 }}>
          <Text style={styles.eyebrow}>ROOT & WEIGHTS LAB</Text>
          <Text style={{ color: palette.muted, fontSize: 12, letterSpacing: 1.5 }}>MUST PILOT  /  2026</Text>
        </View>
        <View style={{ width: 42, height: 42, borderRadius: 14, borderWidth: 1, borderColor: palette.border, alignItems: "center", justifyContent: "center", backgroundColor: palette.surface }}>
          <Ionicons name="school-outline" color={palette.accent} size={22} />
        </View>
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        <Text style={[styles.heading, { fontSize: 34, lineHeight: 40 }]}>University life,</Text>
        <Text style={[styles.heading, { color: palette.accent, fontSize: 34, lineHeight: 40 }]}>in sync.</Text>
        <Text style={[styles.body, { maxWidth: 300 }]}>Your academic world, organized around the things that move you forward.</Text>
      </View>

      <View style={[styles.card, { borderColor: error ? "#744c43" : "#3e5934", gap: 12 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: loading ? "#e8c56a" : error ? "#e28b76" : palette.accent }} />
            <Text style={{ color: palette.text, fontSize: 13, fontWeight: "700" }}>BACKEND CONNECTION</Text>
          </View>
          <Pressable onPress={() => void connect()} disabled={loading} accessibilityRole="button" accessibilityLabel="Refresh backend connection">
            {loading ? <ActivityIndicator color={palette.accent} /> : <Ionicons name="refresh" size={18} color={palette.accent} />}
          </Pressable>
        </View>
        <Text style={{ color: palette.text, fontSize: 17, fontWeight: "700" }}>
          {loading ? "Connecting to RootEdu…" : error ? "Connection unavailable" : bootstrap?.institution ?? "Connected"}
        </Text>
        <Text style={styles.body}>
          {loading ? "Checking the live service and pilot configuration." : error ?? "Live API connection established. Pilot configuration received from the backend."}
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: palette.text, fontSize: 19, fontWeight: "700" }}>Your academic space</Text>
          <Text style={{ color: palette.muted, fontSize: 11 }}>PILOT SERVICES</Text>
        </View>
        <Capability icon="library-outline" title="Academic library" description="Verified notes, past papers and unit materials." />
        <Capability icon="calendar-outline" title="Timetable" description="Classes, lecturers, rooms and your weekly schedule." />
        <Capability icon="megaphone-outline" title="Campus updates" description="Announcements relevant to your university and cohort." />
      </View>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>MUST PILOT PROGRAMMES</Text>
        {bootstrap?.programmes.map((programme) => (
          <View key={programme.code} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: palette.border }}>
            <Text style={{ color: palette.accent, fontSize: 12, fontWeight: "800", width: 48 }}>{programme.code}</Text>
            <Text style={{ color: palette.text, fontSize: 13, flex: 1 }}>{programme.name}</Text>
          </View>
        )) ?? (
          <Text style={styles.body}>Programme information will appear here when the backend connection is available.</Text>
        )}
      </View>
      <Text style={{ color: palette.muted, fontSize: 11, textAlign: "center" }}>A product of Root & Weights Lab  ·  RootEdu 0.1.0</Text>
    </Screen>
  );
}
