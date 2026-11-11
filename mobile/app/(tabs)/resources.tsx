import { Text, View } from "react-native";
import { Screen, palette, styles } from "../../src/components/Screen";

export default function ResourcesScreen() {
  return <Screen>
    <Text style={styles.eyebrow}>ACADEMIC LIBRARY</Text>
    <Text style={styles.heading}>Your resources.</Text>
    <Text style={styles.body}>Course materials will be organized by programme, cohort, academic year, semester and unit.</Text>
    <View style={styles.card}>
      <Text style={{ color: palette.text, fontSize: 16, fontWeight: "700" }}>Library is being prepared</Text>
      <Text style={styles.body}>No sample or unverified documents are shown. Downloads will be permission-checked and integrity-verified when the repository is connected.</Text>
    </View>
  </Screen>;
}
