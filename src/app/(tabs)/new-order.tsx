
import { Colors } from "@/constants/colors";
import { useOrderDraftStore } from "@/stores/orderDraftStore";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewOrderScreen() {
  const items = useOrderDraftStore((state) => state.items);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    padding: 22,
    gap: 14,
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
  },

  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
  },

  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 17,
    padding: 18,
    marginTop: 10,
    gap: 7,
  },

  cardTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
  },

  cardValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
});
