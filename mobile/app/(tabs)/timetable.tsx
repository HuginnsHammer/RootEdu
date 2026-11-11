import { Text, View } from "react-native";
import { Screen, styles } from "../../src/components/Screen";

export default function TimetableScreen() {
  return <Screen>
    <Text style={styles.eyebrow}>YOUR WEEK</Text>
    <Text style={styles.heading}>Timetable.</Text>
    <View style={styles.card}>
      <Text style={{ color: "#f2f5f3", fontSize: 16, fontWeight: "700" }}>No timetable published</Text>
      <Text style={styles.body}>Your cohort timetable will appear here once an authorized university schedule is available.</Text>
    </View>
  </Screen>;
}
