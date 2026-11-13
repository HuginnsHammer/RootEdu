import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest } from "../../src/api/client";
import { Screen, palette, styles } from "../../src/components/Screen";

const categories = [
  { value: "bug", label: "Bug" },
  { value: "idea", label: "Idea" },
  { value: "experience", label: "Experience" },
  { value: "other", label: "Other" },
] as const;

type Category = (typeof categories)[number]["value"];

export default function FeedbackScreen() {
  const [category, setCategory] = useState<Category>("experience");
  const [message, setMessage] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit() {
    setSending(true);
    setNotice(null);
    try {
      const result = await apiRequest<{ message: string }>("/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          reply_email: replyEmail.trim() || null,
          app_version: "0.1.0",
          device_platform: "android",
        }),
      });
      setNotice({ ok: true, text: result.message });
      setMessage("");
    } catch (error) {
      setNotice({
        ok: false,
        text: error instanceof Error ? error.message : "Feedback could not be sent. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.eyebrow}>ROOTEDU BETA PROGRAMME</Text>
      <Text style={styles.heading}>Help us get it right.</Text>
      <Text style={styles.body}>Found a bug, have an idea, or want to tell us how RootEdu feels? Your feedback goes directly to the team.</Text>

      <View style={styles.card}>
        <Text style={{ color: palette.text, fontWeight: "700", fontSize: 15 }}>What is this about?</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {categories.map((item) => {
            const active = category === item.value;
            return (
              <Pressable key={item.value} onPress={() => setCategory(item.value)} accessibilityRole="button" accessibilityState={{ selected: active }} style={{ borderRadius: 20, paddingHorizontal: 13, paddingVertical: 9, borderWidth: 1, borderColor: active ? palette.accent : palette.border, backgroundColor: active ? "#1d2a1b" : "transparent" }}>
                <Text style={{ color: active ? palette.accent : palette.muted, fontSize: 13, fontWeight: "700" }}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: palette.text, fontWeight: "700", fontSize: 15 }}>Tell us more</Text>
        <TextInput value={message} onChangeText={setMessage} multiline maxLength={5000} textAlignVertical="top" placeholder="What happened? What did you expect? What would make RootEdu better?" placeholderTextColor="#657278" style={{ minHeight: 150, color: palette.text, borderWidth: 1, borderColor: palette.border, borderRadius: 13, padding: 13, fontSize: 14, lineHeight: 21 }} />
        <Text style={{ color: palette.muted, fontSize: 11, textAlign: "right" }}>{message.length}/5000</Text>

        <Text style={{ color: palette.text, fontWeight: "700", fontSize: 15 }}>Email for a reply (optional)</Text>
        <TextInput value={replyEmail} onChangeText={setReplyEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#657278" style={{ color: palette.text, borderWidth: 1, borderColor: palette.border, borderRadius: 13, padding: 13, fontSize: 14 }} />
        <Text style={styles.body}>Only include contact details if you want the team to follow up. Avoid sending passwords, tokens or sensitive academic records.</Text>

        <Pressable onPress={() => void submit()} disabled={sending || message.trim().length < 10} style={{ backgroundColor: sending || message.trim().length < 10 ? "#58634f" : palette.accent, padding: 14, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
          {sending ? <ActivityIndicator color="#101510" /> : <Ionicons name="send-outline" color="#101510" size={18} />}
          <Text style={{ color: "#101510", fontWeight: "800" }}>{sending ? "Sending feedback…" : "Send feedback"}</Text>
        </Pressable>
        {notice ? <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
          <Ionicons name={notice.ok ? "checkmark-circle" : "alert-circle"} size={19} color={notice.ok ? palette.accent : "#e28b76"} />
          <Text style={[styles.body, { flex: 1, color: notice.ok ? palette.accent : "#e9a08f" }]}>{notice.text}</Text>
        </View> : null}
      </View>
      <Text style={{ color: palette.muted, fontSize: 11, textAlign: "center" }}>Feedback is delivered to the RootEdu beta team.</Text>
    </Screen>
  );
}
