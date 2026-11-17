
import { Tabs, useRouter } from "expo-router";
import {
  ClipboardList,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Users,
} from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { Colors } from "@/constants/colors";

function NewOrderButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/new-order")}
      style={styles.addButton}
      accessibilityRole="button"
      accessibilityLabel="Create new order"
    >
      <Plus color={Colors.white} size={27} strokeWidth={2.5} />
    </Pressable>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="new-order"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarButton: () => <NewOrderButton />,
        }}
      />

      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <MoreHorizontal color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    paddingTop: 9,
    paddingBottom: 8,
    paddingHorizontal: 8,
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 10,
  },

  tabItem: {
    paddingVertical: 2,
  },

  label: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },

  addButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: -19,
    borderWidth: 4,
    borderColor: Colors.background,
  },
});
