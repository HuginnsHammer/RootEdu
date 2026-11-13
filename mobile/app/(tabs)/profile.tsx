import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchMobileBootstrap } from "../../src/api/bootstrap";
import { getApiBaseUrl, setApiBaseUrl } from "../../src/api/client";
import { Screen, palette, styles } from "../../src/components/Screen";

export default function ProfileScreen() {
  const [apiUrl, setApiUrl] = useState("http://127.0.0.1:8000/api/v1");
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    getApiBaseUrl()
      .then(setApiUrl)
      .finally(() => setLoading(false));
  }, []);

  async function saveAndTest() {
    setTesting(true);
    setMessage(null);
    setConnected(null);
    try {
      await setApiBaseUrl(apiUrl);
      const bootstrap = await fetchMobileBootstrap();
      setConnected(true);
      setMessage(`Connected to ${bootstrap.institution}. ${bootstrap.programmes.length} pilot programmes loaded.`);
    } catch (error) {
      setConnected(false);
      setMessage(error instanceof Error ? error.message : "Could not connect to the configured API.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.eyebrow}>ACCOUNT & APP SETTINGS</Text>
      <Text style={styles.heading}>Your RootEdu.</Text>
      <Text style={styles.body}>Configure this installation to reach your development or institutional RootEdu API.</Text>

      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <Ionicons name="server-outline" size={20} color={palette.accent} />
          <Text style={{ color: palette.text, fontSize: 16, fontWeight: "700" }}>API connection</Text>
        </View>
        <Text style={styles.body}>On a physical phone, enter your laptop's Wi-Fi IPv4 address. Example: http://192.168.1.20:8000/api/v1</Text>
        <Text style={{ color: palette.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1 }}>API BASE URL</Text>
        <TextInput
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://192.168.1.20:8000/api/v1"
          placeholderTextColor="#657278"
          editable={!loading && !testing}
          style={{ color: palette.text, borderWidth: 1, borderColor: palette.border, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, fontSize: 14 }}
        />
        <Pressable onPress={() => void saveAndTest()} disabled={loading || testing} style={{ backgroundColor: palette.accent, padding: 14, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
          {testing ? <ActivityIndicator color="#101510" /> : <Ionicons name="pulse-outline" color="#101510" size={18} />}
          <Text style={{ color: "#101510", fontWeight: "800" }}>{testing ? "Testing connection…" : "Save & test connection"}</Text>
        </Pressable>
        {message ? (
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
            <Ionicons name={connected ? "checkmark-circle" : "alert-circle"} color={connected ? palette.accent : "#e28b76"} size={18} />
            <Text style={[styles.body, { flex: 1, color: connected ? palette.accent : "#e9a08f" }]}>{message}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={{ color: palette.text, fontSize: 16, fontWeight: "700" }}>Student account</Text>
        <Text style={styles.body}>Secure institutional sign-in is being built. This version does not ask for or store student passwords.</Text>
      </View>
      <Text style={{ color: palette.muted, fontSize: 11, textAlign: "center" }}>RootEdu 0.1.0  ·  Root & Weights Lab</Text>
    </Screen>
  );
}
