
import { BellRing, Clock3 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AppColors } from "@/constants/colors";
import { AppNotification } from "@/types/notifications.types";


interface NotificationItemProps {
  notification: AppNotification;
  colors: AppColors;
  onPress: () => void;
}

export function NotificationItem({
  notification,
  colors,
  onPress,
}: NotificationItemProps) {
  const isUnread = !notification.read_at;

  const date = new Date(notification.created_at);

  const formattedDate = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: isUnread
            ? colors.primaryLight
            : colors.surface,
          borderColor: colors.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.message}`}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.iconBackground },
        ]}
      >
        <BellRing color={colors.primary} size={20} />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {notification.title}
        </Text>

        <Text
          style={[styles.message, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {notification.message}
        </Text>

        <View style={styles.deliveryInfo}>
          <Clock3 color={colors.textSecondary} size={13} />

          <Text
            style={[
              styles.deliveryText,
              { color: colors.textSecondary },
            ]}
          >
            Delivery:{" "}
            {new Date(notification.delivery_at).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.rightContent}>
        <Text
          style={[styles.date, { color: colors.textSecondary }]}
        >
          {formattedDate}
        </Text>

        <Text
          style={[styles.time, { color: colors.textSecondary }]}
        >
          {formattedTime}
        </Text>

        {isUnread && (
          <View
            style={[
              styles.unreadIndicator,
              { backgroundColor: colors.primary },
            ]}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    gap: 12,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    gap: 6,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
  },

  message: {
    fontSize: 13,
    lineHeight: 19,
  },

  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },

  deliveryText: {
    fontSize: 11,
    flexShrink: 1,
  },

  rightContent: {
    alignItems: "flex-end",
    gap: 4,
  },

  date: {
    fontSize: 11,
    fontWeight: "600",
  },

  time: {
    fontSize: 10,
  },

  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
});
