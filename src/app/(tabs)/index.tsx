
import { useRouter } from "expo-router";
import {
  ArrowDownRight,
  ArrowRight,
  Bell,
  CalendarDays,
  Clock3,
  Moon,
  Plus,
  Shirt,
  Sun,
  Wallet,
} from "lucide-react-native";
import { useCallback, useMemo } from "react";
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

import type { AppColors } from "@/constants/colors";
import { useDashboard } from "@/hooks/useDashboard";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/providers/ThemeProvider";
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


function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good morning.";
  if (hour >= 12 && hour < 17) return "Good afternoon.";
  return "Good evening.";
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

function getStatusColor(status: string, colors: AppColors) {
  const statusColors: Record<string, string> = {
    received: colors.statusReceived,
    awaiting_validation: colors.statusAwaitingValidation,
    confirmed: colors.statusConfirmed,
    washing: colors.statusWashing,
    ironing: colors.statusIroning,
    ready: colors.statusReady,
    delivered: colors.statusDelivered,
  };

  return statusColors[status] ?? colors.textSecondary;
}

function SectionHeader({
  title,
  action,
  onPress,
  styles,
  colors,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
  styles: DashboardStyles;
  colors: AppColors;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {action && (
        <Pressable onPress={onPress} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <ArrowRight size={15} color={colors.primary} />
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
  styles,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  caption: string;
  styles: DashboardStyles;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <View
          style={[
            styles.metricIcon,
            { backgroundColor: `${accent}18` },
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
  styles,
  colors,
}: {
  order: Order;
  onPress: () => void;
  styles: DashboardStyles;
  colors: AppColors;
}) {
  const statusColor = getStatusColor(order.status, colors);

  return (
    <Pressable style={styles.orderRow} onPress={onPress}>
      <View style={styles.orderIcon}>
        <Shirt size={19} color={colors.primary} />
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

        <ArrowRight size={15} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const {
    dueSoon,
    inProgress,
    unpaid,
    isLoading,
    isError,
    refetch,
  } = useDashboard();
  
  function navigate(setting: string) {
     router.push(`/(tabs)/settings/${setting}` as never);
   }
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

  const greeting = getGreeting();

    const { unreadCount } = useNotifications();
    function openNotifications() {
    navigate("notifications");
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.brand}>EXPRESS LAUNDRY</Text>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.date}>{today}</Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.themeToggle}
              onPress={() => void toggleTheme()}
              accessibilityRole="button"
              accessibilityLabel={
                isDark ? "Switch to light theme" : "Switch to dark theme"
              }
              hitSlop={8}
            >
              {isDark ? (
                <Sun size={19} color={colors.warning} />
              ) : (
                <Moon size={19} color={colors.text} />
              )}
            </Pressable>

            <Pressable
            onPress={openNotifications}
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "Notifications"
            }
          >
            <Bell color={colors.text} size={21} />

            {unreadCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  minWidth: 19,
                  height: 19,
                  borderRadius: 10,
                  backgroundColor: colors.danger,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 4,
                  borderWidth: 2,
                  borderColor: colors.background,
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 9,
                    fontWeight: "800",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>EL</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.newOrderButton}
          onPress={() => router.push("/(tabs)/new-order")}
        >
          <View style={styles.newOrderIcon}>
            <Plus color={colors.primary} size={23} />
          </View>

          <View style={styles.newOrderText}>
            <Text style={styles.newOrderTitle}>Create a new order</Text>
            <Text style={styles.newOrderSubtitle}>
              Register a pickup and add garments
            </Text>
          </View>

          <ArrowRight color={colors.white} size={20} />
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
            icon={<CalendarDays size={19} color={colors.info} />}
            accent={colors.info}
            caption="Today & tomorrow"
            styles={styles}
          />

          <MetricCard
            label="In progress"
            value={String(inProgress.length)}
            icon={<Shirt size={19} color={colors.statusWashing} />}
            accent={colors.statusWashing}
            caption="Active laundry"
            styles={styles}
          />

          <MetricCard
            label="Unpaid orders"
            value={String(unpaid.length)}
            icon={<Wallet size={19} color={colors.warning} />}
            accent={colors.warning}
            caption="Outstanding"
            styles={styles}
          />

          <MetricCard
            label="Outstanding"
            value={formatMoney(outstandingBalance)}
            icon={<ArrowDownRight size={19} color={colors.danger} />}
            accent={colors.danger}
            caption="Remaining balance"
            styles={styles}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Upcoming deliveries"
            action="All orders"
            onPress={() => router.push("/(tabs)/orders")}
            styles={styles}
            colors={colors}
          />

          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : dueSoon.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <CalendarDays size={22} color={colors.primary} />
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
                    styles={styles}
                    colors={colors}
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
            styles={styles}
            colors={colors}
          />

          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : inProgress.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Clock3 size={22} color={colors.primary} />
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
                    styles={styles}
                    colors={colors}
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

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
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

    headerText: {
      flex: 1,
    },

    brand: {
      fontSize: 10,
      letterSpacing: 1.7,
      fontWeight: "800",
      color: colors.primary,
      marginBottom: 8,
    },

    greeting: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -1,
    },

    date: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 5,
      textTransform: "capitalize",
    },

    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    themeToggle: {
      width: 42,
      height: 42,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    avatar: {
      width: 44,
      height: 44,
      borderRadius: 15,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    avatarText: {
      color: colors.white,
      fontWeight: "800",
      fontSize: 13,
    },

    newOrderButton: {
      backgroundColor: colors.primary,
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
      backgroundColor: colors.white,
      alignItems: "center",
      justifyContent: "center",
    },

    newOrderText: {
      flex: 1,
      gap: 4,
    },

    newOrderTitle: {
      color: colors.white,
      fontSize: 15,
      fontWeight: "800",
    },

    newOrderSubtitle: {
      color: colors.white,
      opacity: 0.8,
      fontSize: 11,
    },

    errorBanner: {
      backgroundColor: colors.warningBackground,
      borderRadius: 12,
      padding: 13,
      gap: 8,
    },

    errorText: {
      color: colors.warningText,
      fontSize: 12,
      lineHeight: 18,
    },

    retryText: {
      color: colors.warningText,
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
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
    },

    metricLabel: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 12,
    },

    metricCaption: {
      color: colors.textSecondary,
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
      color: colors.text,
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
      color: colors.primary,
      fontSize: 11,
      fontWeight: "700",
    },

    loader: {
      padding: 25,
    },

    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 22,
      alignItems: "center",
      gap: 8,
    },

    emptyIcon: {
      width: 44,
      height: 44,
      backgroundColor: colors.iconBackground,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "800",
    },

    emptyDescription: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: "center",
      lineHeight: 17,
    },

    listCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.iconBackground,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },

    orderInfo: {
      flex: 1,
      gap: 5,
    },

    orderName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
    },

    orderMeta: {
      color: colors.textSecondary,
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
      backgroundColor: colors.border,
    },

    footerNote: {
      alignItems: "center",
      paddingTop: 5,
    },

    footerNoteText: {
      color: colors.textSecondary,
      fontSize: 10,
    },
  });
}

type DashboardStyles = ReturnType<typeof createStyles>;
