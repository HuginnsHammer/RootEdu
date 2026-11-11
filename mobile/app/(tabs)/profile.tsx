import { Text, View } from "react-native";
import { Screen, styles } from "../../src/components/Screen";

export default function ProfileScreen() {
  return <Screen>
    <Text style={styles.eyebrow}>ACCOUNT</Text>
    <Text style={styles.heading}>Your account.</Text>
    <View style={styles.card}>
      <Text style={{ color: "#f2f5f3", fontSize: 16, fontWeight: "700" }}>Institutional sign-in is not enabled yet</Text>
      <Text style={styles.body}>Verified institutional identity must be connected before exposing account or student records. This foundation build collects no credentials.</Text>
    </View>
  </Screen>;
}
