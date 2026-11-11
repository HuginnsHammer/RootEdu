import { Text, View } from "react-native";
import { Screen, palette, styles } from "../../src/components/Screen";

function Feature({ icon, title, detail }: { icon: string; title: string; detail: string }) {
  return <View style={styles.card}>
    <Text style={{ color: palette.accent, fontSize: 20 }}>{icon}</Text>
    <Text style={{ color: palette.text, fontSize: 16, fontWeight: "700" }}>{title}</Text>
    <Text style={styles.body}>{detail}</Text>
  </View>;
}

export default function HomeScreen() {
  return <Screen>
    <Text style={styles.eyebrow}>ROOT & WEIGHTS LAB  /  MUST PILOT</Text>
    <View style={{ gap: 7, marginTop: 12 }}>
      <Text style={styles.heading}>Your academic life,</Text>
      <Text style={[styles.heading, { color: palette.accent }]}>in one place.</Text>
      <Text style={styles.body}>A more connected, dependable university experience.</Text>
    </View>
    <View style={[styles.card, { borderColor: "#536c3c", marginTop: 10 }]}>
      <Text style={styles.eyebrow}>ROOTEDU FOUNDATION</Text>
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: "700" }}>The MUST pilot is taking shape.</Text>
      <Text style={styles.body}>Mobile foundations are in place. Institutional sign-in and academic services will appear when their secure backend workflows are ready.</Text>
    </View>
    <Text style={[styles.heading, { fontSize: 20, marginTop: 8 }]}>Built around your studies</Text>
    <Feature icon="⌕" title="Academic library" detail="A verified home for notes, past papers and course materials." />
    <Feature icon="◷" title="Timetable" detail="Your classes, units, lecturers and rooms in one view." />
    <Feature icon="◉" title="Campus updates" detail="Relevant university and cohort announcements." />
  </Screen>;
}
