
import { useRouter } from "expo-router";
import { Plus, Shirt } from "lucide-react-native";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useOrders } from "@/hooks/useOrders";
import type { Order } from "@/services/orderService";

function money(value: number) {
  return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    received: Colors.statusReceived,
    awaiting_validation: Colors.statusAwaitingValidation,
    confirmed: Colors.statusConfirmed,
    washing: Colors.statusWashing,
    ironing: Colors.statusIroning,
    ready: Colors.statusReady,
    delivered: Colors.statusDelivered,
  };

  return colors[status] ?? Colors.textSecondary;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    received: "Received",
    awaiting_validation: "Awaiting approval",
    confirmed: "Confirmed",
    washing: "Washing",
    ironing: "Ironing",
    ready: "Ready",
    delivered: "Delivered",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

export default function OrdersScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useOrders();

  function renderOrder({ item }: { item: Order }) {
    const balance = Number(item.total) - Number(item.amount_paid);
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.icon}>
            <Shirt color={Colors.primary} size={20} />
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>
              {item.clients?.name ?? "Unknown client"}
            </Text>

            <Text style={styles.phone}>
              {item.clients?.phone ?? "No phone number"}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusColor },
              ]}
            />
            <Text style={[styles.status, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBottom}>
          <View style={styles.detail}>
            <Text style={styles.caption}>Delivery date</Text>
            <Text style={styles.value}>
              {new Date(item.delivery_date).toLocaleDateString("fr-FR")}
            </Text>
          </View>

          <View style={styles.detail}>
            <Text style={styles.caption}>Total</Text>
            <Text style={styles.value}>
              {money(Number(item.total))}
            </Text>
          </View>

          <View style={styles.detail}>
            <Text style={styles.caption}>Remaining</Text>
            <Text
              style={[
                styles.value,
                {
                  color:
                    balance > 0 ? Colors.warning : Colors.success,
                },
              ]}
            >
              {money(Math.max(balance, 0))}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>WORKSPACE</Text>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>
            Manage pickups, laundry and deliveries.
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/new-order")}
        >
          <Plus size={21} color={Colors.white} />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator
          color={Colors.primary}
          style={styles.loader}
        />
      ) : isError ? (
        <Pressable style={styles.empty} onPress={() => refetch()}>
          <Text style={styles.emptyTitle}>Couldn't load orders</Text>
          <Text style={styles.emptyText}>Tap to try again.</Text>
        </Pressable>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={() => void refetch()}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Shirt size={30} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyText}>
                Your laundry orders will appear here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  addButton: {
    backgroundColor: Colors.primary,
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  loader: {
    marginTop: 40,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
    flexGrow: 1,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 15,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.iconBackground,
    alignItems: "center",
    justifyContent: "center",
  },

  clientInfo: {
    flex: 1,
    gap: 4,
  },

  clientName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
  },

  phone: {
    color: Colors.textSecondary,
    fontSize: 11,
  },

  statusContainer: {
    alignItems: "flex-end",
    gap: 5,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  status: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "capitalize",
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
  },

  detail: {
    flex: 1,
  },

  caption: {
    color: Colors.textSecondary,
    fontSize: 9,
    marginBottom: 5,
  },

  value: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: "700",
  },

  empty: {
    padding: 35,
    alignItems: "center",
    gap: 9,
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  emptyText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
});
