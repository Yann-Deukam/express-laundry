
import { Colors } from "@/constants/colors";
import { supabase } from "@/utils/supabase";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardPlaceholder() {
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>Express Laundry</Text>

        <Text style={styles.title}>You're signed in!</Text>

        <Text style={styles.description}>
          Your authentication is working correctly.
          Your dashboard will be built here.
        </Text>

        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    padding: 24,
  },

  content: {
    gap: 18,
  },

  brand: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
  },

  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  button: {
    backgroundColor: Colors.black,
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: Colors.white,
    fontWeight: "700",
  },
});
