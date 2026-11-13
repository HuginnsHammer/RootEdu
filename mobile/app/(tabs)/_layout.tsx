import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const items = [
  { name: "index", title: "Home", icon: "grid-outline" as const },
  { name: "resources", title: "Library", icon: "library-outline" as const },
  { name: "timetable", title: "Timetable", icon: "calendar-outline" as const },
  { name: "feedback", title: "Feedback", icon: "chatbubble-ellipses-outline" as const },
  { name: "profile", title: "Account", icon: "person-circle-outline" as const },
];

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: "#0b0e10", borderTopColor: "#20272b", height: 66, paddingTop: 8 },
      tabBarActiveTintColor: "#b7f36b",
      tabBarInactiveTintColor: "#778187",
      tabBarLabelStyle: { fontSize: 11, paddingBottom: 5 },
    }}>
      {items.map((item) => (
        <Tabs.Screen key={item.name} name={item.name} options={{
          title: item.title,
          tabBarIcon: ({ color, size }) => <Ionicons name={item.icon} color={color} size={size} />,
        }} />
      ))}
    </Tabs>
  );
}
