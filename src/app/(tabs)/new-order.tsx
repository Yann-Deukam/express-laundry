
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AppColors } from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { useOrderDraftStore } from "@/stores/orderDraftStore";

export default function NewOrderScreen() {
  const items = useOrderDraftStore((state) => state.items);

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>NEW ORDER</Text>
        <Text style={styles.title}>Order intake</Text>

        <Text style={styles.description}>
          This is where you'll register a client, record garment
          details, take photos, add care instructions and prepare
          a quotation.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Draft progress</Text>
          <Text style={styles.cardValue}>
            {items.length} garment{items.length === 1 ? "" : "s"} added
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 22,
      gap: 14,
    },

    eyebrow: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.5,
    },

    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "800",
    },

    description: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 21,
    },

    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 17,
      padding: 18,
      marginTop: 10,
      gap: 7,
    },

    cardTitle: {
      color: colors.textSecondary,
      fontSize: 11,
    },

    cardValue: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
  });
}
