
import { NotificationItem } from "@/components/notifications/notificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/providers/ThemeProvider";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react-native";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refresh,
    markAsRead,
    markAllAsRead,
    isMarkingAllRead,
  } = useNotifications();

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace("/(tabs)/settings/")}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft color={colors.text} size={22} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Bell color={colors.primary} size={21} />
        </View>
      </View>

      <View style={styles.actions}>
        <Text style={styles.sectionTitle}>Recent activity</Text>

        {unreadCount > 0 && (
          <Pressable
            onPress={() => markAllAsRead()}
            disabled={isMarkingAllRead}
            style={styles.markAllButton}
          >
            <CheckCheck color={colors.primary} size={16} />

            <Text style={styles.markAllText}>
              {isMarkingAllRead ? "Updating..." : "Mark all read"}
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.stateText}>Loading notifications...</Text>
        </View>
      ) : isError ? (
        <View style={styles.stateContainer}>
          <Bell color={colors.textSecondary} size={30} />

          <Text style={styles.stateTitle}>
            Couldn't load notifications
          </Text>

          <Text style={styles.stateText}>
            Check your connection and try again.
          </Text>

          <Pressable onPress={() => refresh()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            notifications.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => refresh()}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              colors={colors}
              onPress={() => {
                if (!item.read_at) {
                  markAsRead(item.id);
                }
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.stateContainer}>
              <View style={styles.emptyIcon}>
                <Bell color={colors.textSecondary} size={28} />
              </View>

              <Text style={styles.stateTitle}>
                No notifications yet
              </Text>

              <Text style={styles.stateText}>
                You'll see reminders and important updates about your
                laundry orders here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 18,
      gap: 13,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },

    headerText: {
      flex: 1,
      gap: 3,
    },

    title: {
      fontSize: 21,
      fontWeight: "800",
      color: colors.text,
    },

    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
    },

    headerIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },

    actions: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },

    markAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    markAllText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
    },

    list: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },

    emptyList: {
      flexGrow: 1,
      justifyContent: "center",
    },

    stateContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 30,
      gap: 10,
    },

    stateTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },

    stateText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },

    retryText: {
      color: colors.primary,
      fontWeight: "700",
      marginTop: 5,
    },

    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 5,
    },
  });
}
