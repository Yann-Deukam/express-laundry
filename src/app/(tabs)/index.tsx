
import { useRouter } from "expo-router";
import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  Clock3,
  Plus,
  Shirt,
  Wallet,
} from "lucide-react-native";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useDashboard } from "@/hooks/useDashboard";
import type { Order } from "@/services/orderService";

function formatMoney(amount: number) {
  return `${Number(amount || 0).toLocaleString("fr-FR")} FCFA`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
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

function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {action && (
        <Pressable onPress={onPress} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <ArrowRight size={15} color={Colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent,
  caption,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  caption: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <View
          style={[
            styles.metricIcon,
            { backgroundColor: `${accent}15` },
          ]}
        >
          {icon}
        </View>
      </View>

      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricCaption}>{caption}</Text>
    </View>
  );
}

function OrderRow({
  order,
  onPress,
}: {
  order: Order;
  onPress: () => void;
}) {
  const statusColor = getStatusColor(order.status);

  return (
    <Pressable style={styles.orderRow} onPress={onPress}>
      <View style={styles.orderIcon}>
        <Shirt size={19} color={Colors.primary} />
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.orderName} numberOfLines={1}>
          {order.clients?.name ?? "Unknown client"}
        </Text>

        <Text style={styles.orderMeta}>
          Due {formatDate(order.delivery_date)}
          {" · "}
          {formatMoney(Number(order.total))}
        </Text>
      </View>

      <View style={styles.orderRight}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: statusColor },
          ]}
        />

        <Text style={[styles.orderStatus, { color: statusColor }]}>
          {getStatusLabel(order.status)}
        </Text>

        <ArrowRight size={15} color={Colors.textSecondary} />
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const router = useRouter();

  const {
    dueSoon,
    inProgress,
    unpaid,
    isLoading,
    isError,
    refetch,
  } = useDashboard();

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const outstandingBalance = unpaid.reduce(
    (sum, order) =>
      sum +
      Math.max(
        0,
        Number(order.total) - Number(order.amount_paid)
      ),
    0
  );

  const today = new Date().toLocaleDateString("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>EXPRESS LAUNDRY</Text>
            <Text style={styles.greeting}>Good morning.</Text>
            <Text style={styles.date}>{today}</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>EL</Text>
          </View>
        </View>

        <Pressable
          style={styles.newOrderButton}
          onPress={() => router.push("/(tabs)/new-order")}
        >
          <View style={styles.newOrderIcon}>
            <Plus color={Colors.primary} size={23} />
          </View>

          <View style={styles.newOrderText}>
            <Text style={styles.newOrderTitle}>Create a new order</Text>
            <Text style={styles.newOrderSubtitle}>
              Register a pickup and add garments
            </Text>
          </View>

          <ArrowRight color={Colors.white} size={20} />
        </Pressable>

        {isError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              Couldn't refresh your data. Showing any available cached
              information.
            </Text>

            <Pressable onPress={handleRefresh}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.metricsGrid}>
          <MetricCard
            label="Due soon"
            value={String(dueSoon.length)}
            icon={<CalendarDays size={19} color={Colors.info} />}
            accent={Colors.info}
            caption="Today & tomorrow"
          />

          <MetricCard
            label="In progress"
            value={String(inProgress.length)}
            icon={<Shirt size={19} color={Colors.statusWashing} />}
            accent={Colors.statusWashing}
            caption="Active laundry"
          />

          <MetricCard
            label="Unpaid orders"
            value={String(unpaid.length)}
            icon={<Wallet size={19} color={Colors.warning} />}
            accent={Colors.warning}
            caption="Outstanding"
          />

          <MetricCard
            label="Outstanding"
            value={formatMoney(outstandingBalance)}
            icon={<ArrowDownRight size={19} color={Colors.danger} />}
            accent={Colors.danger}
            caption="Remaining balance"
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Upcoming deliveries"
            action="All orders"
            onPress={() => router.push("/(tabs)/orders")}
          />

          {isLoading ? (
            <ActivityIndicator
              color={Colors.primary}
              style={styles.loader}
            />
          ) : dueSoon.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <CalendarDays size={22} color={Colors.primary} />
              </View>

              <Text style={styles.emptyTitle}>Nothing due soon</Text>

              <Text style={styles.emptyDescription}>
                No outstanding deliveries scheduled for today or tomorrow.
              </Text>
            </View>
          ) : (
            <View style={styles.listCard}>
              {dueSoon.slice(0, 5).map((order, index) => (
                <View key={order.id}>
                  <OrderRow
                    order={order}
                    onPress={() => router.push("/(tabs)/orders")}
                  />

                  {index !== Math.min(dueSoon.length, 5) - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Currently processing"
            action="View all"
            onPress={() => router.push("/(tabs)/orders")}
          />

          {isLoading ? (
            <ActivityIndicator
              color={Colors.primary}
              style={styles.loader}
            />
          ) : inProgress.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Clock3 size={22} color={Colors.primary} />
              </View>

              <Text style={styles.emptyTitle}>No active laundry</Text>

              <Text style={styles.emptyDescription}>
                Orders being processed will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.listCard}>
              {inProgress.slice(0, 4).map((order, index) => (
                <View key={order.id}>
                  <OrderRow
                    order={order}
                    onPress={() => router.push("/(tabs)/orders")}
                  />

                  {index !== Math.min(inProgress.length, 4) - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Your business, one order at a time.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 35,
    gap: 25,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brand: {
    fontSize: 10,
    letterSpacing: 1.7,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: 8,
  },

  greeting: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1,
  },

  date: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
    textTransform: "capitalize",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: Colors.white,
    fontWeight: "800",
    fontSize: 13,
  },

  newOrderButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  newOrderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  newOrderText: {
    flex: 1,
    gap: 4,
  },

  newOrderTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "800",
  },

  newOrderSubtitle: {
    color: Colors.primaryLight,
    fontSize: 11,
  },

  errorBanner: {
    backgroundColor: Colors.warningBackground,
    borderRadius: 12,
    padding: 13,
    gap: 8,
  },

  errorText: {
    color: Colors.warningText,
    fontSize: 12,
    lineHeight: 18,
  },

  retryText: {
    color: Colors.warningText,
    fontWeight: "800",
    fontSize: 12,
  },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  metricCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },

  metricTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  metricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
  },

  metricLabel: {
    color: Colors.text,
    fontWeight: "700",
    fontSize: 12,
  },

  metricCaption: {
    color: Colors.textSecondary,
    fontSize: 10,
  },

  section: {
    gap: 13,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  sectionActionText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },

  loader: {
    padding: 25,
  },

  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 22,
    alignItems: "center",
    gap: 8,
  },

  emptyIcon: {
    width: 44,
    height: 44,
    backgroundColor: Colors.iconBackground,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
  },

  emptyDescription: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
  },

  listCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },

  orderRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  orderIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.iconBackground,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  orderInfo: {
    flex: 1,
    gap: 5,
  },

  orderName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
  },

  orderMeta: {
    color: Colors.textSecondary,
    fontSize: 10,
  },

  orderRight: {
    alignItems: "flex-end",
    gap: 5,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
  },

  orderStatus: {
    fontSize: 9,
    fontWeight: "700",
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },

  footerNote: {
    alignItems: "center",
    paddingTop: 5,
  },

  footerNoteText: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
});
