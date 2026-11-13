import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import { fetchMobileBootstrap } from "../../src/api/bootstrap";
import { getApiBaseUrl, setApiBaseUrl } from "../../src/api/client";
import { Screen, palette, styles } from "../../src/components/Screen";

export default function ProfileScreen() {
  const [apiUrl, setApiUrl] = useState("http://127.0.0.1:8000/api/v1");
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    getApiBaseUrl().then(setApiUrl).finally(() => setLoading(false));
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

  async function checkForAppUpdate() {
    if (!Updates.isEnabled || __DEV__) {
      Alert.alert("Updates unavailable", "OTA updates are enabled only in a configured preview or production APK. Development sessions use Metro.");
      return;
    }
    setCheckingUpdate(true);
    try {
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) {
        Alert.alert("You're up to date", "This installation already has the latest compatible RootEdu update.");
        return;
      }
      const downloaded = await Updates.fetchUpdateAsync();
      if (downloaded.isNew) {
        Alert.alert("RootEdu update ready", "A compatible update has been downloaded. Restart now to apply it?", [
          { text: "Later", style: "cancel" },
          { text: "Restart now", onPress: () => { void Updates.reloadAsync(); } },
        ]);
      } else {
        Alert.alert("Update checked", "No new update was downloaded.");
      }
    } catch {
      Alert.alert("Update check failed", "RootEdu could not check for an update. Your current installed version remains available.");
    } finally {
      setCheckingUpdate(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.eyebrow}>ACCOUNT & APP SETTINGS</Text>
      <Text style={styles.heading}>Your RootEdu.</Text>
      <Text style={styles.body}>Configure this installation and manage compatible application updates.</Text>

      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <Ionicons name="server-outline" size={20} color={palette.accent} />
          <Text style={{ color: palette.text, fontSize: 16, fontWeight: "700" }}>API connection</Text>
        </View>
        <Text style={styles.body}>On a physical phone, enter your laptop's Wi-Fi IPv4 address. Example: http://192.168.1.20:8000/api/v1</Text>
        <Text style={{ color: palette.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1 }}>API BASE URL</Text>
        <TextInput value={apiUrl} onChangeText={setApiUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="http://192.168.1.20:8000/api/v1" placeholderTextColor="#657278" editable={!loading && !testing} style={{ color: palette.text, borderWidth: 1, borderColor: palette.border, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, fontSize: 14 }} />
        <Pressable onPress={() => void saveAndTest()} disabled={loading || testing} style={{ backgroundColor: palette.accent, padding: 14, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
          {testing ? <ActivityIndicator color="#101510" /> : <Ionicons name="pulse-outline" color="#101510" size={18} />}
          <Text style={{ color: "#101510", fontWeight: "800" }}>{testing ? "Testing connection…" : "Save & test connection"}</Text>
        </Pressable>
        {message ? <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
          <Ionicons name={connected ? "checkmark-circle" : "alert-circle"} color={connected ? palette.accent : "#e28b76"} size={18} />
          <Text style={[styles.body, { flex: 1, color: connected ? palette.accent : "#e9a08f" }]}>{message}</Text>
        </View> : null}
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <Ionicons name="cloud-download-outline" size={20} color={palette.accent} />
          <Text style={{ color: palette.text, fontSize: 16, fontWeight: "700" }}>Application updates</Text>
        </View>
        <Text style={styles.body}>RootEdu checks for compatible updates on launch. JavaScript and asset updates can arrive without reinstalling the APK. Native changes still require a new build.</Text>
        <Text style={{ color: palette.muted, fontSize: 12 }}>Channel: {Updates.channel ?? "not configured"}  ·  Runtime: {Updates.runtimeVersion ?? "development"}</Text>
        <Pressable onPress={() => void checkForAppUpdate()} disabled={checkingUpdate} style={{ backgroundColor: palette.accent, padding: 13, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
          {checkingUpdate ? <ActivityIndicator color="#101510" /> : <Ionicons name="refresh" color="#101510" size={18} />}
          <Text style={{ color: "#101510", fontWeight: "800" }}>{checkingUpdate ? "Checking…" : "Check for updates"}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={{ color: palette.text, fontSize: 16, fontWeight: "700" }}>Student account</Text>
        <Text style={styles.body}>Secure institutional sign-in is being built. This version does not ask for or store student passwords.</Text>
      </View>
      <Text style={{ color: palette.muted, fontSize: 11, textAlign: "center" }}>RootEdu 0.1.0  ·  Root & Weights Lab</Text>
    </Screen>
  );
}
