
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronRight,
  Info,
  LogOut,
  Settings,
  Shirt,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/utils/supabase";

export default function MoreScreen() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      queryClient.clear();
      await AsyncStorage.removeItem("express-laundry-query-cache");
    } catch (error) {
      console.error("Logout failed:", error);

      Alert.alert(
        "Unable to sign out",
        "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function confirmLogout() {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out of Express Laundry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: handleLogout,
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>WORKSPACE</Text>
        <Text style={styles.title}>More</Text>
        <Text style={styles.subtitle}>
          Manage your laundry business.
        </Text>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>BUSINESS MANAGEMENT</Text>

        <Pressable style={styles.row}>
          <View style={styles.icon}>
            <Shirt color={Colors.primary} size={19} />
          </View>

          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Dress catalog</Text>
            <Text style={styles.rowDescription}>
              Garment types and custom pricing
            </Text>
          </View>

          <ChevronRight color={Colors.textSecondary} size={19} />
        </Pressable>

        <View style={styles.separator} />

        <Pressable style={styles.row}>
          <View style={styles.icon}>
            <Settings color={Colors.primary} size={19} />
          </View>

          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Settings</Text>
            <Text style={styles.rowDescription}>
              Business information and preferences
            </Text>
          </View>

          <ChevronRight color={Colors.textSecondary} size={19} />
        </Pressable>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>APPLICATION</Text>

        <View style={styles.row}>
          <View style={styles.icon}>
            <Info color={Colors.primary} size={19} />
          </View>

          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Express Laundry</Text>
            <Text style={styles.rowDescription}>Version 1.0.0</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.logoutButton, loading && styles.disabled]}
        onPress={confirmLogout}
        disabled={loading}
      >
        <LogOut size={19} color={Colors.danger} />
        <Text style={styles.logoutText}>
          {loading ? "Signing out..." : "Sign out"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },

  header: {
    paddingTop: 20,
    paddingBottom: 25,
  },

  eyebrow: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 7,
  },

  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },

  group: {
    backgroundColor: Colors.surface,
    borderRadius: 17,
    paddingHorizontal: 15,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  groupLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 17,
    marginBottom: 7,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },

  icon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: Colors.iconBackground,
    alignItems: "center",
    justifyContent: "center",
  },

  rowText: {
    flex: 1,
    gap: 4,
  },

  rowTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
  },

  rowDescription: {
    color: Colors.textSecondary,
    fontSize: 10,
  },

  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },

  logoutButton: {
    marginTop: 10,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  logoutText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: "800",
  },

  disabled: {
    opacity: 0.5,
  },
});
